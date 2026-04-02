import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { adminStyles } from '../styles/adminStyles';

export default function AdminAddProduct() {
  const nav = useNavigate();
  const token = localStorage.getItem('admin_token') || "";
  const [form, setForm] = useState({
    name: '',
    description: '',
    longDescription: '',
    priceCents: 10000,
    stock: 1,
    active: true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) {
      nav('/admin');
    }
  }, [token, nav]);

  const create = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const item of imageFiles) {
        const res = await api.uploadImage(token, item.file);
        uploadedUrls.push(res.url);
      }
      
      const payload = { ...form, priceCents: Number(form.priceCents), stock: Number(form.stock), imageUrls: uploadedUrls };
      await api.adminCreate(token, payload);
      nav('/admin/products');
    } catch (err) {
      console.error("Failed to create product:", err);
      alert('Error creating product. Please check the console.');
      setUploading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(e.target)
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImageFiles(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={adminStyles.centeredContainer}>
      <div style={adminStyles.formContainer}>
        <h2 style={{ ...adminStyles.header, textAlign: 'center', borderBottom: 'none', marginBottom: '2rem' }}>
          Thêm sản phẩm mới
        </h2>
        <form onSubmit={create} style={adminStyles.form}>
          <div style={adminStyles.inputGroup}>
            <label htmlFor="name" style={adminStyles.label}>Tên sản phẩm</label>
            <input id="name" name="name" placeholder="e.g. Whey Protein" value={form.name} onChange={handleFormChange} style={adminStyles.input} required />
          </div>
          <div style={adminStyles.inputGroup}>
            <label style={adminStyles.label}>Ảnh sản phẩm (Tải lên từ máy tính)</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageChange} 
            />
            {imageFiles.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {imageFiles.map((item, index) => (
                  <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={item.preview} alt={`preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)} 
                      style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      title="Xóa ảnh"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={adminStyles.inputGroup}>
            <label htmlFor="description" style={adminStyles.label}>Mô tả ngắn</label>
            <textarea id="description" name="description" placeholder="Mô tả ngắn" value={form.description} onChange={handleFormChange} style={adminStyles.textarea} />
          </div>

          <div style={adminStyles.inputGroup}>
            <label htmlFor="longDescriptionescription" style={adminStyles.label}>Mô tả chi tiết</label>
            <textarea id="longDescription" name="longDescription" placeholder="Mô tả chi tiết" value={form.longDescription} onChange={handleFormChange} style={adminStyles.textarea} />
          </div>

          <div style={adminStyles.inputGroup}>
            <label htmlFor="priceCents" style={adminStyles.label}>Giá (VNĐ)</label>
            <input
              id="priceCents"
              type="number"
              name="priceCents"
              placeholder="e.g. 1999 for $19.99"
              value={form.priceCents}
              onChange={handleFormChange}
              style={adminStyles.input}
              required
            />
          </div>

          <div style={adminStyles.inputGroup}>
            <label style={adminStyles.checkboxLabel}>
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleFormChange}
              /> Hiện
            </label>
          </div>
          <div style={adminStyles.buttonGroup}>
            <button type="button" onClick={() => nav('/admin/products')} style={{ ...adminStyles.button, ...adminStyles.cancelButton }}>
              Hủy
            </button>
            <button type="submit" disabled={uploading} style={{ ...adminStyles.button, ...adminStyles.primaryButton, opacity: uploading ? 0.7 : 1 }}>
              {uploading ? 'Đang lưu & tải ảnh...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
