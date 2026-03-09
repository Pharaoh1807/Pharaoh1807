import React from 'react';
import { useNavigate } from 'react-router-dom';
import { adminStyles } from '../styles/adminStyles';

export default function AdminFailedLogin() {
  const nav = useNavigate();

  return (
    <div style={adminStyles.centeredContainer}>
      <div style={{...adminStyles.formContainer, maxWidth: '400px', textAlign: 'center'}}>
        <h2 style={{...adminStyles.header, color: '#e53e3e', borderBottom: 'none'}}>Login Failed</h2>
        <p style={{color: '#a0aec0', marginBottom: '2rem'}}>The email or password you entered is incorrect. Please try again.</p>
        <button onClick={() => nav('/admin')} style={{...adminStyles.button, ...adminStyles.primaryButton}}>Try Again</button>
      </div>
    </div>
  );
}
