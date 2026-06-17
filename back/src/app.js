import express from 'express'
import cors from 'cors'
import Product from './product.js'  

const app = express()

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
      search
    } = req.query

    const filter = {}

    if (category) {
      filter.category = {
        $in: category.split(',')
      }
    }

    if (material) {
      filter.material = {
        $in: material.split(',')
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

    let query = Product.find(filter)

    if (allowedSortFields.includes(sortBy)) {
      query = query.sort({
        [sortBy]: order === 'desc' ? -1 : 1
      })
    }

    const products = await query

    res.json(products)
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
    const { name, price, category, image, stock } = req.body
    if (!name || !price) {
      return res.status(400).json({ message: 'name and price are required' })
    }
    const newProduct = new Product({ name, price, category, image, stock })
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
