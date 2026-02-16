import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductForm from '../../components/admin/ProductForm';
import './AdminDashboard.css';
function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    categories: 0
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    if (!token || !adminData) {
      navigate('/admin/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchProducts(token);
  }, [navigate]);

  const fetchProducts = async (token) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
      const prods = response.data.data;
      setProducts(prods);

      const totalStock = prods.reduce((sum, p) => sum + p.stock, 0);
      const categories = [...new Set(prods.map(p => p.category))].length;

      setStats({
        totalProducts: prods.length,
        totalStock,
        categories
      });
    } catch (error) {
      console.error('Məhsullar yüklənmədi:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Bu məhsulu silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('Məhsul silindi!');
      fetchProducts(token);
    } catch (error) {
      alert('Xəta: ' + (error.response?.data?.message || 'Məhsul silinmədi'));
    }
  };

  if (!admin) {
    return <div>Yüklənir...</div>;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span>🦁</span>
          <h2>PHONEZA</h2>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            📊 Dashboard
          </a>
          <a href="#" className="nav-item">
            📦 Məhsullar
          </a>
          <a href="#" className="nav-item">
            🛒 Sifarişlər
          </a>
          <a href="#" className="nav-item">
            👥 Müştərilər
          </a>
          <a href="#" className="nav-item">
            ⚙️ Tənzimləmələr
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">👤</div>
            <div>
              <div className="admin-name">{admin.name}</div>
              <div className="admin-role">{admin.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Çıxış
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowProductForm(true)}
            >
              + Yeni Məhsul
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📦</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="stat-label">Məhsul Sayı</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">📊</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalStock}</div>
              <div className="stat-label">Ümumi Stok</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">🏷️</div>
            <div className="stat-info">
              <div className="stat-value">{stats.categories}</div>
              <div className="stat-label">Kateqoriya</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">🛒</div>
            <div className="stat-info">
              <div className="stat-value">0</div>
              <div className="stat-label">Aktiv Sifariş</div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2>Son Məhsullar</h2>
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Məhsul</th>
                  <th>Qiymət</th>
                  <th>Kateqoriya</th>
                  <th>Stok</th>
                  <th>Status</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                   <td>
  <div className="product-cell">
    {product.image && product.image.startsWith('http') ? (
      <img 
        src={product.image} 
        alt={product.name}
        className="product-icon"
        style={{
          width: '50px',
          height: '50px',
          objectFit: 'cover',
          borderRadius: '8px'
        }}
      />
    ) : (
      <span className="product-icon">{product.image || '📱'}</span>
    )}
    <span>{product.name}</span>
  </div>
</td>
                    <td><strong>{product.price} AZN</strong></td>
                    <td>{product.category}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {product.stock > 0 ? 'Stokda' : 'Yoxdur'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                       <button 
  className="btn-edit"
  onClick={() => setEditingProduct(product)}
>
  ✏️
</button>
                        <button 
                          className="btn-delete"
                          onClick={() => deleteProduct(product._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

    {showProductForm && (
  <ProductForm
    onClose={() => setShowProductForm(false)}
    onSuccess={() => {
      const token = localStorage.getItem('adminToken');
      fetchProducts(token);
    }}
  />
)}

{editingProduct && (
  <ProductForm
    product={editingProduct}
    onClose={() => setEditingProduct(null)}
    onSuccess={() => {
      const token = localStorage.getItem('adminToken');
      fetchProducts(token);
    }}
  />
)}

      </main>
    </div>
  );
}

export default AdminDashboard;