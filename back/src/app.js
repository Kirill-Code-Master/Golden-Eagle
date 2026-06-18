import express from 'express'
import cors from 'cors'
import Product from './product.js'  

const app = express()
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'golden-eagle-back'
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
      limit = 20
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
        .map((value) => new RegExp(escapeRegex(value), 'i'))

      if (materialFilters.length) {
        filter.material = {
          $in: materialFilters
        }
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
    const {
      name,
      price,
      category,
      material,
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
