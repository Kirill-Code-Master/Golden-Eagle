import 'dotenv/config'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import app from '../src/app.js'
import Product from '../src/product.js'
import User from '../src/user.js'
import { generateToken } from '../src/token.js'

const TEST_CATEGORY = '__test__'
let adminToken = ''

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

  let admin = await User.findOne({ username: 'admin' })
  if (!admin) {
    admin = new User({
      username: 'admin',
      password: 'hashedpassword',
      role: 'admin'
    })
    await admin.save()
  }
  adminToken = generateToken(admin)
})

afterEach(async () => {
  await Product.deleteMany({ category: TEST_CATEGORY })
  await User.deleteMany({ username: /^test_/ })
})

afterAll(async () => {
  await Product.deleteMany({ category: TEST_CATEGORY })
  await User.deleteMany({ username: /^test_/ })
  await mongoose.disconnect()
})

describe('Інтеграційні API-тести товарів', () => {
  it('перевіряє, що health endpoint відповідає 200 і повертає назву backend-сервісу', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'golden-eagle-back',
    })
  })

  it('створює товар через API, знаходить його у списку і читає окремо за id з MongoDB', async () => {
    const product = makeProduct({
      name: 'Тестова каблучка API',
      price: 2500,
      description: 'Детальний опис тестового товару',
    })

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(product)

    expect(createRes.status).toBe(201)
    expect(createRes.body).toMatchObject({
      name: product.name,
      price: product.price,
      category: TEST_CATEGORY,
      description: product.description,
      stock: product.stock,
    })

    const listRes = await request(app).get('/api/products')
    const createdFromList = listRes.body.products.find((item) => item._id === createRes.body._id)

    expect(listRes.status).toBe(200)
    expect(createdFromList).toMatchObject({ name: product.name })

    const singleRes = await request(app).get(`/api/products/${createRes.body._id}`)

    expect(singleRes.status).toBe(200)
    expect(singleRes.body).toMatchObject({
      name: product.name,
      description: product.description,
    })
  })

  it('шукає товари за текстом у вибраній категорії та повертає знайдені позиції за ціною від більшої до меншої', async () => {
    const cheap = await Product.create(makeProduct({
      name: 'Каблучка для пошуку срібна',
      price: 1200,
      material: 'Срібло 925',
    }))

    const expensive = await Product.create(makeProduct({
      name: 'Каблучка для пошуку золота',
      price: 5400,
      material: 'Золото 585',
    }))

    await Product.create(makeProduct({
      name: 'Ланцюжок поза пошуком',
      price: 9900,
      material: 'Золото 750',
    }))

    const res = await request(app).get('/api/products').query({
      category: TEST_CATEGORY,
      search: 'каблучка',
      sortBy: 'price',
      order: 'desc',
    })

    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2)
    expect(res.body.products.map((item) => item._id)).toEqual([
      expensive._id.toString(),
      cheap._id.toString(),
    ])
  })

  it('фільтрує material за частиною складного рядка, щоб Срібло знаходилося всередині опису матеріалів', async () => {
    const target = await Product.create(makeProduct({
      name: 'Складний матеріал',
      material: 'Срібло 999, золото 585, сапфір 1,2',
    }))

    await Product.create(makeProduct({
      name: 'Інший матеріал',
      material: 'Платина 950',
    }))

    const res = await request(app).get('/api/products').query({
      category: TEST_CATEGORY,
      material: 'Срібло',
      sortBy: 'name',
      order: 'asc',
    })

    expect(res.status).toBe(200)
    expect(res.body.products.map((item) => item._id)).toEqual([target._id.toString()])
  })

  it('оновлює назву і ціну товару, видаляє його та після видалення отримує 404 за тим самим id', async () => {
    const product = await Product.create(makeProduct({ name: 'До оновлення' }))

    const updateRes = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Після оновлення', price: 3000 })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body).toMatchObject({
      name: 'Після оновлення',
      price: 3000,
    })

    const deleteRes = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(deleteRes.status).toBe(204)

    const getDeletedRes = await request(app).get(`/api/products/${product._id}`)

    expect(getDeletedRes.status).toBe(404)
  })

  it('повертає зрозумілі помилки для створення без назви та для запиту неіснуючого товару', async () => {
    const badCreateRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 100 })
    const missingId = new mongoose.Types.ObjectId().toString()
    const missingProductRes = await request(app).get(`/api/products/${missingId}`)

    expect(badCreateRes.status).toBe(400)
    expect(badCreateRes.body).toEqual({ message: 'name and price are required' })
    expect(missingProductRes.status).toBe(404)
    expect(missingProductRes.body).toEqual({ message: 'Product not found' })
  })

  describe('Тести авторизації та ролей', () => {
    it('реєструє нового користувача та успішно логіниться під ним', async () => {
      const username = `test_user_${Date.now()}`
      const password = 'testpassword123'

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ username, password })

      expect(registerRes.status).toBe(201)
      expect(registerRes.body.user).toMatchObject({
        username,
        role: 'user',
      })

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username, password })

      expect(loginRes.status).toBe(200)
      expect(loginRes.body).toHaveProperty('token')
      expect(loginRes.body.user).toMatchObject({
        username,
        role: 'user',
      })
    })

    it('забороняє реєстрацію з ім’ям користувача, що вже існує', async () => {
      const username = `test_user_duplicate`
      const password = 'testpassword123'

      // Register first time
      await request(app)
        .post('/api/auth/register')
        .send({ username, password })

      // Register second time
      const duplicateRes = await request(app)
        .post('/api/auth/register')
        .send({ username, password })

      expect(duplicateRes.status).toBe(400)
      expect(duplicateRes.body.message).toBe('Користувач з таким ім’ям вже існує.')
    })

    it('забороняє створювати або редагувати товари без токена або з роллю user', async () => {
      const product = makeProduct({ name: 'Спроба взлому' })

      // Unregistered user attempt
      const unregRes = await request(app)
        .post('/api/products')
        .send(product)
      expect(unregRes.status).toBe(403)

      // Registered user attempt
      const tempUser = await User.create({
        username: `test_user_${Date.now()}`,
        password: 'password123',
        role: 'user',
      })
      const userToken = generateToken(tempUser)

      const regUserRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(product)
      expect(regUserRes.status).toBe(403)
    })

    it('дозволяє оформляти замовлення зареєстрованому користувачу, але забороняє незареєстрованому', async () => {
      const items = [{ productId: new mongoose.Types.ObjectId().toString(), quantity: 2 }]

      // Unregistered user attempt
      const unregRes = await request(app)
        .post('/api/orders')
        .send({ items })
      expect(unregRes.status).toBe(401)

      // Registered user attempt
      const tempUser = await User.create({
        username: `test_user_${Date.now()}`,
        password: 'password123',
        role: 'user',
      })
      const userToken = generateToken(tempUser)

      const regUserRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items })

      expect(regUserRes.status).toBe(200)
      expect(regUserRes.body).toMatchObject({
        success: true,
        message: 'Замовлення успішно оформлено! Дякуємо за покупку.',
      })
    })
  })
})
