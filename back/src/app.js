import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import Product from './product.js'
import User from './user.js'
import { hashPassword, verifyPassword } from './password.js'
import { verifyToken } from './token.js'
import swaggerDocument from './swagger.js'

const app = express()
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const appendAndCondition = (filter, condition) => {
  filter.$and = filter.$and || []
  filter.$and.push(condition)
}

app.use(cors())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument)
})

// Authentication middleware to populate req.user
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
    }
  }
  next()
}

app.use(authenticate)

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'golden-eagle-back'
  })
})

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Ім’я користувача та пароль обов’язкові.' })
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Ім’я користувача має бути не менше 3 символів.' })
    }



    const existingUser = await User.findOne({ username: username.trim() })
    if (existingUser) {
      return res.status(400).json({ message: 'Користувач з таким ім’ям вже існує.' })
    }

    const hashedPassword = hashPassword(password)
    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
      role: 'user' // Default registered user role
    })

    await newUser.save()

    res.status(201).json({
      message: 'Реєстрація успішна.',
      user: {
        username: newUser.username,
        role: newUser.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера при реєстрації.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Ім’я користувача та пароль обов’язкові.' })
    }

    const user = await User.findOne({ username: username.trim() })
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(400).json({ message: 'Некоректне ім’я користувача або пароль.' })
    }

    // Generate token helper
    const { generateToken } = await import('./token.js')
    const token = generateToken(user)

    res.json({
      token,
      user: {
        username: user.username,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера при вході.' })
  }
})

// Orders route - only registered/admin users can place orders
app.post('/api/orders', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Тільки зареєстровані користувачі можуть оформляти замовлення.' })
  }

  const { items } = req.body
  if (!items || !items.length) {
    return res.status(400).json({ message: 'Кошик порожній.' })
  }

  res.json({
    success: true,
    message: 'Замовлення успішно оформлено! Дякуємо за покупку.'
  })
})

app.get('/api/products', async (req, res) => {
  try {
    const {
      sortBy,
      order = 'asc',
      category,
      material,
      search,
      page = 1,
      limit = 15
    } = req.query

    const filter = {}

    if (category) {
      filter.category = {
        $in: category.split(',')
      }
    }

    if (material) {
      const materialFilters = material
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => ({
          material: {
            $regex: escapeRegex(value),
            $options: 'i'
          }
        }))

      if (materialFilters.length) {
        appendAndCondition(filter, { $or: materialFilters })
      }
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          category: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          material: {
            $regex: search,
            $options: 'i'
          }
        }
      ]
    }

    const allowedSortFields = ['price', 'name']

    const pageNumber = Math.max(Number(page), 1)
    const pageSize = Math.min(Math.max(Number(limit), 1), 50)

    let query = Product.find(filter)

    if (allowedSortFields.includes(sortBy)) {
      query = query.sort({
        [sortBy]: order === 'desc' ? -1 : 1
      })
    }

    const total = await Product.countDocuments(filter)

    const products = await query
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)

    res.json({
      products,
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/products', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ заборонено. Тільки для адміністраторів.' })
    }

    const {
      name,
      price,
      category,
      material,
      description,
      image,
      stock
    } = req.body

    if (!name || price == null) {
      return res.status(400).json({
        message: 'name and price are required'
      })
    }

    const newProduct = new Product({
      name,
      price,
      category,
      material,
      description,
      image,
      stock
    })

    await newProduct.save()

    res.status(201).json(newProduct)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.put('/api/products/:id', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ заборонено. Тільки для адміністраторів.' })
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(updatedProduct)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ заборонено. Тільки для адміністраторів.' })
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id)
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default app
