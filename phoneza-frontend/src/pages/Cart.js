import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // User yoxla
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('userToken');

    if (!userData || !token) {
      alert('Səbəti görmək üçün daxil olun!');
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchCart(token);
  }, [navigate]);

  const fetchCart = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCart(response.data.cart);
      setLoading(false);
    } catch (error) {
      console.error('Səbət yüklənmədi:', error);
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      const token = localStorage.getItem('userToken');
      
      await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchCart(token);
    } catch (error) {
      alert('Xəta: ' + (error.response?.data?.message || 'Yenilənmədi'));
    }
  };

  const removeFromCart = async (productId) => {
    if (!window.confirm('Bu məhsulu səbətdən çıxarmaq istəyirsiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      
      await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchCart(token);
      alert('✅ Məhsul səbətdən çıxarıldı');
    } catch (error) {
      alert('Xəta: ' + (error.response?.data?.message || 'Çıxarılmadı'));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">Yüklənir... ⏳</div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <header className="cart-header">
        <Link to="/" className="back-btn">← Ana səhifə</Link>
        <h1>🛒 Səbətim</h1>
        {user && <span className="user-name">Salam, {user.name}</span>}
      </header>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Səbətiniz boşdur</h2>
          <p>Məhsul əlavə etmək üçün alış-verişə başlayın!</p>
          <Link to="/" className="shop-btn">Alış-verişə başla</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-image">{item.product?.image || '📱'}</div>
                
                <div className="item-info">
                  <h3>{item.product?.name}</h3>
                  <p className="item-price">{item.product?.price} AZN</p>
                </div>

                <div className="item-quantity">
                  <button 
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <div className="item-total">
                  {(item.product?.price * item.quantity).toFixed(2)} AZN
                </div>

                <button 
                  className="item-remove"
                  onClick={() => removeFromCart(item.product._id)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Sifariş Xülasəsi</h2>
            
            <div className="summary-row">
              <span>Məhsul sayı:</span>
              <span>{cart.length}</span>
            </div>

            <div className="summary-row">
              <span>Cəmi miqdar:</span>
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>

            <div className="summary-row total">
              <span>Ümumi məbləğ:</span>
              <span>{calculateTotal()} AZN</span>
            </div>

            <button className="checkout-btn">
              Sifarişi tamamla
            </button>

            <Link to="/" className="continue-shopping">
              Alış-verişə davam et →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;