import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../lib/cart';

const CAT_ICON = {
  'Каблучки': '💍',
  'Ланцюжки': '⛓️',
  'Браслети': '📿',
  'Сережки': '✨',
  'Підвіски': '🔮',
  'Обручки': '💛',
  'Хрестики': '✝️',
};

export default function ProductCard({ product, isAdmin = false, onEdit }) {
  const navigate = useNavigate();
  const [imgBroken, setImgBroken] = useState(false);
  const [added, setAdded] = useState(false);
  const icon = CAT_ICON[product.category] ?? '💎';

  const goToProduct = () => {
    navigate(`/product/${product._id}`, { state: { product } });
  };

  const handleCardKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToProduct();
    }
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();
    addProductToCart(product._id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    onEdit?.(product);
  };

  return (
    <article
      className="ge-card ge-card--clickable"
      role="link"
      tabIndex={0}
      onClick={goToProduct}
      onKeyDown={handleCardKeyDown}
      aria-label={`Переглянути товар ${product.name}`}
    >
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
          <span className="ge-price">{Number(product.price || 0).toLocaleString('uk-UA')} ₴</span>
          <div className={`ge-card__actions ${isAdmin ? 'ge-card__actions--admin' : ''}`}>
            <button className="ge-btn-view ge-card__cart-btn" type="button" onClick={handleAddToCart}>
              {added ? 'Додано' : 'В кошик'}
            </button>
            {isAdmin && (
              <button className="ge-btn-view" type="button" onClick={handleEdit}>
                Редагувати
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
