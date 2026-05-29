import * as queries from './queries'

export async function getAllJobs() {
  return await queries.getAllJobs()
}

export async function getJobById(id: string) {
  const job = await queries.getJobById(id)
  if (!job) throw new Error('Job not found')
  return job
}

export async function getDeliveryAttemptsByJobId(jobId: string) {
  const job = await queries.getJobById(jobId)
  if (!job) throw new Error('Job not found')
  return await queries.getDeliveryAttemptsByJobId(jobId)
}