
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { adminStyles } from '../styles/adminStyles';

export default function AdminUsers() {
  const nav = useNavigate();
  const token = localStorage.getItem('admin_token') || '';
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    nav('/admin');
  }, [nav]);

  const fetchUsers = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getAdminUsers(token, page);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      // Nếu token không hợp lệ, đăng xuất admin
      if (err.message.includes('401') || err.message.includes('invalid')) {
        logout();
      } else {
        alert('Could not fetch users.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await api.adminDeleteUser(token, userId);
      alert('User deleted successfully.');

      // Tải lại danh sách để cập nhật giao diện.
      // Nếu đây là user cuối cùng trên trang, lùi về trang trước.
      if (users.length === 1 && pagination.currentPage > 1) {
        fetchUsers(pagination.currentPage - 1);
      } else {
        fetchUsers(pagination.currentPage);
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(`Could not delete user: ${err.message}`);
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditFormData({ name: user.name, email: user.email, password: '', confirmPassword: '' });
  };

  const handleCancelClick = () => {
    setEditingUserId(null);
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSaveClick = async (userId) => {
    if (!editFormData.name || !editFormData.email) {
      alert('Name and email cannot be empty.');
      return;
    }
    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    try {
      const payload = { ...editFormData };
      if (!payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }
      const updatedUser = await api.adminUpdateUser(token, userId, payload);
      setUsers(currentUsers => currentUsers.map(user =>
        user._id === userId ? { ...user, ...updatedUser } : user
      ));
      setEditingUserId(null);
      alert('User updated successfully.');
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(`Could not update user: ${err.message}`);
    }
  };

  useEffect(() => {
    if (!token) {
      nav('/admin');
      return;
    }
    fetchUsers(1); // Tải trang đầu tiên khi component được mount
  }, [token, nav, fetchUsers]);

  const inputStyle = {
    width: '95%',
    padding: '8px',
    backgroundColor: '#1A202C', // Darker background for input
    color: '#e2e8f0',
    border: '1px solid #4A5568',
    borderRadius: '4px'
  };

  return (
    <div style={adminStyles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', marginBottom: '1rem' }}>
        <h2 style={{ ...adminStyles.header, borderBottom: 'none', alignSelf: 'center' }}>User Management</h2>
        <div style={{
          ...adminStyles.statCard,
          borderRadius: '8px', // Bo tròn các góc
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)', // Thêm hiệu ứng đổ bóng
          backgroundColor: '#38A169',
          margin: '0 1rem',
          padding: '0.5rem 1rem',
          minWidth: '150px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h3 style={{ ...adminStyles.statCardTitle, margin: '0 0 0.25rem 0', color: '#FFFFFF' }}>Total Users</h3>
          <p style={{ ...adminStyles.statCardValue, margin: 0, color: '#FFFFFF' }}>{pagination.totalUsers}</p>
        </div>
        <button onClick={() => nav('/admin/products')} style={{ ...adminStyles.button, ...adminStyles.secondaryButton }}>
          &larr; Back to Dashboard
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <table style={adminStyles.table}>
          <thead>
            <tr>
              <th style={{ ...adminStyles.th, textAlign: 'left' }}>Name</th>
              <th style={{ ...adminStyles.th, textAlign: 'left' }}>Email</th>
              <th style={adminStyles.th}>Date Registered</th>
              <th style={{ ...adminStyles.th, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ ...adminStyles.td, textAlign: 'center' }}>Loading users...</td></tr>
            ) : users.length > 0 ? (
              users.map(user => (
                editingUserId === user._id ? (
                  // Edit Mode Row
                  <tr key={user._id} style={{ backgroundColor: '#3c465a' }}>
                    <td style={adminStyles.td}>
                      <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} style={inputStyle} />
                      <div style={{ marginTop: '8px' }}>
                        <input type="password" name="password" placeholder="New Password" value={editFormData.password} onChange={handleEditFormChange} style={inputStyle} />
                      </div>
                    </td>
                    <td style={adminStyles.td}>
                      <input type="email" name="email" value={editFormData.email} onChange={handleEditFormChange} style={inputStyle} />
                      <div style={{ marginTop: '8px' }}>
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={editFormData.confirmPassword} onChange={handleEditFormChange} style={inputStyle} />
                      </div>
                    </td>
                    <td style={{ ...adminStyles.td, textAlign: 'center' }}>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td style={{ ...adminStyles.td, ...adminStyles.actionsCell }}>
                      <div style={{ ...adminStyles.buttonGroup, gap: '0.5rem', justifyContent: 'center' }}>
                        <button onClick={() => handleSaveClick(user._id)} style={{ ...adminStyles.button, ...adminStyles.primaryButton, padding: '0.5rem 1rem' }}>Save</button>
                        <button onClick={handleCancelClick} style={{ ...adminStyles.button, ...adminStyles.secondaryButton, padding: '0.5rem 1rem' }}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Display Mode Row
                  <tr key={user._id} style={{ backgroundColor: '#2d3748' }}>
                    <td style={adminStyles.td}>{user.name}</td>
                    <td style={adminStyles.td}>{user.email}</td>
                    <td style={{ ...adminStyles.td, textAlign: 'center' }}>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td style={{ ...adminStyles.td, ...adminStyles.actionsCell }}>
                      <div style={{ ...adminStyles.buttonGroup, gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditClick(user)}
                          style={{ ...adminStyles.button, ...adminStyles.editButton, marginRight: "1rem", padding: '0.5rem 1rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          style={{ ...adminStyles.button, ...adminStyles.dangerButton, padding: '0.5rem 1rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))
            ) : (
              <tr><td colSpan="4" style={{ ...adminStyles.td, textAlign: 'center' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem', gap: '0.5rem' }}>
            <button
              onClick={() => fetchUsers(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || loading}
              style={{ ...adminStyles.button, ...adminStyles.secondaryButton }}
            >
              &larr; Previous
            </button>
            <span style={{ color: '#e2e8f0' }}>Page {pagination.currentPage} of {pagination.totalPages}</span>
            <button
              onClick={() => fetchUsers(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages || loading}
              style={{ ...adminStyles.button, ...adminStyles.secondaryButton }}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
