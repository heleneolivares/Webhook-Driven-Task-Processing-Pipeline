import express from 'express'
import dotenv from 'dotenv'
import pipelinesRouter from './modules/pipelines/routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/pipelines', pipelinesRouter)

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`)
})

export default app