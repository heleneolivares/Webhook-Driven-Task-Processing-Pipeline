import { Router, Request, Response, NextFunction } from 'express'
import * as service from './service'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await service.getAllJobs()
    res.json({ jobs })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const job = await service.getJobById(id)
    res.json({ job })
  } catch (error) {
    next(error)
  }
})

router.get('/:id/delivery-attempts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const attempts = await service.getDeliveryAttemptsByJobId(id)
    res.json({ deliveryAttempts: attempts })
  } catch (error) {
    next(error)
  }
})

export default router