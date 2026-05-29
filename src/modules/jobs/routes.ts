import { Router, Request, Response } from 'express'
import * as service from './service'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const jobs = await service.getAllJobs()
    res.json({ jobs })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const job = await service.getJobById(id)
    res.json({ job })
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

router.get('/:id/delivery-attempts', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const attempts = await service.getDeliveryAttemptsByJobId(id)
    res.json({ deliveryAttempts: attempts })
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

export default router