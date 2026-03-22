const pagesStyles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: 'var(--text-main)',
    maxWidth: '1200px',
    margin: '0 auto',
    
  },
  header: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '0.5rem',
    color: 'var(--title-color)',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1.5rem',
  },
  productCard: {
    width: '260px',
    backgroundColor: 'var(--header-bg)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  productName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'var(--title-color)',
    margin: '0 0 0.5rem 0',
  },
  productDescription: {
    color: 'var(--text-muted)',
    flexGrow: 1,
    marginBottom: '1rem',
    // Add multi-line ellipsis for long descriptions
    display: '-webkit-box',
    'WebkitLineClamp': '3',
    'WebkitBoxOrient': 'vertical',
    overflow: 'hidden',
  },
  productPrice: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#48bb78', // Green for price
    marginBottom: '1rem',
  },
  buyButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: '#3182ce',
    color: 'white',
    width: '100%',
  },
  buyButtonDisabled: {
    backgroundColor: 'var(--border-color)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
  }}

export default pagesStyles;