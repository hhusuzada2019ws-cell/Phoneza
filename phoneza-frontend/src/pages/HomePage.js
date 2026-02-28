import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import '../App.css';

const CATEGORIES = [
  'Qablolar', 'Case-lər', 'Ekran Qoruyucuları', 'Şarj Cihazları',
  'Qulaqcıqlar', 'Power Bank', 'Holder-lər', 'Aksesuarlar'
];

function HomePage() {
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]); // wishlist məhsul ID-ləri

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Wishlist yüklə
      fetchWishlist();
    }
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/api/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist.map(p => p._id));
      }
    } catch (err) {
      // Sessiya yoxdursa ignore et
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (selectedCategory) params.category = selectedCategory;
      if (!showAllProducts && !searchText && !selectedCategory) params.featured = 'true';

      const response = await api.get('/api/products', { params });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Məhsullar yüklənmədi:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedCategory, showAllProducts]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const addToCart = async (productId) => {
    if (!user) {
      alert('Səbətə əlavə etmək üçün daxil olun!');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await api.post('/api/cart', { productId, quantity: 1 });
      if (response.data.success) {
        setCartCount(prev => prev + 1);
        alert('✅ Məhsul səbətə əlavə edildi!');
      }
    } catch (error) {
      alert('❌ Xəta: ' + (error.response?.data?.message || 'Səbətə əlavə edilmədi'));
    }
  };

  const toggleWishlist = async (productId, e) => {
    e.stopPropagation();
    if (!user) {
      alert('İstək siyahısı üçün daxil olun!');
      window.location.href = '/login';
      return;
    }

    try {
      const res = await api.post(`/api/wishlist/${productId}`);
      if (res.data.added) {
        setWishlist(prev => [...prev, productId]);
      } else {
        setWishlist(prev => prev.filter(id => id !== productId));
      }
    } catch (err) {
      console.error('Wishlist xətası:', err);
    }
  };

  const handleCategoryClick = (cat) => {
    if (selectedCategory === cat) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(cat);
      setShowAllProducts(true);
    }
  };

  const handleShowAll = () => {
    setShowAllProducts(true);
    setSelectedCategory('');
    setSearchText('');
  };

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
            <input
              type="text"
              placeholder="🔍 Məhsul axtar..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setShowAllProducts(true);
              }}
            />
            {searchText && (
              <button
                onClick={() => { setSearchText(''); setShowAllProducts(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginLeft: '4px' }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="header-icons">
            <Link to="/wishlist" className="icon-btn" title="İstək Siyahısı">
              ❤️ {wishlist.length > 0 && <span className="cart-count">{wishlist.length}</span>}
            </Link>
            <Link to="/cart" className="icon-btn">
              🛒 {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/my-orders" style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
                  📋 Sifarişlərim
                </Link>
                <span style={{ fontSize: '14px', color: '#475569' }}>Salam, {user.name}</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userData');
                    setUser(null);
                    setWishlist([]);
                  }}
                  className="icon-btn"
                >
                  🚪
                </button>
              </div>
            ) : (
              <a href="/login" className="icon-btn">👤</a>
            )}
          </div>
        </div>

        <div className="categories">
          <div className="categories-content">
            <button
              className={`category-btn ${!selectedCategory && showAllProducts ? 'active' : ''}`}
              onClick={handleShowAll}
            >
              Hamısı
            </button>
            {CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      {!searchText && !selectedCategory && !showAllProducts && (
        <section className="hero">
          <h2>Premium Mobil Aksesuarlar</h2>
          <p>Telefonunuzu qoruyun və stilini tamamlayın</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleShowAll}>Alış-verişə başla</button>
            <button className="btn btn-outline" onClick={handleShowAll}>Kataloq</button>
          </div>
        </section>
      )}

      {/* Features */}
      {!searchText && !selectedCategory && !showAllProducts && (
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
      )}

      {/* Products */}
      <section className="products">
        <div className="products-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>
              {selectedCategory
                ? selectedCategory
                : searchText
                ? `"${searchText}" axtarış nəticələri`
                : showAllProducts
                ? 'Bütün Məhsullar'
                : 'Populyar Məhsullar'}
            </h2>
            {!loading && <span style={{ color: '#64748b', fontSize: '14px' }}>{products.length} məhsul</span>}
          </div>

          <div className="products-grid">
            {loading ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: '18px' }}>
                Məhsullar yüklənir... ⏳
              </p>
            ) : products.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '48px' }}>😔</p>
                <p style={{ fontSize: '18px', color: '#64748b' }}>
                  {searchText ? `"${searchText}" üçün məhsul tapılmadı` : 'Məhsul tapılmadı'}
                </p>
                {searchText && (
                  <button
                    onClick={() => { setSearchText(''); setShowAllProducts(true); }}
                    style={{ marginTop: '12px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Axtarışı təmizlə
                  </button>
                )}
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image" style={{ position: 'relative' }}>
                    {product.image && product.image.startsWith('http') ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '80px' }}>{product.image || '📱'}</span>
                    )}
                    {product.tag && <span className="product-tag">{product.tag}</span>}

                    {/* Wishlist düyməsi */}
                    <button
                      className="wishlist-btn"
                      onClick={(e) => toggleWishlist(product._id, e)}
                      title={wishlist.includes(product._id) ? 'Wishlist-dən çıxar' : 'Wishlist-ə əlavə et'}
                    >
                      {wishlist.includes(product._id) ? '❤️' : '🤍'}
                    </button>

                    {product.stock === 0 && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.4)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', borderRadius: '12px 12px 0 0'
                      }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>Stokda yoxdur</span>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <Link
                      to={`/product/${product._id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="product-name">{product.name}</div>
                    </Link>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>{product.category}</div>
                    {/* Reytinq göstər */}
                    {product.numReviews > 0 && (
                      <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '4px' }}>
                        {'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}
                        <span style={{ color: '#94a3b8', marginLeft: '4px' }}>({product.numReviews})</span>
                      </div>
                    )}
                    <div className="product-footer">
                      <span className="product-price">{product.price} AZN</span>
                      <button
                        className="add-to-cart"
                        onClick={() => addToCart(product._id)}
                        disabled={product.stock === 0}
                        style={{ opacity: product.stock === 0 ? 0.5 : 1 }}
                      >
                        {product.stock === 0 ? 'Yoxdur' : 'Səbətə at'}
                      </button>
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
              <li>📞 +994 55 529 94 86</li>
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
