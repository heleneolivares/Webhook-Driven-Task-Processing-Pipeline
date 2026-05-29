import { eq, and, lte, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { webhookEvents, jobs, NewWebhookEvent, aggregationBuckets } from '../../db/schema'

export async function createWebhookEvent(data: NewWebhookEvent) {
  const result = await db
    .insert(webhookEvents)
    .values(data)
    .returning()
  return result[0]
}

export async function createJob(eventId: string, pipelineId: string) {
  const result = await db
    .insert(jobs)
    .values({
      eventId,
      pipelineId,
      status: 'pending'
    })
    .returning()
  return result[0]
}
export async function getOpenBucketByPipelineId(pipelineId: string) {
  const result = await db
    .select()
    .from(aggregationBuckets)
    .where(
      and(
        eq(aggregationBuckets.pipelineId, pipelineId),
        eq(aggregationBuckets.status, 'open')
      )
    )
  return result[0] || null
}

export async function createBucket(pipelineId: string, windowMinutes: number) {
  const windowEnd = new Date(Date.now() + windowMinutes * 60 * 1000)
  const result = await db
    .insert(aggregationBuckets)
    .values({
      pipelineId,
      status: 'open',
      eventsCount: 0,
      windowEnd
    })
    .returning()
  return result[0]
}

export async function addEventToBucket(bucketId: string, eventsCount: number) {
  const result = await db
    .update(aggregationBuckets)
    .set({
      eventsCount: eventsCount + 1,
      updatedAt: new Date()
    })
    .where(eq(aggregationBuckets.id, bucketId))
    .returning()
  return result[0]
}

export async function getExpiredBuckets() {
  return await db
    .select()
    .from(aggregationBuckets)
    .where(
      and(
        eq(aggregationBuckets.status, 'open'),
        lte(aggregationBuckets.windowEnd, new Date())
      )
    )
}

export async function closeBucket(bucketId: string) {
  const result = await db
    .update(aggregationBuckets)
    .set({ status: 'closed', updatedAt: new Date() })
    .where(eq(aggregationBuckets.id, bucketId))
    .returning()
  return result[0]
}

export async function markBucketAsProcessed(bucketId: string) {
  const result = await db
    .update(aggregationBuckets)
    .set({ status: 'processed', updatedAt: new Date() })
    .where(eq(aggregationBuckets.id, bucketId))
    .returning()
  return result[0]
}

export async function getEventsByBucketId(bucketId: string) {
  return await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.bucketId, bucketId))
}

export async function createAggregateJob(bucketId: string, pipelineId: string, eventId: string) {
  const result = await db
    .insert(jobs)
    .values({
      eventId,
      pipelineId,
      status: 'pending'
    })
    .returning()
  return result[0]
}