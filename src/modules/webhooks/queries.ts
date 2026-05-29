import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { webhookEvents, jobs, NewWebhookEvent } from '../../db/schema'

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