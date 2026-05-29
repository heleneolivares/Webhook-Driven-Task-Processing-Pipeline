import express from 'express'
import dotenv from 'dotenv'
import pipelinesRouter from './modules/pipelines/routes'
import subscribersRouter from './modules/subscribers/routes'
import webhooksRouter from './modules/webhooks/routes'
import jobsRouter from './modules/jobs/routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/pipelines', pipelinesRouter)
app.use('/subscribers', subscribersRouter)
app.use('/webhooks', webhooksRouter)
app.use('/jobs', jobsRouter)

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`)
})

export default app  