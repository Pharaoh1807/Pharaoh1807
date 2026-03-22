// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerStyle = {
    backgroundColor: 'var(--footer-bg)',
    color: 'var(--text-main)',
    borderTop: '1px solid var(--border-color)',
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
    color: 'var(--title-color)',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  const linkStyle = {
    color: 'var(--nav-link)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '0.5rem',
    transition: 'color 0.2s',
    fontSize: '0.9rem',
  };

  const socialIconStyle = {
    color: 'var(--nav-link)',
    fontSize: '1.5rem',
    marginRight: '1rem',
    transition: 'color 0.2s',
  };

  const bottomBarStyle = {
    textAlign: 'center',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        {/* Grid Footer */}
        <div style={gridStyle}>
          {/* Column 1: About */}
          <div>
            <h3 style={sectionTitleStyle}>Nutrition Shop</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              Cung cấp sản phẩm dinh dưỡng chất lượng cao cho sức khỏe và thể thao.
            </p>
            <div>
              <a href="#" style={socialIconStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" style={socialIconStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" style={socialIconStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 style={sectionTitleStyle}>Liên Kết Nhanh</h3>
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
              Trang chủ
            </Link>
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
              Sản phẩm
            </Link>
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
              Giới thiệu
            </Link>
            <Link to="/" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
              Liên hệ
            </Link>
          </div>

          {/* Column 3: Customer Support */}
          <div>
            <h3 style={sectionTitleStyle}>Hỗ Trợ Khách Hàng</h3>
            <Link to="/404" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
              Câu hỏi thường gặp
            </Link>
            <Link to="/404" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
              Chính sách vận chuyển
            </Link>
            <Link to="/404" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
              Chính sách đổi trả
            </Link>
            <Link to="/404" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--nav-link)'}>
              Chính sách bảo mật
            </Link>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 style={sectionTitleStyle}>Thông Tin Liên Hệ</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span role="img" aria-label="address">📍</span> 264 Nguyễn Chí Thanh, Phường Diên Hồng, TP.HCM
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span role="img" aria-label="phone">📞</span> (028) 3577 896
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span role="img" aria-label="email">✉️</span> support@nutritionshop.com
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span role="img" aria-label="time">🕒</span> T2 - T6: 8:00 - 20:00
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={bottomBarStyle}>
          <p>© {currentYear} Nutrition Shop. Tất cả các quyền được bảo lưu.</p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
              Điều khoản sử dụng
            </Link>
            {' | '}
            <Link to="/sitemap" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = 'var(--title-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
              Sơ đồ trang
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}