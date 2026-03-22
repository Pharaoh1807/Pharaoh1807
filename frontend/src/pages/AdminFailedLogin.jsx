import React from 'react';
import { useNavigate } from 'react-router-dom';
import { adminStyles } from '../styles/adminStyles';

export default function AdminFailedLogin() {
  const nav = useNavigate();

  return (
    <div style={adminStyles.centeredContainer}>
      <div style={{ ...adminStyles.formContainer, maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ ...adminStyles.header, color: '#e53e3e', borderBottom: 'none' }}>Đăng nhập thất bại</h2>
        <p style={{ color: '#a0aec0', marginBottom: '2rem' }}>Sai email hoặc mật khẩu. Vui lòng thử lại.</p>
        <button onClick={() => nav('/admin')} style={{ ...adminStyles.button, ...adminStyles.primaryButton }}>Thử lại</button>
      </div>
    </div>
  );
}
