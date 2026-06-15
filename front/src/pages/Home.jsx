import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setProducts(data.slice(0, 4)); // Show only first 4 on home page
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="ge-home">
      <section className="ge-hero">
        <div className="ge-container">
          <h1 className="ge-hero__title">Легендарна якість,<br />вічна краса</h1>
          <p className="ge-hero__subtitle">Відкрийте для себе світ вишуканих прикрас від Golden Eagle.</p>
          <Link to="/catalog" className="ge-hero__btn">Перейти до каталогу</Link>
        </div>
      </section>

      <section className="ge-featured">
        <div className="ge-container">
          <h2 className="ge-stitle">Популярні вироби</h2>
          {loading ? (
            <p>Завантаження...</p>
          ) : (
            <div className="ge-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <div className="ge-home__more">
            <Link to="/catalog" className="ge-link-more">Дивитися весь каталог →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
