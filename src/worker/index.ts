import * as dotenv from 'dotenv'
dotenv.config()

import { db } from '../db'
import { jobs, webhookEvents, pipelines, pipelineSubscribers, subscribers, deliveryAttempts } from '../db/schema'
import { eq, and, isNull, lte } from 'drizzle-orm'
import { applyFilter } from '../processing/actions/filter'
import { applyAiAnalysis } from '../processing/actions/ai_analysis'
import { applyAggregate } from '../processing/actions/aggregate'
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