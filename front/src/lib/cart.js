export const CART_STORAGE_KEY = 'golden-eagle-cart'

const readCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const normalizeCart = (items) => {
  const byId = new Map()

  items.forEach(item => {
    const productId = item.productId || item.id
    const quantity = Math.min(Math.max(Number(item.quantity) || 1, 1), 99)

    if (!productId || quantity < 1) return

    byId.set(productId, (byId.get(productId) || 0) + quantity)
  })

  return Array.from(byId, ([productId, quantity]) => ({ productId, quantity }))
}

const writeCart = (items) => {
  const normalized = normalizeCart(items)
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent('golden-eagle-cart-change', {
    detail: normalized
  }))
  return normalized
}

export const getCartItems = () => normalizeCart(readCart())

export const isProductInCart = (productId) => getCartItems()
  .some(item => item.productId === productId)

export const getCartCount = () => getCartItems()
  .reduce((total, item) => total + item.quantity, 0)

export const addProductToCart = (productId, quantity = 1) => {
  const items = getCartItems()
  const existing = items.find(item => item.productId === productId)

  if (existing) {
    existing.quantity += quantity
  } else {
    items.push({ productId, quantity })
  }

  return writeCart(items)
}

export const updateCartItemQuantity = (productId, quantity) => {
  const nextQuantity = Math.min(Math.max(Number(quantity) || 0, 0), 99)
  const items = getCartItems()
    .map(item => item.productId === productId
      ? { ...item, quantity: nextQuantity }
      : item)
    .filter(item => item.quantity > 0)

  return writeCart(items)
}

export const removeProductFromCart = (productId) => {
  const items = getCartItems().filter(item => item.productId !== productId)
  return writeCart(items)
}

export const clearCart = () => {
  return writeCart([])
}
