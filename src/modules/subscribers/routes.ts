import { Router, Request, Response, NextFunction } from 'express'
import * as service from './service'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscribers = await service.getAllSubscribers()
    res.json({ subscribers })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const subscriber = await service.getSubscriberById(id)
    res.json({ subscriber })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetUrl } = req.body
    if (!targetUrl) {
      return res.status(400).json({ error: 'targetUrl is required' })
    }
    const subscriber = await service.createSubscriber({ targetUrl })
    res.status(201).json({ subscriber })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const subscriber = await service.updateSubscriber(id, req.body)
    res.json({ subscriber })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const subscriber = await service.deleteSubscriber(id)
    res.json({ message: 'Subscriber deleted successfully', subscriber })
  } catch (error) {
    next(error)
  }
})

router.post('/:id/pipelines/:pipelineId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriberId = req.params.id as string
    const pipelineId = req.params.pipelineId as string
    const result = await service.linkSubscriberToPipeline(pipelineId, subscriberId)
    res.status(201).json({ message: 'Subscriber linked to pipeline', result })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id/pipelines/:pipelineId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriberId = req.params.id as string
    const pipelineId = req.params.pipelineId as string
    await service.unlinkSubscriberFromPipeline(pipelineId, subscriberId)
    res.json({ message: 'Subscriber unlinked from pipeline' })
  } catch (error) {
    next(error)
  }
})

export default router