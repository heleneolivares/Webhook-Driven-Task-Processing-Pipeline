import { eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { pipelines, NewPipeline } from '../../db/schema'

export async function getAllPipelines() {
  return await db
    .select()
    .from(pipelines)
    .where(isNull(pipelines.deletedAt))
}

export async function getPipelineById(id: string) {
  const result = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.id, id))
  return result[0] || null
}

export async function getPipelineBySourceKey(sourceKey: string) {
  const result = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.sourceKey, sourceKey))
  return result[0] || null
}

export async function createPipeline(data: NewPipeline) {
  const result = await db
    .insert(pipelines)
    .values(data)
    .returning()
  return result[0]
}

export async function updatePipeline(id: string, data: Partial<NewPipeline>) {
  const result = await db
    .update(pipelines)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pipelines.id, id))
    .returning()
  return result[0]
}

export async function softDeletePipeline(id: string) {
  const result = await db
    .update(pipelines)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(pipelines.id, id))
    .returning()
  return result[0]
}