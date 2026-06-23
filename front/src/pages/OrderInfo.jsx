import { Link } from 'react-router-dom'

export default function OrderInfo() {
  return (
    <div className="ge-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 280px)', padding: '2rem 1.5rem' }}>
      <div className="ge-state-box" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '3rem 2rem', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)' }}>
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem', opacity: 0.8 }}>🛍️</span>
        <h2 className="ge-stitle" style={{ borderBottom: 'none', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Оформлення замовлення
        </h2>
        <p style={{ color: 'var(--text-color)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Дякуємо, що обрали нас! Наразі функція оформлення замовлень тимчасово недоступна. 
          Ця сторінка є заглушкою для майбутнього функціоналу покупок, який буде додано найближчим часом.
        </p>
        <Link to="/catalog" className="ge-btn-view ge-btn-view--primary" style={{ display: 'inline-block', padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
          Повернутися до каталогу
        </Link>
      </div>
    </div>
  )
}
