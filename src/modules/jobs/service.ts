import * as queries from './queries'
import { AppError } from '../../shared/middleware/errorHandler'
import { ERRORS } from '../../shared/middleware/errors'

export async function getAllJobs() {
  return await queries.getAllJobs()
}

export async function getJobById(id: string) {
  const job = await queries.getJobById(id)
  if (!job) throw new AppError(ERRORS.JOB_NOT_FOUND, 404)
  return job
}

export async function getDeliveryAttemptsByJobId(jobId: string) {
  const job = await queries.getJobById(jobId)
  if (!job) throw new AppError(ERRORS.JOB_NOT_FOUND, 404)
  return await queries.getDeliveryAttemptsByJobId(jobId)
}