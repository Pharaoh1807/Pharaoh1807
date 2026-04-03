import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { adminStyles } from '../styles/adminStyles';
import Pagination from '../components/Pagination';

export default function AdminProducts() {
  const nav = useNavigate();
  const token = localStorage.getItem('admin_token') || '';
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeProductsCount, setActiveProductsCount] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalQuantitySold, setTotalQuantitySold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true); // Keep loading state for products
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    api.adminList(token, currentPage, itemsPerPage)
      .then(data => {
        setItems(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        logout();
        setLoadingProducts(false);
      });
      
    // Lấy thống kê sản phẩm
    api.getAdminProductsStats(token)
      .then(data => {
        setTotalProducts(data.totalProducts);
        setActiveProductsCount(data.activeProducts);
        setTotalStockValue(data.totalValue);
      })
      .catch((err) => console.error("Failed to fetch product stats:", err));

    // Lấy tổng số người dùng để hiển thị trên dashboard
    api.getAdminUsers(token, 1, 1)
      .then(data => setTotalUsers(data.pagination.totalUsers))
      .catch((err) => {
        console.error("Failed to fetch total users:", err);
        // Don't logout for user count error, just log it
      });
    // Lấy tổng số lượng đã bán và doanh thu (giờ dùng transaction stats)
    api.getAdminTransactionsStats(token)
      .then(data => {
        setTotalQuantitySold(data.totalItemsSold);
        setTotalRevenue(data.totalRevenue);
      })
      .catch((err) => {
        console.error("Failed to fetch transactions for dashboard:", err);
      });
  }, [token, nav, logout, currentPage]);

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

  // Các biến stat đã được load từ backend.


  return (
    <div style={adminStyles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={adminStyles.header}>Trang quản lý</h2>
        {/* <button onClick={logout} style={{ ...adminStyles.button, ...adminStyles.dangerButton }}>
          Đăng xuất
        </button> */}

      </div>

      {/* Summary Section */}
      <div style={{
        backgroundColor: 'var(--header-bg)',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Tổng giá trị tồn kho:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#48bb78', whiteSpace: 'nowrap' }}>
            {totalStockValue ? totalStockValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 ₫'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Tổng doanh thu:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#48bb78', whiteSpace: 'nowrap' }}>
            {totalRevenue ? totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 ₫'}
          </span>
        </div>
      </div>

      <div style={adminStyles.dashboard}>
        <div style={adminStyles.statCard}>
          <h3 style={adminStyles.statCardTitle}>Tổng sản phẩm</h3>
          <p style={adminStyles.statCardValue}>{totalProducts}</p>
        </div>
        <div style={adminStyles.statCard}>
          <h3 style={adminStyles.statCardTitle}>Sản phẩm đang hoạt động</h3>
          <p style={adminStyles.statCardValue}>{activeProductsCount}</p>
        </div>
        <div style={{ ...adminStyles.statCard, cursor: 'pointer' }} onClick={() => nav('/admin/users')}>
          <h3 style={adminStyles.statCardTitle}>Tổng người dùng</h3>
          <p style={adminStyles.statCardValue}>{totalUsers}</p>
        </div>
        {/* New stat card for total quantity sold */}
        <div style={{ ...adminStyles.statCard, cursor: 'pointer' }} onClick={() => nav('/admin/transactions')}>
          <h3 style={adminStyles.statCardTitle}>Tổng số lượng đã bán</h3>
          <p style={adminStyles.statCardValue}>{totalQuantitySold}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ ...adminStyles.header, marginBottom: 0, borderBottom: 'none', fontSize: '1.5rem' }}>Danh sách sản phẩm</h2>
        <button onClick={() => nav('/admin/products/addproduct')} style={{ ...adminStyles.button, ...adminStyles.primaryButton }}>
          Thêm sản phẩm mới
        </button>
      </div>

      {loadingProducts ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Đang tải sản phẩm...</p>
      ) : (
        <table style={adminStyles.table}>
          <thead>
            <tr>
              <th style={{ ...adminStyles.th, textAlign: 'left', width: '40%' }}>Sản phẩm</th>
              <th style={{ ...adminStyles.th, textAlign: 'center' }}>Giá</th>
              <th style={{ ...adminStyles.th, textAlign: 'center' }}>Số lượng</th>
              <th style={{ ...adminStyles.th, textAlign: 'center' }}>Trạng thái</th>
              <th style={{ ...adminStyles.th, textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(items) && items.map(p => (
              <tr key={p._id}>
                <td
                  style={{ ...adminStyles.td, cursor: 'pointer' }}
                  onClick={() => viewHistory(p)}
                  title={`Xem lịch sử cho ${p.name}`}
                >
                  <div style={adminStyles.productNameCell}>
                    {p.imageUrls && p.imageUrls[0] && <img src={p.imageUrls[0]} alt={p.name} style={adminStyles.productImage} />}
                    <span>{p.name}</span>
                  </div>
                </td>
                <td style={{ ...adminStyles.td, textAlign: 'center', whiteSpace: 'nowrap' }}>{(p.priceCents).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                <td style={{ ...adminStyles.td, textAlign: 'center' }}>{p.stock}</td>
                <td style={{ ...adminStyles.td, textAlign: 'center' }}>
                  <span style={p.active ? adminStyles.statusActive : adminStyles.statusInactive}>
                    {p.active ? 'Hiện' : 'Ẩn'}
                  </span>
                </td>
                <td style={{ ...adminStyles.td, ...adminStyles.actionsCell }}>
                  <div style={{ ...adminStyles.buttonGroup, gap: '0.5rem', marginTop: 0, justifyContent: 'flex-end' }}>
                    <button onClick={() => toggleActive(p)} style={{ ...adminStyles.button, ...adminStyles.secondaryButton, padding: '0.5rem 1rem' }}>{p.active ? 'Ẩn' : 'Hiện'}</button>
                    <button onClick={() => editProduct(p)} style={{ ...adminStyles.button, ...adminStyles.editButton, padding: '0.5rem 1rem', marginRight: '0.5rem' }}>Sửa</button>
                    <button onClick={() => remove(p)} style={{ ...adminStyles.button, ...adminStyles.dangerButton, padding: ' 0.5rem 1rem' }}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loadingProducts && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
