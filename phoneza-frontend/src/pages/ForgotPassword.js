import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './UserAuth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/users/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-logo">
            <span className="logo-icon">📧</span>
            <h1>Email Göndərildi</h1>
          </div>
          <p style={{ textAlign: 'center', color: '#475569', marginBottom: '20px' }}>
            <strong>{email}</strong> ünvanına şifrə bərpası linki göndərildi.<br />
            Email gəlmirirsə spam qovluğunu yoxlayın.
          </p>
          <div className="auth-footer">
            <Link to="/login">← Giriş səhifəsinə qayıt</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="logo-icon">🔑</span>
          <h1>PHONEZA</h1>
          <p>Şifrəni Bərpa Et</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email ünvanı</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Göndərilir...' : 'Bərpa Linki Göndər'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">← Giriş səhifəsinə qayıt</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
