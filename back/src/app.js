import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_FILE = path.join(__dirname, 'data', 'products.json')

app.use(cors())
app.use(express.json())


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'golden-eagle-back'
  })
})


const readProducts = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(data)
}

const writeProducts = (products) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2))
}


app.get('/api/products', (req, res) => {
  const products = readProducts()
  res.json(products)
})


app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id)

  const products = readProducts()

  const product = products.find(p => p.id === id)

  if (!product) {
    return res.status(404).json({
      message: 'Product not found'
    })
  }

  res.json(product)
})


app.post('/api/products', (req, res) => {
  const { name, price, category, image, stock } = req.body

  if (!name || !price) {
    return res.status(400).json({
      message: 'name and price are required'
    })
  }

  const products = readProducts()

  const newProduct = {
    id:
      products.length > 0
        ? Math.max(...products.map(p => p.id)) + 1
        : 1,
    name,
    price,
    category: category || '',
    image: image || '',
    stock: stock || 0
  }

  products.push(newProduct)

  writeProducts(products)

  res.status(201).json(newProduct)
})


app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id)

  const products = readProducts()

  const index = products.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({
      message: 'Product not found'
    })
  }

  products[index] = {
    ...products[index],
    ...req.body,
    id
  }

  writeProducts(products)

  res.json(products[index])
})


app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id)

  const products = readProducts()

  const filteredProducts = products.filter(
    product => product.id !== id
  )

  if (filteredProducts.length === products.length) {
    return res.status(404).json({
      message: 'Product not found'
    })
  }

  writeProducts(filteredProducts)

  res.status(204).send()
})

export default app
