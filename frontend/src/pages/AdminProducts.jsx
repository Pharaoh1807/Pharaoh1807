import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { adminStyles } from '../styles/adminStyles';

export default function AdminProducts() {
  const nav = useNavigate();
  const token = localStorage.getItem('admin_token') || '';
  const [items, setItems] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalQuantitySold, setTotalQuantitySold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true); // Keep loading state for products

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    nav('/admin');
  }, [nav]);

  useEffect(() => {
    if (!token) {
      nav('/admin');
      return;
    }
    // Tải danh sách sản phẩm
    setLoadingProducts(true);
    api.adminList(token)
      .then(data => {
        setItems(data);
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        logout();
        setLoadingProducts(false);
      });
    // Lấy tổng số người dùng để hiển thị trên dashboard
    api.getAdminUsers(token, 1, 1)
      .then(data => setTotalUsers(data.pagination.totalUsers))
      .catch((err) => {
        console.error("Failed to fetch total users:", err);
        // Don't logout for user count error, just log it
      });
    // Lấy tổng số lượng đã bán
    api.getAdminTransactions(token)
      .then(data => {
        const completedTransactions = data.filter(t => t.status === 'completed');

        const totalQty = completedTransactions.reduce((acc, transaction) => acc + transaction.quantity, 0);
        setTotalQuantitySold(totalQty);

        const revenue = completedTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);
        setTotalRevenue(revenue);
      })
      .catch((err) => {
        console.error("Failed to fetch transactions for dashboard:", err);
      });
  }, [token, nav, logout]);

  const toggleActive = async (p) => {
    try {
      const updated = await api.adminUpdate(token, p._id, { active: !p.active });
      setItems(items.map(i => i._id === p._id ? updated : i));
    } catch (err) {
      console.error("Failed to update product:", err);
      alert('Error updating product. Please check the console.');
    }
  };

  const remove = async (p) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.adminDelete(token, p._id);
      setItems(items.filter(i => i._id !== p._id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert('Error deleting product. Please check the console.');
    }
  };

  const editProduct = async (p) => {
    nav(`/admin/products/edit/${p._id}`);
  };

  const viewHistory = (p) => {
    nav(`/admin/products/${p._id}/history`);
  };

  const totalProducts = items.length;
  const totalValue = Array.isArray(items) && items.reduce((sum, item) => sum + (item.active ? item.priceCents : 0), 0);
  const activeProducts = Array.isArray(items) && items.filter(item => item.active).length;

  return (
    <div style={adminStyles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={adminStyles.header}>Admin Dashboard</h2>
        <button onClick={logout} style={{ ...adminStyles.button, ...adminStyles.dangerButton }}>
          Logout
        </button>
      </div>

      {/* Summary Section */}
      <div style={{
        backgroundColor: '#2d3748',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #4a5568',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
          <span style={{ fontSize: '1.1rem', color: '#cbd5e0' }}>Total Inventory:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#48bb78', whiteSpace: 'nowrap' }}>
            {totalValue ? totalValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 ₫'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid #4a5568', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem', color: '#cbd5e0' }}>Total Revenue:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#48bb78', whiteSpace: 'nowrap' }}>
            {totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </span>
        </div>
      </div>

      <div style={adminStyles.dashboard}>
        <div style={adminStyles.statCard}>
          <h3 style={adminStyles.statCardTitle}>Total Products</h3>
          <p style={adminStyles.statCardValue}>{totalProducts}</p>
        </div>
        <div style={adminStyles.statCard}>
          <h3 style={adminStyles.statCardTitle}>Active Products</h3>
          <p style={adminStyles.statCardValue}>{activeProducts}</p>
        </div>
        <div style={{ ...adminStyles.statCard, cursor: 'pointer' }} onClick={() => nav('/admin/users')}>
          <h3 style={adminStyles.statCardTitle}>Total Users</h3>
          <p style={adminStyles.statCardValue}>{totalUsers}</p>
        </div>
        {/* New stat card for total quantity sold */}
        <div style={{ ...adminStyles.statCard, cursor: 'pointer' }} onClick={() => nav('/admin/transactions')}>
          <h3 style={adminStyles.statCardTitle}>Total Items Sold</h3>
          <p style={adminStyles.statCardValue}>{totalQuantitySold}</p>
        </div>
      </div>
      
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ ...adminStyles.header, marginBottom: 0, borderBottom: 'none', fontSize: '1.5rem' }}>Product List</h2>
        <button onClick={() => nav('/admin/products/addproduct')} style={{ ...adminStyles.button, ...adminStyles.primaryButton }}>
          Add New Product
        </button>
      </div>

      {loadingProducts ? (
        <p style={{ color: '#e2e8f0', textAlign: 'center' }}>Loading products...</p>
      ) : (
        <table style={adminStyles.table}>
          <thead>
            <tr>
              <th style={{...adminStyles.th,textAlign: 'left', width: '40%'}}>Product</th>
              <th style={{...adminStyles.th, textAlign: 'center'}}>Price</th>
              <th style={{...adminStyles.th, textAlign: 'center'}}>Stock</th>
              <th style={{...adminStyles.th, textAlign: 'center'}}>Status</th>
              <th style={{...adminStyles.th, textAlign: 'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(items) && items.map(p => (
              <tr key={p._id} style={{ backgroundColor: '#2d3748' }}>
                <td 
                  style={{...adminStyles.td, cursor: 'pointer'}} 
                  onClick={() => viewHistory(p)}
                  title={`View history for ${p.name}`}
                >
                  <div style={adminStyles.productNameCell}>
                    {p.imageUrls && p.imageUrls[0] && <img src={p.imageUrls[0]} alt={p.name} style={adminStyles.productImage} />}
                    <span>{p.name}</span>
                  </div>
                </td>
                <td style={{...adminStyles.td, textAlign: 'center', whiteSpace: 'nowrap'}}>{(p.priceCents).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                <td style={{...adminStyles.td, textAlign: 'center'}}>{p.stock}</td>
                <td style={{...adminStyles.td, textAlign: 'center'}}>
                  <span style={p.active ? adminStyles.statusActive : adminStyles.statusInactive}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{...adminStyles.td, ...adminStyles.actionsCell}}>
                  <div style={{...adminStyles.buttonGroup, gap: '0.5rem', marginTop: 0, justifyContent: 'flex-end'}}>
                    <button onClick={() => toggleActive(p)} style={{ ...adminStyles.button, ...adminStyles.secondaryButton, padding: '0.5rem 1rem' }}>{p.active ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => editProduct(p)} style={{ ...adminStyles.button, ...adminStyles.editButton, padding: '0.5rem 1rem', marginRight: '0.5rem' }}>Edit</button>
                    <button onClick={() => remove(p)} style={{ ...adminStyles.button, ...adminStyles.dangerButton, padding: ' 0.5rem 1rem' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
