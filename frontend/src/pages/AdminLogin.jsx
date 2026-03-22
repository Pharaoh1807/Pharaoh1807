import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { adminStyles } from '../styles/adminStyles';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      api.verifyAdminToken(adminToken)
        .then(data => {
          if (data.valid) {
            nav('/admin/products');
          }
        })
        .catch(err => {
          // Token is invalid or expired, remove it
          console.error('Token verification failed, removing token:', err.message);
          localStorage.removeItem('admin_token');
        });
    }
  }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { token } = await api.adminLogin(email, password);
      localStorage.setItem('admin_token', token);
      nav('/admin/products');
    } catch (e) {
      nav("/admin/failedlogin");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={adminStyles.centeredContainer}>
      <div style={{ ...adminStyles.formContainer, maxWidth: '400px' }}>
        <h2 style={{ ...adminStyles.header, textAlign: 'center', borderBottom: 'none' }}>Đăng nhập Admin</h2>
        <form onSubmit={submit} style={adminStyles.form}>
          <div style={adminStyles.inputGroup}>
            <label htmlFor="email" style={adminStyles.label}>Email</label>
            <input id="email" style={adminStyles.input} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={adminStyles.inputGroup}>
            <label htmlFor="password" style={adminStyles.label}>Mật khẩu</label>
            <input id="password" type="password" style={adminStyles.input} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button disabled={busy} style={{ ...adminStyles.button, ...adminStyles.primaryButton, ...(busy ? adminStyles.buttonDisabled : {}) }}>
            {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
