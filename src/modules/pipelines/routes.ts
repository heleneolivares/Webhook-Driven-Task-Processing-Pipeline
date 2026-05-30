import { Router, Request, Response, NextFunction } from 'express'
import * as service from './service'
import { validateUUID } from '../../shared/middleware/validateUUID'

const router = Router()

router.get('/', async (req: Request, res: Response, next: Function) => {
  try {
    const pipelines = await service.getAllPipelines()
    res.json({ pipelines })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', validateUUID('id'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const pipeline = await service.getPipelineById(id)
    res.json({ pipeline })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, actionType, actionConfig } = req.body

    if (!name || !actionType || !actionConfig) {
      return res.status(400).json({ error: 'name, actionType and actionConfig are required' })
    }

    const pipeline = await service.createPipeline({ name, actionType, actionConfig })
    res.status(201).json({ pipeline })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', validateUUID('id'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const pipeline = await service.updatePipeline(id, req.body)
    res.json({ pipeline })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id',validateUUID('id'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const pipeline = await service.deletePipeline(id)
    res.json({ message: 'Pipeline deleted successfully', pipeline })
  } catch (error) {
    next(error)
  }
})

export default router