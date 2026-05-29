import { Router, Request, Response } from 'express'
import * as service from './service'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const subscribers = await service.getAllSubscribers()
    res.json({ subscribers })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const subscriber = await service.getSubscriberById(id)
    res.json({ subscriber })
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { targetUrl } = req.body
    if (!targetUrl) {
      return res.status(400).json({ error: 'targetUrl is required' })
    }
    const subscriber = await service.createSubscriber({ targetUrl })
    res.status(201).json({ subscriber })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const subscriber = await service.updateSubscriber(id, req.body)
    res.json({ subscriber })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const subscriber = await service.deleteSubscriber(id)
    res.json({ message: 'Subscriber deleted successfully', subscriber })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/:id/pipelines/:pipelineId', async (req: Request, res: Response) => {
  try {
    const subscriberId = req.params.id as string
    const pipelineId = req.params.pipelineId as string
    const result = await service.linkSubscriberToPipeline(pipelineId, subscriberId)
    res.status(201).json({ message: 'Subscriber linked to pipeline', result })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id/pipelines/:pipelineId', async (req: Request, res: Response) => {
  try {
    const subscriberId = req.params.id as string
    const pipelineId = req.params.pipelineId as string
    await service.unlinkSubscriberFromPipeline(pipelineId, subscriberId)
    res.json({ message: 'Subscriber unlinked from pipeline' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router