import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import pagesStyles from '../styles/pagesStyles';

export default function UserRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await api.userRegister(name, email, password);
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/user/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  // Cải tiến giao diện cho trang đăng ký
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      minHeight: 'calc(100vh - 250px)'
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
    message: {
      padding: '1rem',
      marginBottom: '1.5rem',
      borderRadius: '6px',
      textAlign: 'center',
      border: '1px solid transparent',
    },
    errorMessage: {
      backgroundColor: 'rgba(229, 62, 62, 0.1)',
      color: '#fed7d7',
      borderColor: '#e53e3e',
    },
    successMessage: {
      backgroundColor: 'rgba(56, 161, 105, 0.1)',
      color: '#c6f6d5',
      borderColor: '#38a169',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.header}>Tạo tài khoản</h2>
        <form onSubmit={handleSubmit}>
          {error && <p style={{...styles.message, ...styles.errorMessage}}>{error}</p>}
          {success && <p style={{...styles.message, ...styles.successMessage}}>{success}</p>}
          <div style={styles.inputGroup}>
            <label htmlFor="name" style={styles.label}>Tên của bạn</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Mật khẩu</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Xác nhận mật khẩu</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={styles.input} />
          </div>
          <button type="submit" disabled={busy || !!success} style={{...styles.button, ...(busy || !!success ? styles.buyButtonDisabled : {})}}>
            {busy ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
          <p style={{ ...styles.textCenter, ...styles.marginTop }}>
            Đã có tài khoản? <Link to="/user/login" style={styles.link}>Đăng nhập tại đây</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
