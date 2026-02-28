import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './MyOrders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('userToken');

    if (!userData || !token) {
      alert('Daxil olun!');
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders/my-orders');

      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Sifarişlər yüklənmədi:', error);
      alert('Xəta baş verdi!');
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Bu sifarişi ləğv etmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const response = await api.put(`/api/orders/${orderId}/cancel`, {});

      if (response.data.success) {
        alert('✅ Sifariş ləğv edildi');
        fetchOrders();
      }
    } catch (error) {
      alert('❌ Xəta: ' + (error.response?.data?.message || 'Sifariş ləğv edilmədi'));
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: '⏳ Gözləyir',
      confirmed: '✅ Təsdiqləndi',
      processing: '📦 Hazırlanır',
      shipped: '🚚 Yoldadır',
      delivered: '✅ Çatdırıldı',
      cancelled: '❌ Ləğv edildi'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return classMap[status] || '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="my-orders-container">
        <div className="loading">Yüklənir... ⏳</div>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <header className="orders-header">
        <Link to="/" className="back-btn">← Ana səhifə</Link>
        <h1>📋 Sifarişlərim</h1>
        {user && <span className="user-name">Salam, {user.name}</span>}
      </header>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>Hələ sifarişiniz yoxdur</h2>
          <p>İlk sifarişinizi vermək üçün alış-verişə başlayın!</p>
          <Link to="/" className="shop-btn">Alış-verişə başla</Link>
        </div>
      ) : (
        <div className="orders-content">
          <div className="orders-stats">
            <div className="stat-box">
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Ümumi Sifariş</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="stat-label">Gözləyən</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="stat-label">Çatdırılmış</div>
            </div>
          </div>

          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info-left">
                    <div className="order-number">
                      Sifariş #{order.orderNumber}
                    </div>
                    <div className="order-date">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="order-info-right">
                    <span className={`order-status ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item._id} className="item-preview">
                      <div className="item-image-small">
                        {item.image && item.image.startsWith('http') ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <span>{item.image || '📱'}</span>
                        )}
                      </div>
                      <div className="item-preview-info">
                        <div className="item-preview-name">{item.name}</div>
                        <div className="item-preview-qty">x{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="more-items">
                      +{order.items.length - 3} məhsul
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span className="total-label">Ümumi:</span>
                    <span className="total-amount">{order.totalAmount.toFixed(2)} AZN</span>
                  </div>

                  <div className="order-actions">
                    <Link to={`/order-success/${order._id}`} className="btn-view">
                      👁️ Ətraflı
                    </Link>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => cancelOrder(order._id)}
                        className="btn-cancel"
                      >
                        ❌ Ləğv et
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;