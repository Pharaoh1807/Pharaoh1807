import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../api';
import pagesStyles from '../styles/pagesStyles';

export default function UserLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api.userLogin(email, password); // Destructure để lấy chuỗi token thuần túy
      
      localStorage.removeItem('admin_token'); // Đăng xuất khỏi tài khoản admin (nếu có)
      localStorage.setItem('user_token', token); // Lưu chuỗi token thuần túy
      // Chuyển hướng người dùng trở lại trang họ đang ở hoặc về trang chủ
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  // Cải tiến giao diện cho trang đăng nhập
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      minHeight: 'calc(100vh - 250px)' // Giả sử chiều cao header/footer
    },
    formWrapper: {
      width: '100%',
      maxWidth: '420px',
      backgroundColor: 'var(--header-bg)',
      padding: '2.5rem',
      borderRadius: '10px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid var(--border-color)',
    },
    header: {
      ...pagesStyles.header,
      textAlign: 'center',
      marginBottom: '2rem',
      borderBottom: 'none',
    },
    inputGroup: { marginBottom: '1.5rem' },
    input: {width: '80%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: 'var(--text-muted)',
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    button: {
      ...pagesStyles.buyButton,
      width: '100%',
      padding: '0.8rem',
      fontSize: '1.1rem',
      fontWeight: 'bold',
    },
    link: { color: 'var(--link-color)', textDecoration: 'none', fontWeight: '500' },
    textCenter: { textAlign: 'center' },
    marginTop: { marginTop: '1.5rem' },
    errorMessage: {
      backgroundColor: 'rgba(229, 62, 62, 0.1)',
      color: '#fed7d7',
      border: '1px solid #e53e3e',
      padding: '1rem',
      marginBottom: '1.5rem',
      borderRadius: '6px',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.header}>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          {error && <p style={styles.errorMessage}>{error}</p>}
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Mật khẩu</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
          </div>
          <button type="submit" disabled={busy} style={{...styles.button, ...(busy ? styles.buyButtonDisabled : {})}}>
            {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          <p style={{ ...styles.textCenter, ...styles.marginTop }}>
            Chưa có tài khoản? <Link to="/user/register" style={styles.link}>Đăng ký tại đây</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
