import mongoose from 'mongoose'
import 'dotenv/config'

const connectDB = async () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('MongoDB connection error: DATABASE_URL is not defined in .env')
    process.exit(1)
  }

  try {
    await mongoose.connect(databaseUrl)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

export default connectDB
