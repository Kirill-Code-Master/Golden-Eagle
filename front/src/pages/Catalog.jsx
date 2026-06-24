import { useEffect, useRef, useState } from 'react'
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

const emptyProductForm = {
  name: '',
  price: 0,
  category: '',
  material: '',
  description: '',
  image: '',
  stock: 0
}

const toProductForm = (product = emptyProductForm) => ({
  name: product.name || '',
  price: product.price ?? 0,
  category: product.category || '',
  material: product.material || '',
  description: product.description || '',
  image: product.image || '',
  stock: product.stock ?? 0
})

export default function Catalog() {
  const formRef = useRef(null)
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
  const [formMode, setFormMode] = useState(null)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [formError, setFormError] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [adminToast, setAdminToast] = useState('')

  const isAdmin = user?.role === 'admin'
  const isFormVisible = formMode === 'create' || formMode === 'edit'

  useEffect(() => {
    const handleAuthChange = () => setUser(getCurrentUser())
    window.addEventListener('golden-eagle-auth-change', handleAuthChange)
    return () => window.removeEventListener('golden-eagle-auth-change', handleAuthChange)
  }, [])

  useEffect(() => {
    if (!adminToast) return undefined

    const timeoutId = window.setTimeout(() => setAdminToast(''), 2600)
    return () => window.clearTimeout(timeoutId)
  }, [adminToast])

  const showAdminToast = (message) => {
    if (isAdmin) setAdminToast(message)
  }

  const updateProductForm = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetProductForm = () => {
    setProductForm(emptyProductForm)
    setEditingProductId(null)
    setFormMode(null)
    setFormError('')
  }

  const startCreating = () => {
    if (formMode === 'create') {
      resetProductForm()
      return
    }

    setProductForm(emptyProductForm)
    setEditingProductId(null)
    setFormError('')
    setFormMode('create')
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  const startEditing = (product) => {
    setProductForm(toProductForm(product))
    setEditingProductId(product._id)
    setFormError('')
    setFormMode('edit')
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  const getProductPayload = () => ({
    name: productForm.name.trim(),
    price: Number(productForm.price),
    category: productForm.category.trim(),
    material: productForm.material.trim(),
    description: productForm.description.trim(),
    image: productForm.image.trim(),
    stock: Number(productForm.stock)
  })

  const handleSaveProduct = async (event) => {
    event.preventDefault()
    setFormError('')

    const payload = getProductPayload()
    if (!payload.name || payload.price < 0 || payload.stock < 0) {
      setFormError('Назва обов’язкова, ціна та кількість на складі мають бути невід’ємними.')
      return
    }

    setSaveLoading(true)
    try {
      const isEditing = formMode === 'edit'
      const response = await fetch(isEditing ? `/api/products/${editingProductId}` : '/api/products', {
        method: isEditing ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || (isEditing ? 'Не вдалося зберегти зміни.' : 'Не вдалося додати новий виріб.'))
      }

      setProducts(prev => {
        if (isEditing) {
          return prev.map(product => product._id === data._id ? data : product)
        }
        return [data, ...prev]
      })

      if (!isEditing) setPage(1)
      resetProductForm()
      showAdminToast(isEditing ? 'Товар успішно відредаговано.' : 'Товар успішно створено.')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!editingProductId) return
    if (!window.confirm('Ви впевнені, що хочете видалити цей виріб?')) return

    setSaveLoading(true)
    setFormError('')
    try {
      const response = await fetch(`/api/products/${editingProductId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Не вдалося видалити виріб.')
      }

      setProducts(prev => prev.filter(product => product._id !== editingProductId))
      resetProductForm()
      showAdminToast('Товар успішно видалено.')
    } catch (err) {
      setFormError(err.message)
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
      <div className="ge-catalog-title-bar">
        <h2 className="ge-stitle">Каталог виробів</h2>
        {isAdmin && (
          <button
            type="button"
            className="ge-btn-view ge-catalog-add"
            onClick={startCreating}
          >
            {formMode === 'create' ? 'Скасувати' : 'Додати виріб'}
          </button>
        )}
      </div>

      {isFormVisible && (
        <form ref={formRef} onSubmit={handleSaveProduct} className="ge-state-box ge-admin-product-form">
          <h3 className="ge-stitle">{formMode === 'edit' ? 'Редагування виробу' : 'Новий виріб'}</h3>
          {formError && <div className="ge-auth-error ge-auth-alert">⚠️ {formError}</div>}

          <div className="ge-admin-product-form__grid">
            <div className="ge-form-group">
              <label htmlFor="productName">Назва</label>
              <input
                id="productName"
                type="text"
                className="ge-input"
                value={productForm.name}
                onChange={event => updateProductForm('name', event.target.value)}
                disabled={saveLoading}
                required
              />
            </div>

            <div className="ge-form-group">
              <label htmlFor="productPrice">Ціна (₴)</label>
              <input
                id="productPrice"
                type="number"
                min="0"
                className="ge-input"
                value={productForm.price}
                onChange={event => updateProductForm('price', event.target.value)}
                disabled={saveLoading}
                required
              />
            </div>

            <div className="ge-form-group">
              <label htmlFor="productCategory">Категорія</label>
              <select
                id="productCategory"
                className="ge-select"
                value={productForm.category}
                onChange={event => updateProductForm('category', event.target.value)}
                disabled={saveLoading}
              >
                <option value="">Без категорії</option>
                {categories.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="ge-form-group">
              <label htmlFor="productMaterial">Матеріал</label>
              <input
                id="productMaterial"
                type="text"
                className="ge-input"
                value={productForm.material}
                onChange={event => updateProductForm('material', event.target.value)}
                disabled={saveLoading}
                placeholder="Наприклад: золото 585, фіаніт"
              />
            </div>

            <div className="ge-form-group">
              <label htmlFor="productImage">Посилання на зображення</label>
              <input
                id="productImage"
                type="text"
                className="ge-input"
                value={productForm.image}
                onChange={event => updateProductForm('image', event.target.value)}
                disabled={saveLoading}
                placeholder="https://..."
              />
            </div>

            <div className="ge-form-group">
              <label htmlFor="productStock">Кількість на складі</label>
              <input
                id="productStock"
                type="number"
                min="0"
                className="ge-input"
                value={productForm.stock}
                onChange={event => updateProductForm('stock', event.target.value)}
                disabled={saveLoading}
              />
            </div>
          </div>

          <div className="ge-form-group">
            <label htmlFor="productDescription">Опис</label>
            <textarea
              id="productDescription"
              className="ge-input"
              rows="3"
              value={productForm.description}
              onChange={event => updateProductForm('description', event.target.value)}
              disabled={saveLoading}
            />
          </div>

          <div className="ge-admin-product-form__actions">
            {formMode === 'edit' && (
              <button
                className="ge-btn-view ge-btn-view--danger"
                type="button"
                onClick={handleDeleteProduct}
                disabled={saveLoading}
              >
                Видалити
              </button>
            )}
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
              onClick={resetProductForm}
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
              <ProductCard
                key={product._id}
                product={product}
                isAdmin={isAdmin}
                onEdit={startEditing}
              />
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

      {isAdmin && adminToast && (
        <div className="ge-admin-toast" role="status" aria-live="polite">
          {adminToast}
        </div>
      )}
    </div>
  )
}
