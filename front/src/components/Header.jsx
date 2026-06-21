import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getCartCount } from '../lib/cart';
import logo from '../images/logo_golden-eagle.png';
import './Header.css';

export default function Header() {
  const [cartCount, setCartCount] = useState(() => getCartCount());

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount());

    window.addEventListener('golden-eagle-cart-change', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('golden-eagle-cart-change', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  return (
    <header className="ge-header">
      <div className="ge-container ge-header__inner">
        <Link to="/" className="ge-logo">
          <img src={logo} alt="Golden Eagle Logo" className="ge-logo__img" />
          <div className="ge-logo__text">
            <p className="ge-logo__name">GOLDEN EAGLE</p>
            <p className="ge-logo__sub">Ювелірний магазин</p>
          </div>
        </Link>

        <nav className="ge-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "ge-nav__link ge-nav__link--active" : "ge-nav__link"}>
            Головна
          </NavLink>
          <NavLink to="/catalog" className={({ isActive }) => isActive ? "ge-nav__link ge-nav__link--active" : "ge-nav__link"}>
            Каталог
          </NavLink>
        </nav>

        <div className="ge-header__actions">
          <Link to="/cart" className="ge-cart-link">
            <span className="ge-cart-link__icon">🛒</span>
            <span className="ge-cart-link__text">Кошик</span>
            {cartCount > 0 && (
              <span className="ge-cart-link__count">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
