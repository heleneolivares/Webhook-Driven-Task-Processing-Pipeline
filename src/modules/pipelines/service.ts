import { v4 as uuidv4 } from 'uuid'
import * as queries from './queries'
import { AppError } from '../../shared/middleware/errorHandler'
import { ERRORS } from '../../shared/middleware/errors'


const VALID_ACTION_TYPES = ['filter', 'ai_analysis', 'aggregate']

export async function getAllPipelines() {
  return await queries.getAllPipelines()
}

export async function getPipelineById(id: string) {
  const pipeline = await queries.getPipelineById(id)
  if (!pipeline) throw new AppError(ERRORS.PIPELINE_NOT_FOUND, 404)
  return pipeline
}

export async function createPipeline(data: {
  name: string
  actionType: string
  actionConfig: Record<string, unknown>
}) {
  if (!VALID_ACTION_TYPES.includes(data.actionType)) {
    throw new AppError(ERRORS.PIPELINE_INVALID_ACTION_TYPE, 400)
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
  if (!pipeline) throw new AppError(ERRORS.PIPELINE_NOT_FOUND, 404)

  if (data.actionType && !VALID_ACTION_TYPES.includes(data.actionType)) {
    throw new AppError(ERRORS.PIPELINE_INVALID_ACTION_TYPE, 400)
  }

  return await queries.updatePipeline(id, data)
}

export async function deletePipeline(id: string) {
  const pipeline = await queries.getPipelineById(id)
  if (!pipeline) throw new AppError(ERRORS.PIPELINE_NOT_FOUND, 404)
  if (pipeline.deletedAt) throw new AppError(ERRORS.PIPELINE_ALREADY_DELETED, 400)

  return await queries.softDeletePipeline(id)
}