import React, { useState } from 'react';
import api from '../../api';
import './ProductForm.css';

function EditProductForm({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    stock: product.stock,
    tag: product.tag || '',
    featured: product.featured
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Qablolar', 'Case-lər', 'Ekran Qoruyucuları', 'Şarj Cihazları',
    'Qulaqcıqlar', 'Power Bank', 'Holder-lər', 'Aksesuarlar'
  ];

  const tags = ['', 'YENİ', 'ƏN ÇOX SATAN', 'TOP', 'PREMİUM'];

  const emojis = ['📱', '🛡️', '⚡', '🎧', '🔌', '🔋', '🚗', '🔑', '💎', '✨'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.put(`/api/products/${product._id}`, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        tag: formData.tag || null
      });

      if (response.data.success) {
        alert('✅ Məhsul yeniləndi!');
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Xəta baş verdi');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Məhsulu Redaktə Et</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Məhsul Adı *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Qiymət (AZN) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Təsvir *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kateqoriya *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Stok Sayı *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>İkon/Emoji</label>
              <div className="emoji-selector">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`emoji-btn ${formData.image === emoji ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, image: emoji }))}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Etiket (Tag)</label>
              <select
                name="tag"
                value={formData.tag}
                onChange={handleChange}
              >
                {tags.map((tag) => (
                  <option key={tag} value={tag}>{tag || 'Yoxdur'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <span>Ana səhifədə göstər (Featured)</span>
            </label>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              İmtina
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Yenilənir...' : '✅ Yenilə'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductForm;
