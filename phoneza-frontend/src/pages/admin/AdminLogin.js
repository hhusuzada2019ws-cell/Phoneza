import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './AdminLogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        // Token-i localStorage-ə save et
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        // Dashboard-a yönləndir
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login xətası baş verdi');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="login-logo">
          <span className="logo-icon">🦁</span>
          <h1>PHONEZA</h1>
          <p>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@phoneza.az"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Gözləyin...' : 'Daxil ol'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">← Ana səhifəyə qayıt</a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;