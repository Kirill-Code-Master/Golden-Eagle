import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CART_STORAGE_KEY,
  addProductToCart,
  getCartCount,
  getCartItems,
  removeProductFromCart,
  updateCartItemQuantity,
} from '../src/lib/cart.js'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('Локальний кошик у браузері', () => {
  it('додає товари в localStorage, обʼєднує однаковий productId і рахує загальну кількість у кошику', () => {
    const listener = vi.fn()
    window.addEventListener('golden-eagle-cart-change', listener)

    addProductToCart('product-a')
    addProductToCart('product-a', 2)
    addProductToCart('product-b')

    expect(getCartItems()).toEqual([
      { productId: 'product-a', quantity: 3 },
      { productId: 'product-b', quantity: 1 },
    ])
    expect(getCartCount()).toBe(4)
    expect(listener).toHaveBeenCalledTimes(3)

    window.removeEventListener('golden-eagle-cart-change', listener)
  })

  it('підтримує старий формат id, обмежує кількість до 99 і повністю видаляє товар при кількості 0', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([
      { id: 'legacy-product', quantity: 2 },
      { productId: 'legacy-product', quantity: 5 },
      { productId: 'removed-product', quantity: 2 },
    ]))

    expect(getCartItems()).toEqual([
      { productId: 'legacy-product', quantity: 7 },
      { productId: 'removed-product', quantity: 2 },
    ])

    updateCartItemQuantity('legacy-product', 150)
    expect(getCartItems()).toContainEqual({ productId: 'legacy-product', quantity: 99 })

    updateCartItemQuantity('legacy-product', 0)
    removeProductFromCart('removed-product')

    expect(getCartItems()).toEqual([])
  })
})
