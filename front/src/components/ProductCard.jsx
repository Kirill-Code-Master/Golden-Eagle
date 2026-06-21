import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addProductToCart } from '../lib/cart';

const CAT_ICON = {
  'Каблучки': '💍',
  'Ланцюжки': '⛓️',
  'Браслети': '📿',
  'Сережки':  '✨',
  'Підвіски': '🔮',
  'Обручки':  '💛',
  'Хрестики': '✝️',
};

export default function ProductCard({ product }) {
  const [imgBroken, setImgBroken] = useState(false);
  const [added, setAdded] = useState(false);
  const icon = CAT_ICON[product.category] ?? '💎';

  const handleAddToCart = () => {
    addProductToCart(product._id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="ge-card">
      <div className="ge-card__thumb">
        {!imgBroken && product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            onError={() => setImgBroken(true)} 
          />
        ) : (
          <span className="ge-card__emoji">{icon}</span>
        )}
      </div>
      <div className="ge-card__body">
        <span className="ge-tag">{icon} {product.category}</span>
        <h3 className="ge-card__name">{product.name}</h3>
        {product.material && (
          <p className="ge-card__material">{product.material}</p>
        )}
        <div className="ge-card__footer">
          <span className="ge-price">{product.price.toLocaleString('uk-UA')} ₴</span>
          <div className="ge-card__actions">
            <button className="ge-btn-view" type="button" onClick={handleAddToCart}>
              {added ? 'Додано' : 'В кошик'}
            </button>
            <Link
              to={`/product/${product._id}`}
              state={{ product }}
              className="ge-btn-view"
            >
              Переглянути
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
