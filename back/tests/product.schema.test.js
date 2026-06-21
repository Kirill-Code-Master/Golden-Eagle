import { describe, expect, it } from 'vitest'
import Product from '../src/product.js'

describe('Значення схеми товару', () => {
  it('обрізає пробіли в текстових полях і застосовує значення за замовчуванням', async () => {
    const product = new Product({
      name: '  Каблучка  ',
      price: 0,
      category: '  Каблучки  ',
      material: '  Срібло 999  ',
      description: '  Опис товару  ',
      image: '  /ring.png  ',
    })

    await product.validate()

    expect(product.name).toBe('Каблучка')
    expect(product.price).toBe(0)
    expect(product.category).toBe('Каблучки')
    expect(product.material).toBe('Срібло 999')
    expect(product.description).toBe('Опис товару')
    expect(product.image).toBe('/ring.png')
    expect(product.stock).toBe(0)
  })

  it('відхиляє відʼємні значення ціни та залишку', async () => {
    const product = new Product({
      name: 'Некоректні значення',
      price: -1,
      stock: -1,
    })

    let validationError

    try {
      await product.validate()
    } catch (error) {
      validationError = error
    }

    expect(validationError.errors.price).toBeDefined()
    expect(validationError.errors.stock).toBeDefined()
  })
})
