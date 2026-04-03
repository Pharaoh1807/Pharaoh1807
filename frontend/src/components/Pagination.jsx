import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Function to generate page numbers with limits (e.g., 1, 2, 3, ..., 10)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (startPage > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }
      if (endPage < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const buttonStyle = {
    padding: '0.5rem 0.75rem',
    margin: '0 0.25rem',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '4px',
    backgroundColor: 'var(--btn-bg, #ffffff)',
    color: 'var(--btn-text, #4a5568)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    minWidth: '35px',
    transition: 'all 0.2s',
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--btn-primary-bg, #4299e1)',
    color: 'white',
    borderColor: 'var(--btn-primary-bg, #4299e1)',
    fontWeight: 'bold',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.25rem',
  };

  return (
    <div style={containerStyle}>
      <button
        style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &larr; Prev
      </button>

      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} style={{ margin: '0 0.5rem', color: 'var(--text-muted, #718096)' }}>
              ...
            </span>
          );
        }
        return (
          <button
            key={page}
            style={currentPage === page ? activeButtonStyle : buttonStyle}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      })}

      <button
        style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &rarr;
      </button>
    </div>
  );
}
