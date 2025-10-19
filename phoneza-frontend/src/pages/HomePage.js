import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function HomePage() {
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Məhsullar yüklənmədi:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = () => {
    setCartCount(cartCount + 1);
  };

  const categories = [
    'Qablolar', 'Case-lər', 'Ekran Qoruyucuları', 'Şarj Cihazları', 
    'Qulaqcıqlar', 'Power Bank', 'Holder-lər', 'Aksesuarlar'
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src="/phoneza-logo.png" alt="PHONEZA Logo" className="logo-image" />
            <div className="logo-text">
              <h1>PHONEZA</h1>
              <p>Mobil Aksesuar Dünyası</p>
            </div>
          </div>

          <div className="search-bar">
            <input type="text" placeholder="🔍 Məhsul axtar..." />
          </div>

          <div className="header-icons">
            <button className="icon-btn">❤️</button>
            <button className="icon-btn">
              🛒 {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            <a href="/admin/login" className="icon-btn">👤</a>
          </div>
        </div>

        <div className="categories">
          <div className="categories-content">
            {categories.map((cat, idx) => (
              <button key={idx} className="category-btn">{cat}</button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h2>Premium Mobil Aksesuarlar</h2>
        <p>Telefonunuzu qoruyun və stilini tamamlayın</p>
        <div className="hero-buttons">
          <button className="btn btn-primary">Alış-verişə başla</button>
          <button className="btn btn-outline">Kataloq</button>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-content">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <div className="feature-text">
              <h3>Pulsuz Çatdırılma</h3>
              <p>50 AZN-dən yuxarı sifarişlərə</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <div className="feature-text">
              <h3>Orijinal Məhsullar</h3>
              <p>100% keyfiyyət zəmanəti</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <div className="feature-text">
              <h3>24/7 Dəstək</h3>
              <p>Hər zaman yanınızdayıq</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="products">
        <div className="products-content">
          <h2>Populyar Məhsullar</h2>
          <div className="products-grid">
            {loading ? (
              <p style={{gridColumn: '1/-1', textAlign: 'center', fontSize: '18px'}}>
                Məhsullar yüklənir... ⏳
              </p>
            ) : products.length === 0 ? (
              <p style={{gridColumn: '1/-1', textAlign: 'center', fontSize: '18px'}}>
                Məhsul tapılmadı 😔
              </p>
            ) : (
              products
                .filter(product => product.featured)
                .map((product) => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.image}
                      {product.tag && <span className="product-tag">{product.tag}</span>}
                    </div>
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-footer">
                        <span className="product-price">{product.price} AZN</span>
                        <button className="add-to-cart" onClick={addToCart}>Səbətə at</button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <div className="footer-logo">
              <span>🦁</span>
              <h3>PHONEZA</h3>
            </div>
            <p className="footer-desc">Premium mobil telefon aksesuarları - keyfiyyət və stil bir yerdə</p>
          </div>
          
          <div>
            <h4>Məhsullar</h4>
            <ul>
              <li>Case-lər</li>
              <li>Şarj cihazları</li>
              <li>Qulaqcıqlar</li>
              <li>Aksesuarlar</li>
            </ul>
          </div>
          
          <div>
            <h4>Məlumat</h4>
            <ul>
              <li>Haqqımızda</li>
              <li>Çatdırılma</li>
              <li>Qaytarma şərtləri</li>
              <li>Əlaqə</li>
            </ul>
          </div>
          
          <div>
            <h4>Əlaqə</h4>
            <ul>
              <li>📞 +994 XX XXX XX XX</li>
              <li>📧 info@phoneza.az</li>
              <li>📍 Bakı, Azərbaycan</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2024 PHONEZA. Bütün hüquqlar qorunur.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;