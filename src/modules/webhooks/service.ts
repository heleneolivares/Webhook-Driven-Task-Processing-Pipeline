import * as queries from './queries'
import { getPipelineBySourceKey } from '../pipelines/queries'

export async function ingestWebhook(sourceKey: string, payload: Record<string, unknown>) {
  const pipeline = await getPipelineBySourceKey(sourceKey)

  if (!pipeline) {
    throw new Error('Pipeline not found')
  }

  if (!pipeline.isActive || pipeline.deletedAt) {
    throw new Error('Pipeline is not active')
  }
  
  if (pipeline.actionType === 'aggregate') {
    return await handleAggregateIngestion(pipeline, payload)
  }

  const event = await queries.createWebhookEvent({
    pipelineId: pipeline.id,
    payload,
  })

  const job = await queries.createJob(event.id, pipeline.id)

  return {
    message: 'Webhook accepted',
    eventId: event.id,
    jobId: job.id,
    status: job.status
  }
}
async function handleAggregateIngestion(
  pipeline: { id: string; actionConfig: Record<string, unknown> },
  payload: Record<string, unknown>
) {
  const config = pipeline.actionConfig as { windowMinutes?: number; maxEvents?: number }
  const windowMinutes = config.windowMinutes || 60

  let bucket = await queries.getOpenBucketByPipelineId(pipeline.id)

  if (!bucket) {
    bucket = await queries.createBucket(pipeline.id, windowMinutes)
  }

  const event = await queries.createWebhookEvent({
    pipelineId: pipeline.id,
    bucketId: bucket.id,
    payload,
  })

  const updatedBucket = await queries.addEventToBucket(bucket.id, bucket.eventsCount)

  const maxEvents = config.maxEvents
  if (maxEvents && updatedBucket.eventsCount >= maxEvents) {
    await queries.closeBucket(bucket.id)
    return {
      message: 'Webhook accepted - bucket closed (max events reached)',
      eventId: event.id,
      bucketId: bucket.id,
      eventsCount: updatedBucket.eventsCount,
      status: 'bucket_closed'
    }
  }

  return {
    message: 'Webhook accepted - added to aggregation bucket',
    eventId: event.id,
    bucketId: bucket.id,
    eventsCount: updatedBucket.eventsCount,
    status: 'aggregating'
  }
}