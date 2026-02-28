import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/api/admin/users', { params });
      setUsers(response.data.users);
    } catch (error) {
      console.error('İstifadəçilər yüklənmədi:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const toggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deaktivləşdirmək' : 'aktivləşdirmək';
    if (!window.confirm(`Bu istifadəçini ${action} istəyirsiniz?`)) return;

    try {
      const response = await api.put(`/api/admin/users/${userId}/toggle-status`);
      if (response.data.success) {
        setUsers(prev => prev.map(u =>
          u._id === userId ? { ...u, isActive: response.data.isActive } : u
        ));
      }
    } catch (error) {
      alert('❌ Xəta: ' + (error.response?.data?.message || 'Dəyişdirilmədi'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span>🦁</span>
          <h2>PHONEZA</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item">📊 Dashboard</Link>
          <Link to="/admin/dashboard" className="nav-item">📦 Məhsullar</Link>
          <a href="#" className="nav-item active">👥 Müştərilər</a>
        </nav>
        <div className="sidebar-footer">
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminData');
              navigate('/admin/login');
            }}
            className="logout-btn"
          >
            🚪 Çıxış
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>👥 İstifadəçilər</h1>
        </header>

        {/* Filtr */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Ad və ya email axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          >
            <option value="">Bütün statuslar</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Deaktiv</option>
          </select>
        </div>

        <div className="content-section">
          {loading ? (
            <p>Yüklənir... ⏳</p>
          ) : (
            <div className="table-container">
              <p style={{ color: '#64748b', marginBottom: '12px' }}>{users.length} istifadəçi</p>
              <table className="products-table">
                <thead>
                  <tr>
                    <th>İstifadəçi</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th>Qeydiyyat tarixi</th>
                    <th>Status</th>
                    <th>Əməliyyat</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: '#dbeafe', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 700, color: '#3b82f6'
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || '—'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {user.isActive ? 'Aktiv' : 'Deaktiv'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleStatus(user._id, user.isActive)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: user.isActive ? '#fee2e2' : '#dcfce7',
                            color: user.isActive ? '#dc2626' : '#16a34a',
                            fontWeight: 600,
                            fontSize: '13px'
                          }}
                        >
                          {user.isActive ? 'Deaktiv et' : 'Aktiv et'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  İstifadəçi tapılmadı
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;
