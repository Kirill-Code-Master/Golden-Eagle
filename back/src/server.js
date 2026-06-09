import 'dotenv/config'
import app from './app.js'
import connectDB from './db.js'
import dns from 'node:dns'

if (process.env.CUSTOM_DNS === '1') {
  dns.setServers(['1.1.1.1', '8.8.8.8'])
}

const port = process.env.PORT || 3000

connectDB()

app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`)
})
