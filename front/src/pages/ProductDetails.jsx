import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { addProductToCart, isProductInCart } from '../lib/cart'
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
  const navigate = useNavigate()
  const productFromLink = location.state?.product || null
  
  const [product, setProduct] = useState(productFromLink)
  const [loading, setLoading] = useState(!productFromLink)
  const [error, setError] = useState('')
  const [inCart, setInCart] = useState(() => isProductInCart(id))
  const [imgBroken, setImgBroken] = useState(false)
  
  const [user, setUser] = useState(() => getCurrentUser())
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState(0)
  const [editCategory, setEditCategory] = useState('')
  const [editMaterial, setEditMaterial] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImage, setEditImage] = useState('')
  const [editStock, setEditStock] = useState(0)
  const [editError, setEditError] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    const handleAuthChange = () => setUser(getCurrentUser())
    window.addEventListener('golden-eagle-auth-change', handleAuthChange)
    return () => window.removeEventListener('golden-eagle-auth-change', handleAuthChange)
  }, [])

  useEffect(() => {
    setImgBroken(false)
  }, [product?.image])

  useEffect(() => {
    const updateCartState = () => setInCart(isProductInCart(id))

    updateCartState()
    window.addEventListener('golden-eagle-cart-change', updateCartState)
    return () => window.removeEventListener('golden-eagle-cart-change', updateCartState)
  }, [id])

  const startEditing = () => {
    if (!product) return
    setEditName(product.name || '')
    setEditPrice(product.price || 0)
    setEditCategory(product.category || '')
    setEditMaterial(product.material || '')
    setEditDescription(product.description || '')
    setEditImage(product.image || '')
    setEditStock(product.stock || 0)
    setEditError('')
    setIsEditing(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setEditError('')
    if (!editName.trim() || editPrice < 0) {
      setEditError('Назва обов’язкова, ціна має бути невід’ємною.')
      return
    }

    setSaveLoading(true)
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editName.trim(),
          price: Number(editPrice),
          category: editCategory.trim(),
          material: editMaterial.trim(),
          description: editDescription.trim(),
          image: editImage.trim(),
          stock: Number(editStock)
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Не вдалося зберегти зміни.')
      }

      setProduct(data)
      setIsEditing(false)
      setImgBroken(false)
    } catch (err) {
      setEditError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей виріб?')) return

    setSaveLoading(true)
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Не вдалося видалити виріб.')
      }

      navigate('/catalog')
    } catch (err) {
      alert(err.message)
      setSaveLoading(false)
    }
  }

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
    if (inCart) {
      navigate('/cart')
      return
    }

    addProductToCart(getProductId(product))
    setInCart(true)
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
  const imageSrc = getProductImageSrc(product.image)

  return (
    <div className="ge-container">
      <Link to="/catalog" className="ge-back-link">← До каталогу</Link>

      <section className="ge-product">
        <div className="ge-product__media">
          {!imgBroken && imageSrc ? (
            <img
              key={imageSrc}
              src={imageSrc}
              alt={product.name}
              onError={() => setImgBroken(true)}
            />
          ) : (
            <span className="ge-product__emoji">{icon}</span>
          )}
        </div>

        <div className="ge-product__info">
          {isEditing ? (
            <form onSubmit={handleSave} className="ge-product__edit-form">
              <h3 className="ge-stitle">Редагування товару</h3>
              {editError && <div className="ge-auth-error ge-auth-alert" style={{ marginBottom: '1rem' }}>⚠️ {editError}</div>}
              
              <div className="ge-form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="editName">Назва</label>
                <input
                  id="editName"
                  type="text"
                  className="ge-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  disabled={saveLoading}
                  required
                />
              </div>
              
              <div className="ge-form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="editPrice">Ціна (₴)</label>
                <input
                  id="editPrice"
                  type="number"
                  min="0"
                  className="ge-input"
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  disabled={saveLoading}
                  required
                />
              </div>

              <div className="ge-form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="editCategory">Категорія</label>
                <select
                  id="editCategory"
                  className="ge-select"
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  disabled={saveLoading}
                  style={{ width: '100%' }}
                >
                  <option value="">Без категорії</option>
                  <option value="Каблучки">Каблучки</option>
                  <option value="Ланцюжки">Ланцюжки</option>
                  <option value="Браслети">Браслети</option>
                  <option value="Сережки">Сережки</option>
                  <option value="Підвіски">Підвіски</option>
                  <option value="Обручки">Обручки</option>
                  <option value="Хрестики">Хрестики</option>
                </select>
              </div>

              <div className="ge-form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="editMaterial">Матеріал</label>
                <input
                  id="editMaterial"
                  type="text"
                  className="ge-input"
                  value={editMaterial}
                  onChange={e => setEditMaterial(e.target.value)}
                  disabled={saveLoading}
                  placeholder="Наприклад: золото 585, фіаніт"
                />
              </div>

              <div className="ge-form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="editDescription">Опис</label>
                <textarea
                  id="editDescription"
                  className="ge-input"
                  rows="4"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  disabled={saveLoading}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div className="ge-form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="editImage">Посилання на зображення</label>
                <input
                  id="editImage"
                  type="text"
                  className="ge-input"
                  value={editImage}
                  onChange={e => setEditImage(e.target.value)}
                  disabled={saveLoading}
                />
              </div>

              <div className="ge-form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="editStock">Кількість на складі</label>
                <input
                  id="editStock"
                  type="number"
                  min="0"
                  className="ge-input"
                  value={editStock}
                  onChange={e => setEditStock(e.target.value)}
                  disabled={saveLoading}
                />
              </div>

              <div className="ge-product__actions">
                <button
                  className="ge-btn-view ge-btn-view--primary"
                  type="submit"
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Збереження...' : 'Зберегти'}
                </button>
                <button
                  className="ge-btn-view"
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saveLoading}
                >
                  Скасувати
                </button>
              </div>
            </form>
          ) : (
            <>
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
                  {inCart ? 'До кошика' : 'Додати в кошик'}
                </button>
                
                {user && user.role === 'admin' && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="ge-btn-view"
                      type="button"
                      onClick={startEditing}
                      style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
                    >
                      Редагувати
                    </button>
                    <button
                      className="ge-btn-view"
                      type="button"
                      onClick={handleDelete}
                      style={{ borderColor: '#d9534f', color: '#f28b82' }}
                    >
                      Видалити
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
