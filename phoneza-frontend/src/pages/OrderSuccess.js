import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './OrderSuccess.css';

function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');

    if (!token) {
      alert('Daxil olun!');
      navigate('/login');
      return;
    }

    fetchOrder();
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);

      setOrder(response.data.order);
      setLoading(false);
    } catch (error) {
      console.error('Sifariş yüklənmədi:', error);
      alert('Sifariş tapılmadı!');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="loading">Yüklənir... ⏳</div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h1>Sifarişiniz Qəbul Edildi!</h1>
        <p className="success-message">
          Təşəkkür edirik! Sifarişiniz uğurla qeydə alındı və tezliklə emal olunacaq.
        </p>

        <div className="order-info-box">
          <div className="order-number">
            <span className="label">Sifariş Nömrəsi:</span>
            <span className="value">{order.orderNumber}</span>
          </div>

          <div className="order-status">
            <span className="label">Status:</span>
            <span className={`status-badge ${order.status}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="order-details">
          <h2>Sifariş Təfərrüatları</h2>

          <div className="detail-section">
            <h3>📦 Məhsullar</h3>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item._id} className="order-item">
                  <div className="item-image">
                    {item.image && item.image.startsWith('http') ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>{item.image || '📱'}</span>
                    )}
                  </div>
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-details-text">
                      {item.quantity} x {item.price} AZN
                    </div>
                  </div>
                  <div className="item-total">
                    {(item.quantity * item.price).toFixed(2)} AZN
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>📍 Çatdırılma Ünvanı</h3>
            <div className="address-box">
              <p><strong>{order.shippingAddress.fullName}</strong></p>
              <p>📞 {order.shippingAddress.phone}</p>
              <p>🏙️ {order.shippingAddress.city}</p>
              <p>📍 {order.shippingAddress.address}</p>
              {order.shippingAddress.postalCode && (
                <p>📮 {order.shippingAddress.postalCode}</p>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>💳 Ödəniş</h3>
            <div className="payment-box">
              <p>
                <strong>Metod:</strong>{' '}
                {order.paymentMethod === 'cash' ? '💵 Nağd Ödəniş' : '💳 Kart ilə Ödəniş'}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {order.isPaid ? (
                  <span className="paid">✅ Ödənilib</span>
                ) : (
                  <span className="unpaid">⏳ Gözləyir</span>
                )}
              </p>
            </div>
          </div>

          <div className="detail-section">
            <h3>💰 Məbləğ</h3>
            <div className="amount-box">
              <div className="amount-row">
                <span>Ara cəm:</span>
                <span>{order.subtotal.toFixed(2)} AZN</span>
              </div>
              <div className="amount-row">
                <span>Çatdırılma:</span>
                <span>
                  {order.shippingCost === 0 ? (
                    <span className="free">Pulsuz ✅</span>
                  ) : (
                    `${order.shippingCost.toFixed(2)} AZN`
                  )}
                </span>
              </div>
              <div className="amount-row total">
                <span>Ümumi:</span>
                <span>{order.totalAmount.toFixed(2)} AZN</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="detail-section">
              <h3>📝 Qeyd</h3>
              <div className="notes-box">
                <p>{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <Link to="/" className="btn-home">
            🏠 Ana səhifə
          </Link>
          <Link to="/my-orders" className="btn-orders">
            📋 Sifarişlərim
          </Link>
        </div>
      </div>
    </div>
  );
}

// Status helper
function getStatusText(status) {
  const statusMap = {
    pending: '⏳ Gözləyir',
    confirmed: '✅ Təsdiqləndi',
    processing: '📦 Hazırlanır',
    shipped: '🚚 Yoldadır',
    delivered: '✅ Çatdırıldı',
    cancelled: '❌ Ləğv edildi'
  };
  return statusMap[status] || status;
}

export default OrderSuccess;