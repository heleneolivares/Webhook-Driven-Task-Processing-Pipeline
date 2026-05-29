import * as queries from './queries'

export async function getAllSubscribers() {
  return await queries.getAllSubscribers()
}

export async function getSubscriberById(id: string) {
  const subscriber = await queries.getSubscriberById(id)
  if (!subscriber) throw new Error('Subscriber not found')
  return subscriber
}

export async function getSubscribersByPipelineId(pipelineId: string) {
  return await queries.getSubscribersByPipelineId(pipelineId)
}

export async function createSubscriber(data: { targetUrl: string }) {
  if (!data.targetUrl) throw new Error('targetUrl is required')

  const url = data.targetUrl.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('targetUrl must be a valid URL starting with http:// or https://')
  }

  return await queries.createSubscriber({ targetUrl: url })
}

export async function updateSubscriber(id: string, data: {
  targetUrl?: string
  isActive?: boolean
}) {
  const subscriber = await queries.getSubscriberById(id)
  if (!subscriber) throw new Error('Subscriber not found')

  if (data.targetUrl) {
    const url = data.targetUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('targetUrl must be a valid URL starting with http:// or https://')
    }
  }

  return await queries.updateSubscriber(id, data)
}

export async function deleteSubscriber(id: string) {
  const subscriber = await queries.getSubscriberById(id)
  if (!subscriber) throw new Error('Subscriber not found')
  if (subscriber.deletedAt) throw new Error('Subscriber already deleted')

  return await queries.softDeleteSubscriber(id)
}

export async function linkSubscriberToPipeline(pipelineId: string, subscriberId: string) {
  const subscriber = await queries.getSubscriberById(subscriberId)
  if (!subscriber) throw new Error('Subscriber not found')

  return await queries.linkSubscriberToPipeline(pipelineId, subscriberId)
}

export async function unlinkSubscriberFromPipeline(pipelineId: string, subscriberId: string) {
  return await queries.unlinkSubscriberFromPipeline(pipelineId, subscriberId)
}