import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [navigate]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/api/wishlist');
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error('Wishlist yüklənmədi:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/api/wishlist/${productId}`);
      setWishlist(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      alert('Silmə xətası: ' + (err.response?.data?.message || 'Xəta'));
    }
  };

  const addToCart = async (productId) => {
    try {
      const res = await api.post('/api/cart', { productId, quantity: 1 });
      if (res.data.success) {
        alert('✅ Məhsul səbətə əlavə edildi!');
      }
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Səbətə əlavə edilmədi'));
    }
  };

  const styles = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', padding: '24px' },
    container: { maxWidth: '900px', margin: '0 auto' },
    header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' },
    backBtn: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px' },
    title: { fontSize: '28px', fontWeight: 700, color: '#1e293b' },
    count: { color: '#64748b', fontSize: '16px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
    card: { background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    imgBox: { height: '200px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    info: { padding: '16px' },
    name: { fontWeight: 600, fontSize: '15px', color: '#1e293b', marginBottom: '4px' },
    category: { fontSize: '12px', color: '#94a3b8', marginBottom: '4px' },
    rating: { fontSize: '12px', color: '#f59e0b', marginBottom: '8px' },
    price: { fontSize: '18px', fontWeight: 700, color: '#3b82f6', marginBottom: '12px' },
    actions: { display: 'flex', gap: '8px' },
    cartBtn: { flex: 1, padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' },
    removeBtn: { padding: '8px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
    empty: { textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '16px' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>← Geri</button>
          <div>
            <h1 style={styles.title}>❤️ İstək Siyahısı</h1>
            {!loading && <p style={styles.count}>{wishlist.length} məhsul</p>}
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#64748b' }}>Yüklənir... ⏳</p>
        ) : wishlist.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '60px', marginBottom: '16px' }}>💔</p>
            <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>İstək siyahınız boşdur</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Bəyəndiyiniz məhsulları buraya əlavə edin</p>
            <Link to="/" style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
              Məhsullara bax
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {wishlist.map(product => (
              <div key={product._id} style={styles.card}>
                <div style={styles.imgBox}>
                  {product.image && product.image.startsWith('http') ? (
                    <img src={product.image} alt={product.name} style={styles.img} />
                  ) : (
                    <span style={{ fontSize: '70px' }}>{product.image || '📱'}</span>
                  )}
                  {product.tag && (
                    <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                      {product.tag}
                    </span>
                  )}
                </div>
                <div style={styles.info}>
                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                    <p style={styles.name}>{product.name}</p>
                  </Link>
                  <p style={styles.category}>{product.category}</p>
                  {product.numReviews > 0 && (
                    <p style={styles.rating}>
                      {'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}
                      <span style={{ color: '#94a3b8', marginLeft: '4px' }}>({product.numReviews})</span>
                    </p>
                  )}
                  <p style={styles.price}>{product.price} AZN</p>
                  <div style={styles.actions}>
                    <button
                      style={{ ...styles.cartBtn, opacity: product.stock === 0 ? 0.5 : 1 }}
                      onClick={() => addToCart(product._id)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Stokda yoxdur' : '🛒 Səbətə at'}
                    </button>
                    <button style={styles.removeBtn} onClick={() => removeFromWishlist(product._id)} title="Sil">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
