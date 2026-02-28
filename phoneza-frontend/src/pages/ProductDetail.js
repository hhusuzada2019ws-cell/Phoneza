import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'inline-flex', gap: '4px', cursor: readOnly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{ fontSize: readOnly ? '16px' : '28px', color: (hovered || value) >= star ? '#f59e0b' : '#d1d5db', transition: 'color 0.15s' }}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [user, setUser] = useState(null);

  // Rəy formu
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) setUser(JSON.parse(userData));

    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data.data);

      // Wishlist yoxla
      const token = localStorage.getItem('userToken');
      if (token) {
        const wRes = await api.get('/api/wishlist');
        if (wRes.data.success) {
          setInWishlist(wRes.data.wishlist.some(p => p._id === id));
        }
      }
    } catch (err) {
      console.error('Məhsul tapılmadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/product/${id}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Rəylər yüklənmədi:', err);
    }
  };

  const addToCart = async () => {
    if (!user) {
      alert('Səbətə əlavə etmək üçün daxil olun!');
      navigate('/login');
      return;
    }
    try {
      await api.post('/api/cart', { productId: id, quantity: 1 });
      alert('✅ Məhsul səbətə əlavə edildi!');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Xəta'));
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('İstək siyahısı üçün daxil olun!');
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/api/wishlist/${id}`);
      setInWishlist(res.data.added);
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!user) {
      setReviewError('Rəy yazmaq üçün daxil olun');
      return;
    }
    if (rating === 0) {
      setReviewError('Zəhmət olmasa reytinq seçin');
      return;
    }
    if (!comment.trim()) {
      setReviewError('Rəy mətni boş ola bilməz');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/api/reviews/${id}`, { rating, comment });
      if (res.data.success) {
        setReviewSuccess('✅ Rəyiniz əlavə edildi!');
        setRating(0);
        setComment('');
        fetchReviews();
        // Məhsul reytinqini yenilə
        fetchProduct();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Rəy əlavə edilmədi');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Rəyi silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      fetchReviews();
      fetchProduct();
    } catch (err) {
      alert('Silmə xətası: ' + (err.response?.data?.message || 'Xəta'));
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' }}>
      <p style={{ fontSize: '20px', color: '#64748b' }}>Yüklənir... ⏳</p>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '48px' }}>😔</p>
        <p style={{ fontSize: '20px', color: '#64748b' }}>Məhsul tapılmadı</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '16px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Ana Səhifə</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', marginBottom: '24px' }}>
          ← Geri
        </button>

        {/* Product detail card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

          {/* Image */}
          <div style={{ background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', position: 'relative', overflow: 'hidden' }}>
            {product.image && product.image.startsWith('http') ? (
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
            ) : (
              <span style={{ fontSize: '100px' }}>{product.image || '📱'}</span>
            )}
            {product.tag && (
              <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                {product.tag}
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>{product.category}</p>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1e293b', marginBottom: '12px', lineHeight: 1.3 }}>{product.name}</h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <StarRating value={Math.round(product.averageRating || 0)} readOnly />
              <span style={{ color: '#64748b', fontSize: '14px' }}>
                {product.numReviews > 0 ? `${product.averageRating?.toFixed(1)} (${product.numReviews} rəy)` : 'Hələ rəy yoxdur'}
              </span>
            </div>

            <p style={{ fontSize: '32px', fontWeight: 800, color: '#3b82f6', marginBottom: '16px' }}>{product.price} AZN</p>

            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '24px', fontSize: '15px' }}>{product.description}</p>

            {/* Stock */}
            <p style={{ fontSize: '14px', marginBottom: '20px', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {product.stock > 0 ? `✅ Stokda var (${product.stock} ədəd)` : '❌ Stokda yoxdur'}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                style={{
                  flex: 1, padding: '14px', background: product.stock === 0 ? '#94a3b8' : '#3b82f6',
                  color: 'white', border: 'none', borderRadius: '12px', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: '16px'
                }}
              >
                🛒 {product.stock === 0 ? 'Stokda yoxdur' : 'Səbətə əlavə et'}
              </button>
              <button
                onClick={toggleWishlist}
                style={{
                  padding: '14px 18px', background: inWishlist ? '#fee2e2' : '#f1f5f9',
                  color: inWishlist ? '#ef4444' : '#64748b', border: 'none',
                  borderRadius: '12px', cursor: 'pointer', fontSize: '22px'
                }}
                title={inWishlist ? 'Wishlist-dən çıxar' : 'Wishlist-ə əlavə et'}
              >
                {inWishlist ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>
            💬 Rəylər {reviews.length > 0 && <span style={{ color: '#64748b', fontWeight: 400, fontSize: '16px' }}>({reviews.length})</span>}
          </h2>

          {/* Add review form */}
          {user ? (
            <form onSubmit={submitReview} style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Rəyinizi bildirin</h3>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '6px' }}>Reytinq</label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '6px' }}>Şərhiniz</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Məhsul haqqında fikirlerinizi yazın..."
                  rows={4}
                  maxLength={1000}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>{comment.length}/1000</div>
              </div>

              {reviewError && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px' }}>⚠️ {reviewError}</p>}
              {reviewSuccess && <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>{reviewSuccess}</p>}

              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: submitting ? 'wait' : 'pointer', fontWeight: 600, fontSize: '14px' }}
              >
                {submitting ? 'Göndərilir...' : '📤 Rəy göndər'}
              </button>
            </form>
          ) : (
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'center' }}>
              <p style={{ color: '#64748b', marginBottom: '12px' }}>Rəy yazmaq üçün daxil olun</p>
              <a href="/login" style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>Daxil ol</a>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <p style={{ fontSize: '40px', marginBottom: '8px' }}>💭</p>
              <p style={{ fontSize: '16px' }}>Bu məhsul üçün hələ rəy yoxdur. İlk rəyi siz yazın!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(review => (
                <div key={review._id} style={{ padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{review.user?.name || 'İstifadəçi'}</span>
                      <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '8px' }}>{formatDate(review.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating value={review.rating} readOnly />
                      {user && review.user?._id === user._id && (
                        <button
                          onClick={() => deleteReview(review._id)}
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
