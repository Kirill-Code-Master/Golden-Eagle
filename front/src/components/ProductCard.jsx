import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductToCart, isProductInCart } from '../lib/cart';
import { getProductImageSrc } from '../lib/images';

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
  const [inCart, setInCart] = useState(() => isProductInCart(product._id));
  const icon = CAT_ICON[product.category] ?? '💎';
  const imageSrc = getProductImageSrc(product.image);

  useEffect(() => {
    setImgBroken(false);
  }, [imageSrc]);

  useEffect(() => {
    const updateCartState = () => setInCart(isProductInCart(product._id));

    updateCartState();
    window.addEventListener('golden-eagle-cart-change', updateCartState);
    return () => window.removeEventListener('golden-eagle-cart-change', updateCartState);
  }, [product._id]);

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
    if (inCart) {
      navigate('/cart');
      return;
    }

    addProductToCart(product._id);
    setInCart(true);
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
        {!imgBroken && imageSrc ? (
          <img
            key={imageSrc}
            src={imageSrc}
            alt={product.name}
            onError={() => setImgBroken(true)}
          />
        ) : (
          <span className="ge-card__emoji">{icon}</span>
        )}
      </div>
      <div className="ge-card__body">
        <h3 className="ge-card__name">{product.name}</h3>
        {product.material && (
          <p className="ge-card__material">{product.material}</p>
        )}
        <div className="ge-card__footer">
          <span className="ge-price">{Number(product.price || 0).toLocaleString('uk-UA')} ₴</span>
          <div className={`ge-card__actions ${isAdmin ? 'ge-card__actions--admin' : ''}`}>
            <button className="ge-btn-view ge-card__cart-btn" type="button" onClick={handleAddToCart}>
              {inCart ? 'До кошика' : 'В кошик'}
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
