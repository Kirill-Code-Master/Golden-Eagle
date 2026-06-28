import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getCartItems,
  removeProductFromCart,
  updateCartItemQuantity,
  clearCart,
} from '../lib/cart'
import { getCurrentUser, getAuthHeaders } from '../lib/auth'
import { getProductImageSrc } from '../lib/images'

const formatPrice = (price) => Number(price || 0).toLocaleString('uk-UA')

const categoryIcon = {
  'Каблучки': '💍',
  'Ланцюжки': '⛓️',
  'Браслети': '📿',
  'Сережки': '✨',
  'Підвіски': '🔮',
  'Обручки': '💛',
  'Хрестики': '✝️',
}

function CartProductThumb({ product, icon }) {
  const [imgBroken, setImgBroken] = useState(false)
  const imageSrc = getProductImageSrc(product.image)

  useEffect(() => {
    setImgBroken(false)
  }, [imageSrc])

  return (
    <Link to={`/product/${product._id}`} className="ge-cart-row__thumb" aria-label={product.name}>
      {!imgBroken && imageSrc ? (
        <img
          key={imageSrc}
          src={imageSrc}
          alt={product.name}
          onError={() => setImgBroken(true)}
        />
      ) : (
        <span className="ge-cart-row__emoji">{icon}</span>
      )}
    </Link>
  )
}

export default function Cart() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [user, setUser] = useState(() => getCurrentUser())
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutSuccess, setCheckoutSuccess] = useState('')

  useEffect(() => {
    const handleAuthChange = () => setUser(getCurrentUser())
    window.addEventListener('golden-eagle-auth-change', handleAuthChange)
    return () => window.removeEventListener('golden-eagle-auth-change', handleAuthChange)
  }, [])

  const loadCart = useCallback(() => {
    const cartItems = getCartItems()

    if (cartItems.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    setLoading(true)

    Promise.all(cartItems.map(async item => {
      try {
        const response = await fetch(`/api/products/${item.productId}`)

        if (!response.ok) {
          return { ...item, product: null }
        }

        return {
          ...item,
          product: await response.json(),
        }
      } catch {
        return { ...item, product: null }
      }
    }))
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadCart, 0)

    window.addEventListener('golden-eagle-cart-change', loadCart)
    window.addEventListener('storage', loadCart)

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('golden-eagle-cart-change', loadCart)
      window.removeEventListener('storage', loadCart)
    }
  }, [loadCart])

  const availableRows = rows.filter(row => row.product)

  const total = useMemo(() => availableRows.reduce((sum, row) => {
    return sum + Number(row.product.price || 0) * row.quantity
  }, 0), [availableRows])

  const handleQuantity = (productId, quantity) => {
    if (quantity === '') return

    const nextItems = updateCartItemQuantity(productId, quantity)
    setRows(prevRows => prevRows
      .map(row => row.productId === productId
        ? { ...row, quantity: nextItems.find(item => item.productId === productId)?.quantity || 0 }
        : row)
      .filter(row => row.quantity > 0))
  }

  const handleRemove = (productId) => {
    removeProductFromCart(productId)
    setRows(prevRows => prevRows.filter(row => row.productId !== productId))
  }

  const handleCheckout = () => {
    setCheckoutError('')
    setCheckoutSuccess('')

    if (!user) {
      setCheckoutError('Для оформлення замовлення, будь ласка, увійдіть або зареєструйтеся.')
      setCheckoutOpen(true)
      return
    }

    // Clear cart locally and redirect to info placeholder page
    clearCart()
    navigate('/order-info')
  }

  if (loading) {
    return (
      <div className="ge-container">
        <h2 className="ge-stitle">Ваш кошик</h2>
        <p>Оновлюємо ціни товарів...</p>
      </div>
    )
  }

  return (
    <div className="ge-container">
      <div className="ge-cart-head">
        <div>
          <h2 className="ge-stitle">Ваш кошик</h2>
        </div>
        <Link to="/catalog" className="ge-btn-view">Продовжити покупки</Link>
      </div>

      {rows.length === 0 ? (
        <div className="ge-cart-empty">
          <span className="ge-cart-empty__icon">🛍️</span>
          <p>Наразі ваш кошик порожній.</p>
          <p>Час додати трохи сяйва у ваше життя!</p>
          <Link to="/catalog" className="ge-btn-view ge-btn-view--primary">
            Перейти до каталогу
          </Link>
        </div>
      ) : (
        <div className="ge-cart-layout">
          <section className="ge-cart-list" aria-label="Товари в кошику">
            {rows.map(row => {
              const product = row.product
              const icon = categoryIcon[product?.category] ?? '💎'

              if (!product) {
                return (
                  <article className="ge-cart-row ge-cart-row--missing" key={row.productId}>
                    <div>
                      <h3>Товар недоступний</h3>
                      <p>Його більше немає в каталозі або він тимчасово не відкривається.</p>
                    </div>
                    <button className="ge-btn-view" type="button" onClick={() => handleRemove(row.productId)}>
                      Видалити
                    </button>
                  </article>
                )
              }

              return (
                <article className="ge-cart-row" key={row.productId}>
                  <CartProductThumb product={product} icon={icon} />

                  <div className="ge-cart-row__info">
                    <Link to={`/product/${product._id}`} className="ge-cart-row__name">
                      {product.name}
                    </Link>
                    <p>{product.material || product.category}</p>
                    <span className="ge-cart-row__price">{formatPrice(product.price)} ₴ за шт.</span>
                  </div>

                  <div className="ge-qty" aria-label={`Кількість ${product.name}`}>
                    <button
                      type="button"
                      onClick={() => handleQuantity(row.productId, row.quantity - 1)}
                      aria-label="Зменшити кількість"
                    >
                      −
                    </button>
                    <input
                      min="1"
                      max="99"
                      type="number"
                      value={row.quantity}
                      onChange={event => handleQuantity(row.productId, event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantity(row.productId, row.quantity + 1)}
                      aria-label="Збільшити кількість"
                    >
                      +
                    </button>
                  </div>

                  <strong className="ge-cart-row__sum">
                    {formatPrice(Number(product.price || 0) * row.quantity)} ₴
                  </strong>

                  <button className="ge-cart-row__remove" type="button" onClick={() => handleRemove(row.productId)}>
                    Видалити
                  </button>
                </article>
              )
            })}
          </section>

          <aside className="ge-cart-summary" aria-label="Підсумок кошика">
            <h3>Підсумок</h3>
            <div className="ge-cart-summary__line">
              <span>Товарів</span>
              <strong>{availableRows.reduce((sum, row) => sum + row.quantity, 0)}</strong>
            </div>
            <div className="ge-cart-summary__line">
              <span>Сума</span>
              <strong>{formatPrice(total)} ₴</strong>
            </div>
            <button
              className="ge-btn-view ge-btn-view--primary ge-cart-summary__checkout"
              type="button"
              disabled={availableRows.length === 0 || checkoutLoading}
              onClick={handleCheckout}
            >
              {checkoutLoading ? 'Оформлення...' : 'Оформити замовлення'}
            </button>
            {checkoutOpen && checkoutError && (
              <div className="ge-checkout-note ge-checkout-note--error" role="status">
                {checkoutError}{' '}
                <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem' }}>
                  <Link to="/login" className="ge-btn-view" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Увійти</Link>
                  <Link to="/register" className="ge-btn-view ge-btn-view--primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Реєстрація</Link>
                </div>
              </div>
            )}
            {checkoutOpen && checkoutSuccess && (
              <div className="ge-checkout-note ge-checkout-note--success" role="status">
                {checkoutSuccess}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
