import { useState } from 'react';
import { Link } from 'react-router-dom';

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
  const icon = CAT_ICON[product.category] ?? '💎';

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
        <div className="ge-card__footer">
          <span className="ge-price">{product.price.toLocaleString('uk-UA')} ₴</span>
          <Link to={`/product/${product._id}`} className="ge-btn-view">
            Переглянути
          </Link>
        </div>
      </div>
    </article>
  );
}
