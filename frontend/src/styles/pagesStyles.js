const pagesStyles = {container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#e2e8f0',
  },
  header: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #4a5568',
    paddingBottom: '0.5rem',
    color: '#ffffff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  productCard: {
    backgroundColor: '#2d3748',
    borderRadius: '8px',
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
    color: '#ffffff',
    margin: '0 0 0.5rem 0',
  },
  productDescription: {
    color: '#a0aec0',
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
    backgroundColor: '#4a5568',
    cursor: 'not-allowed',
  }}

export default pagesStyles;