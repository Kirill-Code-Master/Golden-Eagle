import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { getCurrentUser, getAuthHeaders } from '../lib/auth'

const categories = [
  'Каблучки',
  'Ланцюжки',
  'Браслети',
  'Сережки',
  'Підвіски',
  'Обручки',
  'Хрестики'
]

const materials = [
  'Золото',
  'Срібло',
  'Платина'
]

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [order, setOrder] = useState('asc')
  const [category, setCategory] = useState('')
  const [material, setMaterial] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [user, setUser] = useState(() => getCurrentUser())
  const [isAdding, setIsAdding] = useState(false)
  const [addName, setAddName] = useState('')
  const [addPrice, setAddPrice] = useState(0)
  const [addCategory, setAddCategory] = useState('')
  const [addMaterial, setAddMaterial] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addImage, setAddImage] = useState('')
  const [addStock, setAddStock] = useState(0)
  const [addError, setAddError] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    const handleAuthChange = () => setUser(getCurrentUser())
    window.addEventListener('golden-eagle-auth-change', handleAuthChange)
    return () => window.removeEventListener('golden-eagle-auth-change', handleAuthChange)
  }, [])

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setAddError('')

    if (!addName.trim() || addPrice < 0) {
      setAddError('Назва обов’язкова, ціна має бути невід’ємною.')
      return
    }

    setSaveLoading(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: addName.trim(),
          price: Number(addPrice),
          category: addCategory.trim(),
          material: addMaterial.trim(),
          description: addDescription.trim(),
          image: addImage.trim(),
          stock: Number(addStock)
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Не вдалося додати новий виріб.')
      }

      setAddName('')
      setAddPrice(0)
      setAddCategory('')
      setAddMaterial('')
      setAddDescription('')
      setAddImage('')
      setAddStock(0)
      setIsAdding(false)

      setPage(1)
      setProducts(prev => [data, ...prev])
    } catch (err) {
      setAddError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams({
        page,
        limit: 20
      })

      if (search.trim()) params.append('search', search.trim())
      if (sortBy) params.append('sortBy', sortBy)
      if (sortBy) params.append('order', order)
      if (category) params.append('category', category)
      if (material) params.append('material', material)

      setLoading(true)

      fetch(`/api/products?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
          setProducts(data.products || [])
          setTotalPages(data.totalPages || 1)
        })
        .catch(() => {
          setProducts([])
          setTotalPages(1)
        })
        .finally(() => setLoading(false))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [page, search, sortBy, order, category, material])

  const resetFilters = () => {
    setSearch('')
    setSortBy('')
    setOrder('asc')
    setCategory('')
    setMaterial('')
    setPage(1)
  }

  return (
    <div className="ge-container">
      <div className="ge-catalog-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(201,168,76,.1)', marginBottom: '1.25rem', paddingBottom: '0.75rem' }}>
        <h2 className="ge-stitle" style={{ margin: 0, border: 'none', padding: 0 }}>Каталог виробів</h2>
        {user && user.role === 'admin' && (
          <button 
            type="button" 
            className="ge-btn-view" 
            onClick={() => setIsAdding(!isAdding)}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {isAdding ? 'Скасувати' : 'Додати виріб'}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddProduct} className="ge-state-box" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="ge-stitle" style={{ borderBottom: 'none', marginBottom: '0.5rem', paddingBottom: 0 }}>Новий виріб</h3>
          {addError && <div className="ge-auth-error ge-auth-alert" style={{ marginBottom: '0.5rem' }}>⚠️ {addError}</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="ge-form-group">
              <label htmlFor="addName">Назва</label>
              <input
                id="addName"
                type="text"
                className="ge-input"
                value={addName}
                onChange={e => setAddName(e.target.value)}
                disabled={saveLoading}
                required
              />
            </div>
            
            <div className="ge-form-group">
              <label htmlFor="addPrice">Ціна (₴)</label>
              <input
                id="addPrice"
                type="number"
                min="0"
                className="ge-input"
                value={addPrice}
                onChange={e => setAddPrice(e.target.value)}
                disabled={saveLoading}
                required
              />
            </div>

            <div className="ge-form-group">
              <label htmlFor="addCategory">Категорія</label>
              <select
                id="addCategory"
                className="ge-select"
                value={addCategory}
                onChange={e => setAddCategory(e.target.value)}
                disabled={saveLoading}
                style={{ width: '100%' }}
              >
                <option value="">Без категорії</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="ge-form-group">
              <label htmlFor="addMaterial">Матеріал</label>
              <select
                id="addMaterial"
                className="ge-select"
                value={addMaterial}
                onChange={e => setAddMaterial(e.target.value)}
                disabled={saveLoading}
                style={{ width: '100%' }}
              >
                <option value="">Уточнюється</option>
                {materials.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="ge-form-group">
              <label htmlFor="addImage">Посилання на зображення</label>
              <input
                id="addImage"
                type="text"
                className="ge-input"
                value={addImage}
                onChange={e => setAddImage(e.target.value)}
                disabled={saveLoading}
                placeholder="https://..."
              />
            </div>

            <div className="ge-form-group">
              <label htmlFor="addStock">Кількість на складі</label>
              <input
                id="addStock"
                type="number"
                min="0"
                className="ge-input"
                value={addStock}
                onChange={e => setAddStock(e.target.value)}
                disabled={saveLoading}
              />
            </div>
          </div>

          <div className="ge-form-group">
            <label htmlFor="addDescription">Опис</label>
            <textarea
              id="addDescription"
              className="ge-input"
              rows="3"
              value={addDescription}
              onChange={e => setAddDescription(e.target.value)}
              disabled={saveLoading}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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
              onClick={() => setIsAdding(false)}
              disabled={saveLoading}
            >
              Скасувати
            </button>
          </div>
        </form>
      )}

      <div className="ge-filters">
        <button
          className="ge-filter-reset"
          type="button"
          onClick={resetFilters}
          aria-label="Скинути фільтри"
          title="Скинути фільтри"
        >
          ×
        </button>

        <input
          className="ge-input"
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={event => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />

        <select
          className="ge-select"
          value={category}
          onChange={event => {
            setCategory(event.target.value)
            setPage(1)
          }}
        >
          <option value="">Всі категорії</option>
          {categories.map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          className="ge-select"
          value={material}
          onChange={event => {
            setMaterial(event.target.value)
            setPage(1)
          }}
        >
          <option value="">Всі матеріали</option>
          {materials.map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          className="ge-select"
          value={sortBy}
          onChange={event => {
            setSortBy(event.target.value)
            setPage(1)
          }}
        >
          <option value="">Без сортування</option>
          <option value="price">За ціною</option>
          <option value="name">За назвою</option>
        </select>

        <button
          className={`ge-btn-view ${order === 'asc' ? 'ge-btn-view--active' : ''}`}
          type="button"
          onClick={() => {
            setOrder('asc')
            setPage(1)
          }}
        >
          Зростання
        </button>

        <button
          className={`ge-btn-view ${order === 'desc' ? 'ge-btn-view--active' : ''}`}
          type="button"
          onClick={() => {
            setOrder('desc')
            setPage(1)
          }}
        >
          Спадання
        </button>

      </div>

      {loading ? (
        <p>Завантаження каталогу...</p>
      ) : (
        <>
          <div className="ge-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <p className="ge-empty">Нічого не знайдено.</p>
          )}

          <div className="ge-pagination">
            <button
              className="ge-btn-view"
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            >
              Назад
            </button>

            <span>Сторінка {page} з {totalPages}</span>

            <button
              className="ge-btn-view"
              disabled={page === totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            >
              Вперед
            </button>
          </div>
        </>
      )}
    </div>
  )
}
