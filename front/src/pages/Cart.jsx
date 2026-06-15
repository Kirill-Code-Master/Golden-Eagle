export default function Cart() {
  return (
    <div className="ge-container">
      <h2 className="ge-stitle">Ваш кошик</h2>
      <div className="ge-cart-empty">
        <span className="ge-cart-empty__icon">🛍️</span>
        <p>Наразі ваш кошик порожній.</p>
        <p>Час додати трохи сяйва у ваше життя!</p>
      </div>
    </div>
  );
}
