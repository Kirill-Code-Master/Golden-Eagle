import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { addProductToCart } from '../lib/cart'

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

const getProductId = (product) => product?._id || product?.id

const getDescription = (product) => {
  const description = product?.description?.trim()

  if (description) return description

  const material = product?.material || 'матеріал уточнюється'
  const category = product?.category || 'ювелірний виріб'

  return `${product?.name || 'Цей виріб'} — ${category.toLowerCase()} Golden Eagle. Матеріал: ${material}. Детальний опис можна доповнити в картці товару, а основні характеристики вже доступні нижче.`
}

export default function ProductDetails() {
  const { id } = useParams()
  const location = useLocation()
  const productFromLink = location.state?.product || null
  const [product, setProduct] = useState(productFromLink)
  const [loading, setLoading] = useState(!productFromLink)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const [imgBroken, setImgBroken] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(prevLoading => prevLoading || !productFromLink)
      setError('')

      fetch(`/api/products/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(response.status === 404 ? 'not-found' : 'failed')
          }

          return response.json()
        })
        .then(data => {
          setProduct(data)
          setError('')
        })
        .catch(() => {
          if (!productFromLink) {
            setError('Товар не знайдено або він тимчасово недоступний.')
          }
        })
        .finally(() => setLoading(false))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [id, productFromLink])

  const handleAddToCart = () => {
    addProductToCart(getProductId(product))
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  if (loading) {
    return (
      <div className="ge-container">
        <p>Завантаження товару...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="ge-container">
        <h2 className="ge-stitle">Товар</h2>
        <div className="ge-state-box">
          <p>{error}</p>
          <Link to="/catalog" className="ge-btn-view">Повернутися до каталогу</Link>
        </div>
      </div>
    )
  }

  const icon = categoryIcon[product.category] ?? '💎'
  const description = getDescription(product)
  const productId = getProductId(product)

  return (
    <div className="ge-container">
      <Link to="/catalog" className="ge-back-link">← До каталогу</Link>

      <section className="ge-product">
        <div className="ge-product__media">
          {!imgBroken && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImgBroken(true)}
            />
          ) : (
            <span className="ge-product__emoji">{icon}</span>
          )}
        </div>

        <div className="ge-product__info">
          <span className="ge-tag">{icon} {product.category || 'Прикраса'}</span>
          <h1>{product.name}</h1>
          <p className="ge-product__description">{description}</p>
          <p className="ge-product__price">{formatPrice(product.price)} ₴</p>

          <div className="ge-product__details" aria-label="Характеристики товару">
            <div className="ge-product__meta">
              <span>Категорія</span>
              <strong>{product.category || 'Не вказано'}</strong>
            </div>
            <div className="ge-product__meta">
              <span>Матеріал</span>
              <strong>{product.material || 'Уточнюється'}</strong>
            </div>
            <div className="ge-product__meta">
              <span>Наявність</span>
              <strong>{Number(product.stock || 0) > 0 ? `${product.stock} шт.` : 'Під замовлення'}</strong>
            </div>
          </div>

          <div className="ge-product__actions">
            <button
              className="ge-btn-view ge-btn-view--primary"
              type="button"
              onClick={handleAddToCart}
              disabled={!productId}
            >
              {added ? 'Додано' : 'Додати в кошик'}
            </button>
            <Link to="/cart" className="ge-btn-view">Перейти до кошика</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
