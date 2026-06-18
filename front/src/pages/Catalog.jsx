import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'

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

  useEffect(() => {
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
      <h2 className="ge-stitle">Каталог виробів</h2>

      <div className="ge-filters">
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

        <button className="ge-btn-view" type="button" onClick={resetFilters}>
          Скинути
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
