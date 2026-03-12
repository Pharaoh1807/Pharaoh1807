import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { adminStyles } from '../styles/adminStyles';

export default function AdminEditProduct() {
  const { id } = useParams();
  const nav = useNavigate();
  const token = localStorage.getItem('admin_token') || "";
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      nav('/admin');
      return;
    }
    api.adminGetProduct(token, id)
      .then(product => {
        // Đảm bảo imageUrls là một mảng cho form, ngay cả khi nó không tồn tại hoặc rỗng
        const productWithImageUrls = {
          ...product,
          imageUrls: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : ['']
        };
        setForm(productWithImageUrls);
      })
      .catch(err => {
        console.error("Failed to fetch product data:", err);
        alert('Could not load product data.');
        nav('/admin/products');
      })
      .finally(() => setLoading(false));
  }, [id, token, nav]);

  const update = async (e) => {
    e.preventDefault();
    try {
      const { name, description, longDescription, priceCents, imageUrls, active } = form;
      // Lọc ra các URL rỗng trước khi gửi đi
      const filteredImageUrls = imageUrls.filter(url => url && url.trim() !== '');
      const payload = { name, description, longDescription, priceCents: Number(priceCents), imageUrls: filteredImageUrls, active};

      await api.adminUpdate(token, id, payload);
      nav('/admin/products');
    } catch (err) {
      console.error("Failed to update product:", err);
      alert('Error updating product. Please check the console.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...form.imageUrls];
    newImageUrls[index] = value;
    setForm(prevForm => ({
      ...prevForm,
      imageUrls: newImageUrls
    }));
  };

  const addImageUrlField = () => {
    setForm(prevForm => ({
      ...prevForm,
      imageUrls: [...prevForm.imageUrls, '']
    }));
  };

  const removeImageUrlField = (index) => {
    const newImageUrls = form.imageUrls.filter((_, i) => i !== index);
    // Đảm bảo luôn còn lại ít nhất một trường input
    setForm(prevForm => ({ ...prevForm, imageUrls: newImageUrls.length > 0 ? newImageUrls : [''] }));
  };

  if (loading) {
    return <div style={adminStyles.centeredContainer}>Loading product...</div>;
  }

  if (!form) {
    return <div style={adminStyles.centeredContainer}>Product not found.</div>;
  }

  return (
    <div style={adminStyles.centeredContainer}>
      <div style={adminStyles.formContainer}>
        <h2 style={{...adminStyles.header, textAlign: 'center', borderBottom: 'none', marginBottom: '2rem'}}>
          Edit Product
        </h2>
        <form onSubmit={update} style={adminStyles.form}>
          <div style={adminStyles.inputGroup}>
            <label htmlFor="name" style={adminStyles.label}>Product Name</label>
            <input id="name" name="name" placeholder="e.g. Whey Protein" value={form.name} onChange={handleFormChange} style={adminStyles.input} required />
          </div>

          <div style={adminStyles.inputGroup}>
            <label style={adminStyles.label}>Image URLs</label>
            {form.imageUrls && form.imageUrls.map((url, index) => (
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
            <textarea id="description" name="description" placeholder="Short description for shop page" value={form.description || ''} onChange={handleFormChange} style={adminStyles.textarea} />
          </div>
          <div style={adminStyles.inputGroup}>
            <label htmlFor="longDescription" style={adminStyles.label}>Long Description</label>
            <textarea id="longDescription" name="longDescription" placeholder="Detailed product information for product page" value={form.longDescription || ''} onChange={handleFormChange} style={{...adminStyles.textarea, height: '200px'}} />
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
            <label style={adminStyles.checkboxLabel}>
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={ (e) =>  handleFormChange(e)}
              /> Active
            </label>
          </div>
          <div style={adminStyles.buttonGroup}>
            <button type="button" onClick={() => nav('/admin/products')} style={{ ...adminStyles.button, ...adminStyles.cancelButton }}>
              Cancel
            </button>
            <button type="submit" style={{ ...adminStyles.button, ...adminStyles.primaryButton }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
