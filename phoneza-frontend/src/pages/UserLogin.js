import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './UserAuth.css';

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, formData);

      if (response.data.success) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        alert('✅ Xoş gəldiniz!');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login xətası');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="logo-icon">🦁</span>
          <h1>PHONEZA</h1>
          <p>Daxil ol</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Gözləyin...' : 'Daxil ol'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Hesabınız yoxdur? <Link to="/register">Qeydiyyatdan keç</Link></p>
          <Link to="/">← Ana səhifəyə qayıt</Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;