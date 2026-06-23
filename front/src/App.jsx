import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import Auth from './pages/Auth';
import OrderInfo from './pages/OrderInfo';
import './pages/Home.css';

function App() {
  return (
    <div className="ge-app">
      <Header />
      <main className="ge-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/order-info" element={<OrderInfo />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
