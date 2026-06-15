import './Footer.css';

export default function Footer() {
  return (
    <footer className="ge-footer">
      <div className="ge-container ge-footer__inner">
        <div className="ge-footer__section">
          <p className="ge-footer__logo">GOLDEN EAGLE</p>
          <p className="ge-footer__desc">Вишукані ювелірні вироби для особливих моментів вашого життя.</p>
        </div>
        
        <div className="ge-footer__section">
          <h4 className="ge-footer__title">Контакти</h4>
          <p>м. Київ, вул. Ювелірна, 1</p>
          <p>+38 (044) 123-45-67</p>
          <p>info@golden-eagle.ua</p>
        </div>

        <div className="ge-footer__section">
          <h4 className="ge-footer__title">Ми у соцмережах</h4>
          <div className="ge-footer__socials">
            <a href="#" className="ge-footer__social-link">Instagram</a>
            <a href="#" className="ge-footer__social-link">Facebook</a>
          </div>
        </div>
      </div>
      <div className="ge-footer__bottom">
        <div className="ge-container">
          <p>&copy; {new Date().getFullYear()} GOLDEN EAGLE. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}
