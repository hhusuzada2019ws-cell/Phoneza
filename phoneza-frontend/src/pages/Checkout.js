import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './Checkout.css';

function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('userToken');

    if (!userData || !token) {
      alert('Sifariş vermək üçün daxil olun!');
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // User məlumatlarından formu doldur
    setFormData(prev => ({
      ...prev,
      fullName: parsedUser.name || '',
      phone: parsedUser.phone || ''
    }));

    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/api/cart');

      if (response.data.cart.length === 0) {
        alert('Səbətiniz boşdur!');
        navigate('/cart');
        return;
      }

      setCart(response.data.cart);
      setLoading(false);
    } catch (error) {
      console.error('Səbət yüklənmədi:', error);
      alert('Xəta baş verdi!');
      navigate('/cart');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 50 ? 0 : 5;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      alert('Bütün məcburi xanaları doldurun!');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/api/orders', {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });

      if (response.data.success) {
        alert('✅ Sifarişiniz qəbul edildi!');
        navigate(`/order-success/${response.data.order._id}`);
      }
    } catch (error) {
      alert('❌ Xəta: ' + (error.response?.data?.message || 'Sifariş yaradılmadı'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading">Yüklənir... ⏳</div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <Link to="/cart" className="back-btn">← Səbətə qayıt</Link>
        <h1>🛒 Sifarişi Tamamla</h1>
      </div>

      <div className="checkout-content">
        {/* Form */}
        <div className="checkout-form-section">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>📍 Çatdırılma Məlumatları</h2>

              <div className="form-group">
                <label>Ad Soyad *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Adınız və Soyadınız"
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefon *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+994 XX XXX XX XX"
                  required
                />
              </div>

              <div className="form-group">
                <label>Şəhər *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                >
                  <option value="">Şəhər seçin</option>
                  <option value="Bakı">Bakı</option>
                  <option value="Gəncə">Gəncə</option>
                  <option value="Sumqayıt">Sumqayıt</option>
                  <option value="Mingəçevir">Mingəçevir</option>
                  <option value="Şəki">Şəki</option>
                  <option value="Lənkəran">Lənkəran</option>
                  <option value="Naxçıvan">Naxçıvan</option>
                  <option value="Digər">Digər</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ünvan *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Küçə, bina, mənzil..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Poçt Kodu</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="AZ1000"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>💳 Ödəniş Metodu</h2>

              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">💵</span>
                    <div>
                      <strong>Nağd Ödəniş</strong>
                      <p>Çatdırılma zamanı ödə</p>
                    </div>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">💳</span>
                    <div>
                      <strong>Kart ilə Ödəniş</strong>
                      <p>Çatdırılma zamanı terminal</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2>📝 Qeyd (İstəyə görə)</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Çatdırılma haqqında əlavə məlumat..."
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="submit-order-btn"
              disabled={submitting}
            >
              {submitting ? 'Göndərilir...' : '✅ Sifarişi Təsdiqlə'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <div className="order-summary">
            <h2>Sifariş Xülasəsi</h2>

            <div className="summary-items">
              {cart.map((item) => (
                <div key={item._id} className="summary-item">
                  <div className="item-image">
                    {item.product?.image && item.product.image.startsWith('http') ? (
                      <img src={item.product.image} alt={item.product.name} />
                    ) : (
                      <span>{item.product?.image || '📱'}</span>
                    )}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.product?.name}</div>
                    <div className="item-quantity">Miqdar: {item.quantity}</div>
                  </div>
                  <div className="item-price">
                    {(item.product?.price * item.quantity).toFixed(2)} AZN
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-calculations">
              <div className="calc-row">
                <span>Ara cəm:</span>
                <span>{calculateSubtotal().toFixed(2)} AZN</span>
              </div>
              <div className="calc-row">
                <span>Çatdırılma:</span>
                <span>
                  {calculateShipping() === 0 ? (
                    <span className="free-shipping">Pulsuz ✅</span>
                  ) : (
                    `${calculateShipping().toFixed(2)} AZN`
                  )}
                </span>
              </div>
              {calculateSubtotal() < 50 && (
                <div className="shipping-note">
                  💡 50 AZN-dən yuxarı sifarişlərə çatdırılma pulsuzdur
                </div>
              )}
              <div className="calc-row total">
                <span>Ümumi:</span>
                <span>{calculateTotal().toFixed(2)} AZN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;