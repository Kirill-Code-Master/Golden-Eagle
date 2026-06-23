import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getCartCount } from '../lib/cart';
import { getCurrentUser, clearSession } from '../lib/auth';
import logo from '../images/logo_golden-eagle.png';
import './Header.css';

export default function Header() {
  const [cartCount, setCartCount] = useState(() => getCartCount());
  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount());
    const handleAuthChange = () => setUser(getCurrentUser());

    window.addEventListener('golden-eagle-cart-change', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('golden-eagle-auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('golden-eagle-cart-change', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('golden-eagle-auth-change', handleAuthChange);
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

          {user ? (
            <div className="ge-user-info">
              <span className="ge-user-name" title={`Роль: ${user.role}`}>
                👤 {user.username}
                {user.role === 'admin' && <span className="ge-badge-admin">Admin</span>}
              </span>
              <button 
                type="button" 
                onClick={() => clearSession()}
                className="ge-btn-logout"
              >
                Вийти
              </button>
            </div>
          ) : (
            <div className="ge-auth-buttons">
              <Link to="/login" className="ge-btn-login">Увійти</Link>
              <Link to="/register" className="ge-btn-register">Реєстрація</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
