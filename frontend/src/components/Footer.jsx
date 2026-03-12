// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerStyle = {
    backgroundColor: '#1a202c',
    color: '#e2e8f0',
    borderTop: '1px solid #4a5568',
    padding: '3rem 4% 1.5rem',
    marginTop: '3rem',
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  };

  const sectionTitleStyle = {
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  const linkStyle = {
    color: '#cbd5e0',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '0.5rem',
    transition: 'color 0.2s',
    fontSize: '0.9rem',
  };

  const socialIconStyle = {
    color: '#cbd5e0',
    fontSize: '1.5rem',
    marginRight: '1rem',
    transition: 'color 0.2s',
  };

  const bottomBarStyle = {
    textAlign: 'center',
    paddingTop: '1.5rem',
    borderTop: '1px solid #4a5568',
    fontSize: '0.85rem',
    color: '#a0aec0',
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        {/* Grid Footer */}
        <div style={gridStyle}>
          {/* Column 1: About */}
          <div>
            <h3 style={sectionTitleStyle}>Nutrition Shop</h3>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              Cung cấp sản phẩm dinh dưỡng chất lượng cao cho sức khỏe và thể thao.
            </p>
            <div>
              <a href="#" style={socialIconStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" style={socialIconStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" style={socialIconStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 style={sectionTitleStyle}>Liên Kết Nhanh</h3>
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
              Trang chủ
            </Link>
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
              Sản phẩm
            </Link>
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
              Giới thiệu
            </Link>
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
              Liên hệ
            </Link>
          </div>

          {/* Column 3: Customer Support */}
          <div>
            <h3 style={sectionTitleStyle}>Hỗ Trợ Khách Hàng</h3>
            <Link to="/404" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
              Câu hỏi thường gặp
            </Link>
            <Link to="/404" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
              Chính sách vận chuyển
            </Link>
            <Link to="/404" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
              Chính sách đổi trả
            </Link>
            <Link to="/404" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}>
              Chính sách bảo mật
            </Link>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 style={sectionTitleStyle}>Thông Tin Liên Hệ</h3>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span role="img" aria-label="address">📍</span> 264 Nguyễn Chí Thanh, Phường Diên Hồng, TP.HCM
            </p>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span role="img" aria-label="phone">📞</span> (028) 3577 896
            </p>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span role="img" aria-label="email">✉️</span> support@nutritionshop.com
            </p>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
              <span role="img" aria-label="time">🕒</span> T2 - T6: 8:00 - 20:00
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={bottomBarStyle}>
          <p>© {currentYear} Nutrition Shop. Tất cả các quyền được bảo lưu.</p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link to="/terms" style={{ color: '#a0aec0', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'}>
              Điều khoản sử dụng
            </Link>
            {' | '}
            <Link to="/sitemap" style={{ color: '#a0aec0', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'}>
              Sơ đồ trang
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}