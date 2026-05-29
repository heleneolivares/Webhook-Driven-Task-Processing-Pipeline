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