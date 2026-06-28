import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const retryDelays = [350, 900];

const wait = (delay) => new Promise(resolve => setTimeout(resolve, delay));

async function fetchFeaturedProducts(attempt = 0) {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('products request failed');
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : data.products || [];
    return list.slice(0, 5);
  } catch (error) {
    if (attempt >= retryDelays.length) {
      return null;
    }

    await wait(retryDelays[attempt]);
    return fetchFeaturedProducts(attempt + 1);
  }
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetchFeaturedProducts()
      .then(featuredProducts => {
        if (!ignore) {
          setProducts(featuredProducts || []);
          setLoadFailed(featuredProducts === null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
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
          <h2 className="ge-stitle">Каталог виробів</h2>
          {loading ? (
            <p>Завантаження...</p>
          ) : loadFailed ? (
            <div className="ge-state-box">
              <p>Товари каталогу тимчасово недоступні. Перейдіть до каталогу або спробуйте оновити сторінку.</p>
            </div>
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
