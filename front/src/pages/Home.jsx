import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────
//  ради теста всё внутри компонента, никаких внешних зависимостей
// ─────────────────────────────────────────────────────────────────
const css = `
  /* ── Base ──────────────────────────────────────────────────── */
  .ge { min-height: 100vh; background: #0d0c0a; color: #e0d5c0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
  .ge * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Header ─────────────────────────────────────────────────── */
  .ge-header {
    background: linear-gradient(160deg, #140f03 0%, #1e1505 55%, #140f03 100%);
    border-bottom: 1px solid rgba(201,168,76,.14);
    padding: 1.5rem 1.5rem;
  }
  .ge-header__inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; flex-wrap: wrap;
  }
  .ge-logo { display: flex; align-items: center; gap: .9rem; }
  .ge-logo__eagle { font-size: 2.1rem; line-height: 1; }
  .ge-logo__name {
    font-size: clamp(1.25rem, 4vw, 1.85rem);
    font-weight: 300; letter-spacing: .32em;
    color: #c9a84c; line-height: 1;
    text-shadow: 0 0 28px rgba(201,168,76,.28);
  }
  .ge-logo__sub { font-size: .68rem; letter-spacing: .2em; text-transform: uppercase; color: #6b5933; margin-top: .25rem; }
  .ge-badge {
    font-size: .64rem; padding: .2rem .7rem;
    border: 1px solid rgba(201,168,76,.25); border-radius: 20px;
    color: rgba(201,168,76,.45); letter-spacing: .1em;
  }

  /* ── Main ───────────────────────────────────────────────────── */
  .ge-main {
    max-width: 1200px; margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
    display: flex; flex-direction: column; gap: 3rem;
  }

  /* ── Section title ──────────────────────────────────────────── */
  .ge-stitle {
    font-size: .76rem; font-weight: 600;
    letter-spacing: .18em; text-transform: uppercase;
    color: #c9a84c;
    margin-bottom: 1.25rem; padding-bottom: .75rem;
    border-bottom: 1px solid rgba(201,168,76,.1);
  }

  /* ── Loading ────────────────────────────────────────────────── */
  .ge-loading { display: flex; align-items: center; gap: 1rem; color: #6b5933; padding: 1.5rem 0; font-size: .9rem; }
  .ge-spinner {
    width: 22px; height: 22px;
    border: 2px solid #221e13; border-top-color: #c9a84c;
    border-radius: 50%; animation: ge-spin .75s linear infinite; flex-shrink: 0;
  }
  @keyframes ge-spin { to { transform: rotate(360deg); } }

  /* ── Banners ────────────────────────────────────────────────── */
  .ge-banner {
    display: flex; align-items: flex-start; gap: .75rem;
    padding: 1rem 1.2rem; border-radius: 8px;
    font-size: .875rem; line-height: 1.55;
  }
  .ge-banner--err  { background: #2a0f0f; border: 1px solid rgba(122,34,34,.4); color: #e07070; }
  .ge-banner--warn { background: #1a1505; border: 1px solid rgba(107,89,51,.38); color: #c9a84c; }

  /* ── Count ──────────────────────────────────────────────────── */
  .ge-count { font-size: .73rem; color: #4a4030; margin-bottom: 1rem; letter-spacing: .08em; }

  /* ── Grid ───────────────────────────────────────────────────── */
  .ge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 1rem;
  }

  /* ── Card ───────────────────────────────────────────────────── */
  .ge-card {
    background: #131109; border: 1px solid #1e1b12;
    border-radius: 10px; overflow: hidden;
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
    cursor: default;
  }
  .ge-card:hover {
    transform: translateY(-4px);
    border-color: rgba(201,168,76,.28);
    box-shadow: 0 18px 44px rgba(0,0,0,.55);
  }
  .ge-card__thumb {
    height: 150px; background: #1a1609;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
  }
  .ge-card__thumb img { width: 100%; height: 100%; object-fit: cover; }
  .ge-card__emoji { font-size: 3.2rem; opacity: .48; user-select: none; }
  .ge-card__body { padding: .9rem; }
  .ge-tag {
    display: inline-block; font-size: .66rem; letter-spacing: .06em;
    color: #8c7545; background: #221e13;
    padding: .2rem .55rem; border-radius: 20px; margin-bottom: .55rem;
  }
  .ge-card__name { font-size: .9rem; font-weight: 500; color: #e0d5c0; margin-bottom: .7rem; line-height: 1.35; }
  .ge-card__meta { display: flex; align-items: baseline; justify-content: space-between; gap: .4rem; flex-wrap: wrap; margin-bottom: .5rem; }
  .ge-price { font-size: 1.05rem; font-weight: 700; color: #c9a84c; }
  .ge-stock-ok  { font-size: .7rem; color: #5a8a5a; }
  .ge-stock-out { font-size: .7rem; color: #8a5a5a; }
  /* _id показывается мелко — это dev-инструмент, не элемент витрины */
  .ge-id {
    display: block; font-size: .61rem;
    font-family: 'Courier New', Courier, monospace;
    color: #302a1c; word-break: break-all; line-height: 1.45;
    transition: color .15s;
  }
  .ge-card:hover .ge-id { color: #5a4d33; }

  /* ── Test Panel ─────────────────────────────────────────────── */
  .ge-test { background: #0f0d0a; border: 1px solid #1e1b12; border-radius: 12px; padding: 1.75rem; }
  .ge-test__hint { font-size: .82rem; color: #5a4d33; line-height: 1.65; margin: -.4rem 0 1.25rem; }
  .ge-test__hint code {
    background: #221e13; padding: .1em .4em; border-radius: 4px;
    font-size: .85em; color: #c9a84c; font-family: 'Courier New', monospace;
  }
  .ge-test__hint strong { color: #e07070; font-weight: 600; }
  .ge-test__row { display: flex; gap: .6rem; flex-wrap: wrap; }

  .ge-input {
    flex: 1; min-width: 180px;
    background: #0d0c0a; border: 1px solid #221e13; border-radius: 6px;
    color: #c9a84c; font-family: 'Courier New', monospace; font-size: .82rem;
    padding: .6rem .9rem; outline: none; transition: border-color .15s;
  }
  .ge-input:focus { border-color: rgba(201,168,76,.35); }
  .ge-input::placeholder { color: #2a2418; }

  .ge-btn {
    background: #c9a84c; color: #0d0c0a;
    border: none; border-radius: 6px;
    padding: .6rem 1.3rem; font-size: .85rem; font-weight: 700;
    cursor: pointer; white-space: nowrap; transition: background .15s;
  }
  .ge-btn:hover:not(:disabled) { background: #d4b55a; }
  .ge-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* ── Result ─────────────────────────────────────────────────── */
  .ge-result {
    display: flex; align-items: flex-start; gap: .9rem;
    margin-top: 1rem; padding: 1rem 1.15rem;
    border-radius: 8px; font-size: .86rem; line-height: 1.5;
    animation: ge-fadein .2s ease;
  }
  @keyframes ge-fadein { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
  .ge-result__icon { font-size: 1.25rem; flex-shrink: 0; margin-top: .05rem; }
  .ge-result b { display: block; margin-bottom: .2rem; font-size: .9rem; }
  .ge-result p { opacity: .82; }
  .ge-result--found     { background: #0a1a0c; border: 1px solid rgba(42,106,42,.35); color: #7ac97a; }
  .ge-result--not-found { background: #1a1505; border: 1px solid rgba(107,89,51,.4);  color: #c9a84c; }
  .ge-result--error     { background: #2a0f0f; border: 1px solid rgba(122,34,34,.4);  color: #e07070; }

  /* ── Footer ─────────────────────────────────────────────────── */
  .ge-footer {
    text-align: center; padding: 1.5rem;
    font-size: .67rem; color: #2a2418; letter-spacing: .1em;
    border-top: 1px solid #1a1609;
  }
`

// ─────────────────────────────────────────────────────────────────
//  еможи по категориям (запасной вариант при битом img)
// ─────────────────────────────────────────────────────────────────
const CAT_ICON = {
  'Каблучки': '💍',
  'Ланцюжки': '⛓️',
  'Браслети': '📿',
  'Сережки':  '✨',
  'Підвіски': '🔮',
  'Обручки':  '💛',
  'Хрестики': '✝️',
}

// ─────────────────────────────────────────────────────────────────
//  ProductCard
// ─────────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const [imgBroken, setImgBroken] = useState(false)
  const icon = CAT_ICON[product.category] ?? '💎'

  return (
    <article className="ge-card">
      <div className="ge-card__thumb">
        {!imgBroken
          ? <img src={product.image} alt={product.name} onError={() => setImgBroken(true)} />
          : <span className="ge-card__emoji">{icon}</span>
        }
      </div>
      <div className="ge-card__body">
        <span className="ge-tag">{icon} {product.category}</span>
        <p className="ge-card__name">{product.name}</p>
        <div className="ge-card__meta">
          <span className="ge-price">{product.price.toLocaleString('uk-UA')} ₴</span>
          <span className={product.stock > 0 ? 'ge-stock-ok' : 'ge-stock-out'}>
            {product.stock > 0 ? `✓ ${product.stock} шт.` : '✗ Нема'}
          </span>
        </div>
        {/* _id нужен для copy-paste в тест-панель ниже */}
        <code className="ge-id">_id: {product._id}</code>
      </div>
    </article>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Home page
// ─────────────────────────────────────────────────────────────────
export default function Home() {
  // ── Catalog ─────────────────────────────────────────────────
  const [products,  setProducts]  = useState([])
  const [loadState, setLoadState] = useState('loading') // 'loading' | 'ok' | 'error'
  const [loadErr,   setLoadErr]   = useState('')

  // ── Test panel ───────────────────────────────────────────────
  // Значение по умолчанию — валидный формат ObjectId, которого нет в БД → гарантированный 404
  const [testId,  setTestId]  = useState('0')
  const [testSt,  setTestSt]  = useState('idle') // 'idle'|'loading'|'found'|'not-found'|'error'
  const [testObj, setTestObj] = useState(null)
  const [testMsg, setTestMsg] = useState('')

  // ── Загрузка каталога при монтировании ──────────────────────
  useEffect(() => {
    fetch('/api/products')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => { setProducts(data); setLoadState('ok') })
      .catch(e   => { setLoadErr(e.message); setLoadState('error') })
  }, [])

  // ── Тестовый запрос к /api/products/:id ─────────────────────
  const handleTest = async () => {
    const id = testId.trim()
    if (!id) return
    setTestSt('loading')
    setTestObj(null)
    setTestMsg('')
    try {
      const r    = await fetch(`/api/products/${id}`)
      const json = await r.json()
      if (r.status === 404)  { setTestSt('not-found'); setTestMsg(json.message) }
      else if (!r.ok)        { setTestSt('error');     setTestMsg(json.message ?? `Помилка ${r.status}`) }
      else                   { setTestSt('found');     setTestObj(json) }
    } catch {
      setTestSt('error')
      setTestMsg('Мережева помилка — бекенд недоступний')
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="ge">

        {/* ── Header ───────────────────────────────────────── */}
        <header className="ge-header">
          <div className="ge-header__inner">
            <div className="ge-logo">
              <span className="ge-logo__eagle">🦅</span>
              <div>
                <p className="ge-logo__name">GOLDEN EAGLE</p>
                <p className="ge-logo__sub">Ювелірний магазин</p>
              </div>
            </div>
            <span className="ge-badge">Dev Preview</span>
          </div>
        </header>

        <main className="ge-main">

          {/* ── Catalog section ──────────────────────────── */}
          <section>
            <h2 className="ge-stitle">Каталог виробів</h2>

            {loadState === 'loading' && (
              <div className="ge-loading">
                <div className="ge-spinner" />
                <span>Завантаження товарів…</span>
              </div>
            )}

            {loadState === 'error' && (
              <div className="ge-banner ge-banner--err">
                <span>⚠️</span>
                <span>
                  ТЕСТ
                  Не вдалося завантажити товари: <b>{loadErr}</b>.{' '}
                  Переконайтеся, що бекенд запущено на порті 3000 і MongoDB підключено.
                </span>
              </div>
            )}

            {loadState === 'ok' && products.length === 0 && (
              <div className="ge-banner ge-banner--warn">
                <span>📭</span>
                <span>
                  База даних порожня. Додайте товари через{' '}
                  <code style={{ fontFamily: 'monospace', fontSize: '.85em' }}>POST /api/products</code>{' '}
                  або запустіть seed-скрипт.
                </span>
              </div>
            )}

            {loadState === 'ok' && products.length > 0 && (
              <>
                <p className="ge-count">Знайдено товарів: {products.length}</p>
                <div className="ge-grid">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </>
            )}
          </section>

          {/* ── 404 test panel ───────────────────────────── */}
          <section className="ge-test">
            <h2 className="ge-stitle">🔬 Тест API — пошук товару за ID</h2>
            <p className="ge-test__hint">
              ТЕСТ
              Скопіюйте <code>_id</code> з будь-якої картки вище і вставте сюди, щоб перевірити успішний
              запит. Або залиште ID за замовчуванням — це валідний ObjectId, якого немає у базі,{' '}
              — щоб отримати відповідь <strong>404</strong> від сервера.
            </p>

            <div className="ge-test__row">
              <input
                className="ge-input"
                type="text"
                value={testId}
                onChange={e => { setTestId(e.target.value); setTestSt('idle') }}
                onKeyDown={e => e.key === 'Enter' && handleTest()}
                placeholder="MongoDB ObjectId (24 hex-символи)"
                spellCheck={false}
              />
              <button
                className="ge-btn"
                onClick={handleTest}
                disabled={testSt === 'loading' || !testId.trim()}
              >
                {testSt === 'loading' ? '⏳ …' : 'Знайти →'}
              </button>
            </div>

            {testSt !== 'idle' && testSt !== 'loading' && (
              <div className={`ge-result ge-result--${testSt}`}>
                <span className="ge-result__icon">
                  {testSt === 'found'     && '✅'}
                  {testSt === 'not-found' && '🔍'}
                  {testSt === 'error'     && '⚠️'}
                </span>
                <div>
                  {testSt === 'found' && (
                    <>
                      <b>Товар знайдено</b>
                      <p>
                        {testObj.name} —{' '}
                        {testObj.price?.toLocaleString('uk-UA')} ₴ ·{' '}
                        {testObj.category}
                      </p>
                    </>
                  )}
                  {testSt === 'not-found' && (
                    <>
                      <b>404 — Товар не знайдено</b>
                      <p>Жодного запису з ID «{testId}» у базі немає.</p>
                    </>
                  )}
                  {testSt === 'error' && (
                    <>
                      <b>Помилка запиту</b>
                      <p>{testMsg}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

        </main>

        <footer className="ge-footer">
          GOLDEN EAGLE · API :3000 · UI :53029
        </footer>
      </div>
    </>
  )
}