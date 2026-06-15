import 'dotenv/config'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import app from '../src/app.js'
import Product from '../src/product.js'

const TEST_CATEGORY = '__test__'

const makeProduct = (overrides = {}) => ({
  name: `Тестовий товар ${Date.now()}`,
  price: 1000,
  category: TEST_CATEGORY,
  image: '',
  stock: 3,
  ...overrides,
})

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('Для інтеграційних API-тестів потрібен DATABASE_URL')
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DATABASE_URL)
  }
})

afterEach(async () => {
  await Product.deleteMany({ category: TEST_CATEGORY })
})

afterAll(async () => {
  await Product.deleteMany({ category: TEST_CATEGORY })
  await mongoose.disconnect()
})

describe('Інтеграційні API-тести', () => {
  it('повертає статус працездатності сервісу', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'golden-eagle-back',
    })
  })

  it('створює товар і читає його назад з MongoDB', async () => {
    const product = makeProduct({ name: 'Тестова каблучка API', price: 2500 })

    const createRes = await request(app).post('/api/products').send(product)

    expect(createRes.status).toBe(201)
    expect(createRes.body).toMatchObject({
      name: product.name,
      price: product.price,
      category: TEST_CATEGORY,
      stock: product.stock,
    })

    const listRes = await request(app).get('/api/products')
    const createdFromList = listRes.body.find((item) => item._id === createRes.body._id)

    expect(listRes.status).toBe(200)
    expect(createdFromList).toMatchObject({ name: product.name })

    const singleRes = await request(app).get(`/api/products/${createRes.body._id}`)

    expect(singleRes.status).toBe(200)
    expect(singleRes.body).toMatchObject({ name: product.name })
  })

  it('оновлює та видаляє товар', async () => {
    const product = await Product.create(makeProduct({ name: 'До оновлення' }))

    const updateRes = await request(app)
      .put(`/api/products/${product._id}`)
      .send({ name: 'Після оновлення', price: 3000 })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body).toMatchObject({
      name: 'Після оновлення',
      price: 3000,
    })

    const deleteRes = await request(app).delete(`/api/products/${product._id}`)

    expect(deleteRes.status).toBe(204)

    const getDeletedRes = await request(app).get(`/api/products/${product._id}`)

    expect(getDeletedRes.status).toBe(404)
  })

  it('повертає прості відповіді валідації та відсутнього товару', async () => {
    const badCreateRes = await request(app).post('/api/products').send({ price: 100 })
    const missingId = new mongoose.Types.ObjectId().toString()
    const missingProductRes = await request(app).get(`/api/products/${missingId}`)

    expect(badCreateRes.status).toBe(400)
    expect(badCreateRes.body).toEqual({ message: 'name and price are required' })
    expect(missingProductRes.status).toBe(404)
    expect(missingProductRes.body).toEqual({ message: 'Product not found' })
  })
})
