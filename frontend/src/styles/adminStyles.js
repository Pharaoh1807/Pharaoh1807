/**
 * Shared styles for all admin pages.
 * This promotes a consistent look and feel across the admin dashboard.
 */
export const adminStyles = {
  // General container for pages like the main product dashboard
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: 'var(--text-main)',
    backgroundColor: 'var(--bg-color)',
    padding: '2rem',
    minHeight: '100vh',
  },
  // Used for centering content, e.g., login and failed login pages
  centeredContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-color)',
    padding: '1rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  // Container for forms (login, add product, edit product)
  formContainer: {
    backgroundColor: 'var(--header-bg)',
    padding: '2.5rem',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    width: '100%',
  },
  header: {
    fontSize: '2rem',
    marginBottom: '1rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '0.5rem',
    color: 'var(--title-color)',
  },
  // Form-specific styles
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'border-color 0.2s ease-in-out',
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '1rem',
    minHeight: '80px',
    resize: 'vertical',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-main)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-main)',
  },
  // Buttons
  button: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease-in-out',
    textDecoration: 'none',
    display: 'inline-block',
  },
  buttonDisabled: {
    backgroundColor: '#4a5568',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: '#3182ce',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#4a5568',
    color: 'white',
    marginRight: '8px',
  },
  dangerButton: {
    backgroundColor: '#e53e3e',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#4a5568',
    color: 'white',
    textAlign: 'center',
  },
  // Dashboard & Table styles (from AdminProducts)
  dashboard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'var(--header-bg)',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
  },
  statCardTitle: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statCardValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--title-color)',
  },
  table: {
    width: '100%',
    backgroundColor: 'var(--header-bg)',
    borderRadius: '8px',
    overflow: 'hidden',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: 'var(--btn-bg)',
    color: 'var(--title-color)',
    padding: '0.75rem',
    textAlign: 'left',
    borderBottom: '2px solid var(--border-color)',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid var(--border-color)',
  },
  productImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginRight: '1rem',
    verticalAlign: 'middle',
  },
  productNameCell: {
    display: 'flex',
    alignItems: 'center',
  },
  actionsCell: {
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  statusActive: {
    color: '#48bb78',
    fontWeight: 'bold',
  },
  statusInactive: {
    color: 'var(--text-muted)',
  },
};
