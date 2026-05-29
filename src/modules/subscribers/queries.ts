import { eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { subscribers, pipelineSubscribers, NewSubscriber } from '../../db/schema'

export async function getAllSubscribers() {
  return await db
    .select()
    .from(subscribers)
    .where(isNull(subscribers.deletedAt))
}

export async function getSubscriberById(id: string) {
  const result = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.id, id))
  return result[0] || null
}

export async function getSubscribersByPipelineId(pipelineId: string) {
  return await db
    .select({ subscriber: subscribers })
    .from(subscribers)
    .innerJoin(pipelineSubscribers, eq(pipelineSubscribers.subscriberId, subscribers.id))
    .where(eq(pipelineSubscribers.pipelineId, pipelineId))
}

export async function createSubscriber(data: NewSubscriber) {
  const result = await db
    .insert(subscribers)
    .values(data)
    .returning()
  return result[0]
}

export async function updateSubscriber(id: string, data: Partial<NewSubscriber>) {
  const result = await db
    .update(subscribers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscribers.id, id))
    .returning()
  return result[0]
}

export async function softDeleteSubscriber(id: string) {
  const result = await db
    .update(subscribers)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(subscribers.id, id))
    .returning()
  return result[0]
}

export async function linkSubscriberToPipeline(pipelineId: string, subscriberId: string) {
  const result = await db
    .insert(pipelineSubscribers)
    .values({ pipelineId, subscriberId })
    .returning()
  return result[0]
}

export async function unlinkSubscriberFromPipeline(pipelineId: string, subscriberId: string) {
  const result = await db
    .delete(pipelineSubscribers)
    .where(eq(pipelineSubscribers.pipelineId, pipelineId))
    .returning()
  return result[0]
}