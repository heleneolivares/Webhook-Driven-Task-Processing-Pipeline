import { Router, Request, Response } from 'express'
import * as service from './service'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const pipelines = await service.getAllPipelines()
    res.json({ pipelines })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const pipeline = await service.getPipelineById(id)
    res.json({ pipeline })
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, actionType, actionConfig } = req.body

    if (!name || !actionType || !actionConfig) {
      return res.status(400).json({ error: 'name, actionType and actionConfig are required' })
    }

    const pipeline = await service.createPipeline({ name, actionType, actionConfig })
    res.status(201).json({ pipeline })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const pipeline = await service.updatePipeline(id, req.body)
    res.json({ pipeline })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const pipeline = await service.deletePipeline(id)
    res.json({ message: 'Pipeline deleted successfully', pipeline })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router