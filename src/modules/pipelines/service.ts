import { v4 as uuidv4 } from 'uuid'
import * as queries from './queries'

const VALID_ACTION_TYPES = ['filter', 'ai_analysis', 'aggregate']

export async function getAllPipelines() {
  return await queries.getAllPipelines()
}

export async function getPipelineById(id: string) {
  const pipeline = await queries.getPipelineById(id)
  if (!pipeline) throw new Error('Pipeline not found')
  return pipeline
}

export async function createPipeline(data: {
  name: string
  actionType: string
  actionConfig: Record<string, unknown>
}) {
  if (!VALID_ACTION_TYPES.includes(data.actionType)) {
    throw new Error(`Invalid action type. Must be one of: ${VALID_ACTION_TYPES.join(', ')}`)
  }

  const sourceKey = uuidv4()

  return await queries.createPipeline({
    name: data.name,
    sourceKey,
    actionType: data.actionType,
    actionConfig: data.actionConfig,
  })
}

export async function updatePipeline(id: string, data: {
  name?: string
  actionType?: string
  actionConfig?: Record<string, unknown>
  isActive?: boolean
}) {
  const pipeline = await queries.getPipelineById(id)
  if (!pipeline) throw new Error('Pipeline not found')

  if (data.actionType && !VALID_ACTION_TYPES.includes(data.actionType)) {
    throw new Error(`Invalid action type. Must be one of: ${VALID_ACTION_TYPES.join(', ')}`)
  }

  return await queries.updatePipeline(id, data)
}

export async function deletePipeline(id: string) {
  const pipeline = await queries.getPipelineById(id)
  if (!pipeline) throw new Error('Pipeline not found')
  if (pipeline.deletedAt) throw new Error('Pipeline already deleted')

  return await queries.softDeletePipeline(id)
}