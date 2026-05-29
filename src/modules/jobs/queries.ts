import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { jobs, deliveryAttempts } from '../../db/schema'

export async function getAllJobs() {
  return await db.select().from(jobs)
}

export async function getJobById(id: string) {
  const result = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
  return result[0] || null
}

export async function getDeliveryAttemptsByJobId(jobId: string) {
  return await db
    .select()
    .from(deliveryAttempts)
    .where(eq(deliveryAttempts.jobId, jobId))
}