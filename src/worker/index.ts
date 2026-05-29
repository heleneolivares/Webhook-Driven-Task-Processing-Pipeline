import * as dotenv from 'dotenv'
dotenv.config()

import { db } from '../db'
import { jobs, webhookEvents, pipelines, pipelineSubscribers, subscribers, deliveryAttempts } from '../db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { applyFilter } from '../processing/actions/filter'
import { applyAiAnalysis } from '../processing/actions/ai_analysis'
import { applyAggregate } from '../processing/actions/aggregate'
import * as webhookQueries from '../modules/webhooks/queries'
import axios from 'axios'

const POLL_INTERVAL_MS = 3000
const MAX_DELIVERY_ATTEMPTS = 3

async function processJob(job: any) {
  console.log(`Processing job ${job.id}...`)

  await db.update(jobs)
    .set({ status: 'processing', updatedAt: new Date() })
    .where(eq(jobs.id, job.id))

  try {
    const event = await db.query.webhookEvents.findFirst({
      where: eq(webhookEvents.id, job.eventId)
    })

    if (!event) throw new Error('Event not found')

    const pipeline = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, job.pipelineId)
    })

    if (!pipeline) throw new Error('Pipeline not found')

    const payload = event.payload as Record<string, unknown>
    const config = pipeline.actionConfig as Record<string, unknown>

    let result: Record<string, unknown> = {}
    let skipped = false

    if (pipeline.actionType === 'filter') {
      const filterResult = applyFilter(payload, config as any)
      if (!filterResult.passed) {
        skipped = true
        console.log(`Job ${job.id} skipped: ${filterResult.reason}`)
      } else {
        result = filterResult.payload
      }
    } else if (pipeline.actionType === 'ai_analysis') {
      result = await applyAiAnalysis(payload, config as any) as any
    } else if (pipeline.actionType === 'aggregate') {
      const events = payload.events as Record<string, unknown>[]
      result = applyAggregate([payload], config as any) as any
    }

    if (skipped) {
      await db.update(jobs)
        .set({ status: 'skipped', updatedAt: new Date(), completedAt: new Date() })
        .where(eq(jobs.id, job.id))
      return
    }

    await deliverToSubscribers(job.id, job.pipelineId, result)

    await db.update(jobs)
      .set({ status: 'completed', updatedAt: new Date(), completedAt: new Date() })
      .where(eq(jobs.id, job.id))

    console.log(`Job ${job.id} completed successfully`)

  } catch (error: any) {
    console.error(`Job ${job.id} failed:`, error.message)
    await db.update(jobs)
      .set({
        status: 'failed',
        lastError: error.message,
        updatedAt: new Date(),
        completedAt: new Date()
      })
      .where(eq(jobs.id, job.id))
  }
}
async function processExpiredBuckets() {
  const expiredBuckets = await webhookQueries.getExpiredBuckets()

  for (const bucket of expiredBuckets) {
    console.log(`Processing expired bucket ${bucket.id} with ${bucket.eventsCount} events...`)

    await webhookQueries.closeBucket(bucket.id)

    const events = await webhookQueries.getEventsByBucketId(bucket.id)

    if (events.length === 0) {
      await webhookQueries.markBucketAsProcessed(bucket.id)
      console.log(`Bucket ${bucket.id} was empty, skipping`)
      continue
    }

    const pipeline = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, bucket.pipelineId)
    })

    if (!pipeline) {
      await webhookQueries.markBucketAsProcessed(bucket.id)
      continue
    }

    const config = pipeline.actionConfig as {
      windowMinutes?: number
      maxEvents?: number
      filter?: { field: string; operator: string; value: unknown }
      prompt?: string
    }

    let filteredEvents = events.map(e => e.payload as Record<string, unknown>)

    if (config.filter) {
      filteredEvents = filteredEvents.filter(payload => {
        const result = applyFilter(payload, config.filter as any)
        return result.passed
      })
      console.log(`Filter applied: ${filteredEvents.length}/${events.length} events passed`)
    }

    if (filteredEvents.length === 0) {
      await webhookQueries.markBucketAsProcessed(bucket.id)
      console.log(`Bucket ${bucket.id} — no events passed the filter, skipping`)
      continue
    }

    const aggregateResult = applyAggregate(filteredEvents, config as any)

    const prompt = config.prompt || 'Analyze these products and identify the best deals, price trends, and recommendations'

    const aiResult = await applyAiAnalysis(
      { ...aggregateResult, events: filteredEvents },
      { prompt }
    )

    const syntheticEvent = await webhookQueries.createWebhookEvent({
      pipelineId: bucket.pipelineId,
      payload: aiResult as unknown as Record<string, unknown>
    })

    const job = await webhookQueries.createAggregateJob(bucket.id, bucket.pipelineId, syntheticEvent.id)
    await webhookQueries.markBucketAsProcessed(bucket.id)

    await deliverToSubscribers(job.id, job.pipelineId, aiResult as unknown as Record<string, unknown>)

    await db.update(jobs)
      .set({ status: 'completed', updatedAt: new Date(), completedAt: new Date() })
      .where(eq(jobs.id, job.id))

    console.log(`Bucket ${bucket.id} processed — delivered AI analysis of ${filteredEvents.length} events`)
  }
}

async function deliverToSubscribers(
  jobId: string,
  pipelineId: string,
  result: Record<string, unknown>
) {
  const pipelineSubs = await db
    .select({ subscriber: subscribers })
    .from(subscribers)
    .innerJoin(pipelineSubscribers, eq(pipelineSubscribers.subscriberId, subscribers.id))
    .where(
      and(
        eq(pipelineSubscribers.pipelineId, pipelineId),
        eq(subscribers.isActive, true),
        isNull(subscribers.deletedAt)
      )
    )

  for (const { subscriber } of pipelineSubs) {
    let delivered = false
    let lastError = ''
    let statusCode = 0

    for (let attempt = 1; attempt <= MAX_DELIVERY_ATTEMPTS; attempt++) {
      try {
        const response = await axios.post(subscriber.targetUrl, result, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        })
        statusCode = response.status
        delivered = true

        await db.insert(deliveryAttempts).values({
          jobId,
          subscriberId: subscriber.id,
          attemptNumber: attempt,
          status: 'success',
          responseStatusCode: statusCode,
          deliveredAt: new Date()
        })

        console.log(`Delivered to ${subscriber.targetUrl} on attempt ${attempt}`)
        break

      } catch (error: any) {
        lastError = error.message
        statusCode = error.response?.status || 0

        await db.insert(deliveryAttempts).values({
          jobId,
          subscriberId: subscriber.id,
          attemptNumber: attempt,
          status: 'failed',
          responseStatusCode: statusCode,
          errorMessage: lastError
        })

        console.error(`Delivery attempt ${attempt} failed for ${subscriber.targetUrl}: ${lastError}`)

        if (attempt < MAX_DELIVERY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000))
        }
      }
    }

    if (!delivered) {
      console.error(`All delivery attempts failed for ${subscriber.targetUrl}`)
    }
  }
}

async function pollJobs() {
  try {
    await processExpiredBuckets()
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.status, 'pending')
    })

    if (job) {
      await processJob(job)
    }
  } catch (error: any) {
    console.error('Worker error:', error.message)
  }
}

console.log('Worker started, polling for jobs...')
setInterval(pollJobs, POLL_INTERVAL_MS)