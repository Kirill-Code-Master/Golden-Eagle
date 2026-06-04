import 'dotenv/config'
import cors from 'cors'
import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'golden-eagle-back' })
})

app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`)
})
