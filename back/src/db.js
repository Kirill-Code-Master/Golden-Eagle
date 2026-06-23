import mongoose from 'mongoose'
import 'dotenv/config'
import User from './user.js'
import { hashPassword } from './password.js'

const connectDB = async () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('MongoDB connection error: DATABASE_URL is not defined in .env')
    process.exit(1)
  }

  try {
    await mongoose.connect(databaseUrl)
    console.log('MongoDB connected')

    // Seed default admin account
    const adminExists = await User.findOne({ username: 'admin' })
    if (!adminExists) {
      const hashedPassword = hashPassword('admin')
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      })
      await admin.save()
      console.log('Default admin account seeded successfully.')
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

export default connectDB
