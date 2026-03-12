// NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    textAlign: 'center',
    padding: '2rem',
  };

  const errorCodeStyle = {
    fontSize: '8rem',
    fontWeight: 'bold',
    color: '#f56565',
    lineHeight: '1',
    marginBottom: '1rem',
    textShadow: '0 0 20px rgba(245, 101, 101, 0.3)',
  };

  const titleStyle = {
    fontSize: '2rem',
    color: '#ffffff',
    marginBottom: '1rem',
    fontWeight: '600',
  };

  const messageStyle = {
    fontSize: '1.1rem',
    color: '#a0aec0',
    marginBottom: '2rem',
    maxWidth: '500px',
    lineHeight: '1.6',
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const primaryButtonStyle = {
    backgroundColor: '#f56565',
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  };

  const secondaryButtonStyle = {
    backgroundColor: 'transparent',
    color: '#cbd5e0',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    border: '2px solid #4a5568',
    transition: 'all 0.2s',
    fontSize: '1rem',
  };

  const iconStyle = {
    fontSize: '5rem',
    marginBottom: '1rem',
    opacity: 0.8,
  };

  return (
    <div style={containerStyle}>
      {/* Icon hoặc hình ảnh */}
      <div style={iconStyle}>
        <span role="img" aria-label="lost">🔍</span>
        <span role="img" aria-label="confused">😕</span>
      </div>

      
      <h1 style={errorCodeStyle}>404</h1>

      
      <h2 style={titleStyle}>Không tìm thấy trang</h2>

      
      <p style={messageStyle}>
        Trang bạn đang tìm kiếm có thể đã bị xóa, 
        tên đã thay đổi hoặc tạm thời không khả dụng.
      </p>

      {/* Các nút điều hướng */}
      <div style={buttonContainerStyle}>
        <Link
          to="/"
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e53e3e';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 5px 15px rgba(245, 101, 101, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f56565';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Về trang chủ
        </Link>

        <button
          onClick={() => window.history.back()}
          style={secondaryButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#4a5568';
            e.target.style.color = 'white';
            e.target.style.borderColor = '#718096';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#cbd5e0';
            e.target.style.borderColor = '#4a5568';
          }}
        >
          Quay lại
        </button>
      </div>

      {/* Gợi ý links */}
      <div style={{ marginTop: '3rem', color: '#718096', fontSize: '0.9rem' }}>
        <p>Bạn có thể tìm thấy những gì mình cần tại:</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
          <Link to="/products" style={{ color: '#63b3ed', textDecoration: 'none' }}>
            Sản phẩm
          </Link>
          <Link to="/user/dashboard" style={{ color: '#63b3ed', textDecoration: 'none' }}>
            Tài khoản
          </Link>
          <Link to="/contact" style={{ color: '#63b3ed', textDecoration: 'none' }}>
            Liên hệ
          </Link>
        </div>
      </div>
    </div>
  );
}