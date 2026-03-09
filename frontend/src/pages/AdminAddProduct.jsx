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
    imageUrls: [''],
    stock: 1,
    active: true
  });

  useEffect(() => {
    if (!token) {
      nav('/admin');
    }
  }, [token, nav]);

  const create = async (e) => {
    e.preventDefault();
    try {
      const filteredImageUrls = form.imageUrls.filter(url => url && url.trim() !== '');
      const payload = { ...form, priceCents: Number(form.priceCents), stock: Number(form.stock), imageUrls: filteredImageUrls };
      await api.adminCreate(token, payload);
      nav('/admin/products');
    } catch (err) {
      console.error("Failed to create product:", err);
      alert('Error creating product. Please check the console.');
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

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...form.imageUrls];
    newImageUrls[index] = value;
    setForm(prevForm => ({ ...prevForm, imageUrls: newImageUrls }));
  };

  const addImageUrlField = () => {
    setForm(prevForm => ({
      ...prevForm,
      imageUrls: [...form.imageUrls, '']
    }));
  };

  const removeImageUrlField = (index) => {
    const newImageUrls = form.imageUrls.filter((_, i) => i !== index);
    setForm(prevForm => ({ ...prevForm, imageUrls: newImageUrls.length > 0 ? newImageUrls : [''] }));
  };

  return (
    <div style={adminStyles.centeredContainer}>
      <div style={adminStyles.formContainer}>
        <h2 style={{...adminStyles.header, textAlign: 'center', borderBottom: 'none', marginBottom: '2rem'}}>
          Add New Product
        </h2>
        <form onSubmit={create} style={adminStyles.form}>
          <div style={adminStyles.inputGroup}>
            <label htmlFor="name" style={adminStyles.label}>Product Name</label>
            <input id="name" name="name" placeholder="e.g. Whey Protein" value={form.name} onChange={handleFormChange} style={adminStyles.input} required />
          </div>
          <div style={adminStyles.inputGroup}>
            <label style={adminStyles.label}>Image URLs</label>
            {form.imageUrls.map((url, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', gap: '0.5rem' }}>
                <input
                  type="url"
                  placeholder={`Image URL ${index + 1}`}
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  style={{ ...adminStyles.input, flexGrow: 1 }}
                />
                {form.imageUrls.length > 1 && (
                  <button type="button" onClick={() => removeImageUrlField(index)} style={{ ...adminStyles.button, ...adminStyles.dangerButton, padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImageUrlField} style={{ ...adminStyles.button, ...adminStyles.secondaryButton, marginTop: '0.5rem' }}>
              Add Another Image URL
            </button>
          </div>
          <div style={adminStyles.inputGroup}>
            <label htmlFor="description" style={adminStyles.label}>Description</label>
            <textarea id="description" name="description" placeholder="Short description for shop page" value={form.description} onChange={handleFormChange} style={adminStyles.textarea} />
          </div>

          <div style={adminStyles.inputGroup}>
            <label htmlFor="longDescriptionescription" style={adminStyles.label}>Long Description</label>
            <textarea id="longDescription" name="longDescription" placeholder="Long description for shop page" value={form.longDescription} onChange={handleFormChange} style={adminStyles.textarea} />
          </div>

          <div style={adminStyles.inputGroup}>
            <label htmlFor="priceCents" style={adminStyles.label}>Price (in cents)</label>
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
            <label htmlFor="stock" style={adminStyles.label}>Stock Quantity</label>
            <input
              id="stock"
              type="number"
              name="stock"
              placeholder="e.g. 100"
              value={form.stock}
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
              /> Active
            </label>
          </div>
          <div style={adminStyles.buttonGroup}>
            <button type="button" onClick={() => nav('/admin/products')} style={{ ...adminStyles.button, ...adminStyles.cancelButton }}>
              Cancel
            </button>
            <button type="submit" style={{ ...adminStyles.button, ...adminStyles.primaryButton }}>
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
