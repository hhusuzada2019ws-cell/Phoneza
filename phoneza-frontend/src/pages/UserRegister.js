import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './UserAuth.css';

function UserRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
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
      const response = await api.post('/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      if (response.data.success) {
        // Token və user məlumatını save et
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        alert('✅ Qeydiyyat uğurlu!');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Qeydiyyat xətası');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="logo-icon">🦁</span>
          <h1>PHONEZA</h1>
          <p>Qeydiyyat</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Ad Soyad</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Adınız"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Telefon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+994 XX XXX XX XX"
            />
          </div>

          <div className="form-group">
            <label>Şifrə</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>Şifrə Təkrarı</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Gözləyin...' : 'Qeydiyyatdan keç'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Artıq hesabınız var? <Link to="/login">Daxil ol</Link></p>
          <Link to="/">← Ana səhifəyə qayıt</Link>
        </div>
      </div>
    </div>
  );
}

export default UserRegister;