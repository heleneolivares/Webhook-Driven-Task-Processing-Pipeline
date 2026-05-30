import * as queries from './queries'
import { AppError } from '../../shared/middleware/errorHandler'
import { ERRORS } from '../../shared/middleware/errors'


export async function getAllSubscribers() {
  return await queries.getAllSubscribers()
}

export async function getSubscriberById(id: string) {
  const subscriber = await queries.getSubscriberById(id)
  if (!subscriber) throw new AppError(ERRORS.SUBSCRIBER_NOT_FOUND, 404)
  return subscriber
}

export async function getSubscribersByPipelineId(pipelineId: string) {
  return await queries.getSubscribersByPipelineId(pipelineId)
}

export async function createSubscriber(data: { targetUrl: string }) {
  if (!data.targetUrl) throw new AppError(ERRORS.SUBSCRIBER_INVALID_URL, 400)

  const url = data.targetUrl.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new AppError(ERRORS.SUBSCRIBER_INVALID_URL, 400)
  }

  return await queries.createSubscriber({ targetUrl: url })
}

export async function updateSubscriber(id: string, data: {
  targetUrl?: string
  isActive?: boolean
}) {
  const subscriber = await queries.getSubscriberById(id)
  if (!subscriber) throw new AppError(ERRORS.SUBSCRIBER_NOT_FOUND, 404)

  if (data.targetUrl) {
    const url = data.targetUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new AppError(ERRORS.SUBSCRIBER_INVALID_URL, 400)
    }
  }

  return await queries.updateSubscriber(id, data)
}

export async function deleteSubscriber(id: string) {
  const subscriber = await queries.getSubscriberById(id)
  if (!subscriber) throw new AppError(ERRORS.SUBSCRIBER_NOT_FOUND, 404)
  if (subscriber.deletedAt) throw new AppError(ERRORS.SUBSCRIBER_ALREADY_DELETED, 400)

  return await queries.softDeleteSubscriber(id)
}

export async function linkSubscriberToPipeline(pipelineId: string, subscriberId: string) {
  const subscriber = await queries.getSubscriberById(subscriberId)
  if (!subscriber) throw new AppError(ERRORS.SUBSCRIBER_NOT_FOUND, 404)

  return await queries.linkSubscriberToPipeline(pipelineId, subscriberId)
}

export async function unlinkSubscriberFromPipeline(pipelineId: string, subscriberId: string) {
  return await queries.unlinkSubscriberFromPipeline(pipelineId, subscriberId)
}