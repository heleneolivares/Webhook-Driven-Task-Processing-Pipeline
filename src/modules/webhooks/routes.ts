import { Router, Request, Response } from 'express'
import * as service from './service'

const router = Router()

router.post('/:sourceKey', async (req: Request, res: Response) => {
  try {
    const sourceKey = req.params.sourceKey as string
    const payload = req.body

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Payload is required' })
    }

    const result = await service.ingestWebhook(sourceKey, payload)
    res.status(202).json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router