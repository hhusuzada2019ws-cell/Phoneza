import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './UserAuth.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifrələr uyğun gəlmir');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifrə ən azı 6 simvol olmalıdır');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/api/users/reset-password/${token}`, {
        password: formData.password
      });

      alert('✅ Şifrəniz uğurla yeniləndi!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Token etibarsızdır və ya vaxtı keçib');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="logo-icon">🔐</span>
          <h1>PHONEZA</h1>
          <p>Yeni Şifrə Təyin Et</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Yeni Şifrə</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>Şifrə Təkrarı</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Yenilənir...' : 'Şifrəni Yenilə'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">← Giriş səhifəsinə qayıt</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
