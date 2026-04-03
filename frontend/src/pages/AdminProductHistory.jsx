import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { adminStyles } from '../styles/adminStyles';
import Pagination from '../components/Pagination';

export default function AdminProductHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token') || '';

  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;
  const [filters, setFilters] = useState({ year: '', month: '', day: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustment, setAdjustment] = useState({
    quantityChange: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  }, [navigate]);

  useEffect(() => {
    if (!token) { logout(); return; }

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [productData, historyRes] = await Promise.all([
          api.adminGetProduct(token, id),
          api.getProductHistory(token, id, {}, currentPage, itemsPerPage)
        ]);
        setProduct(productData);
        setHistory(historyRes.history || []);
        setTotalPages(historyRes.pagination?.totalPages || 1);
        setError('');
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError('Could not load data for this product. It may have been deleted.');
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, token, logout, currentPage]);

  const fetchHistory = useCallback(async (currentFilters, page = 1) => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, value]) => value)
      );

      const historyRes = await api.getProductHistory(token, id, activeFilters, page, itemsPerPage);
      setHistory(historyRes.history || []);
      setTotalPages(historyRes.pagination?.totalPages || 1);
      setCurrentPage(page);
      setError('');
    } catch (err) {
      console.error("Failed to fetch product history:", err);
      setError('Could not load history for this product.');
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [id, token, logout]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchHistory(filters, 1);

  const clearFilters = () => {
    const emptyFilters = { year: '', month: '', day: '' };
    setFilters(emptyFilters);
    fetchHistory(emptyFilters);
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const quantityChange = parseInt(adjustment.quantityChange, 10);
      if (isNaN(quantityChange) || quantityChange === 0) {
        alert('Vui lòng nhập số lượng hợp lệ (khác 0).');
        setIsSubmitting(false);
        return;
      }

      const payload = { quantityChange, notes: adjustment.notes };
      const { product: updatedProduct } = await api.adjustProductStock(token, id, payload);
      
      setProduct(updatedProduct);
      setIsModalOpen(false);
      setAdjustment({ quantityChange: '', notes: '' });
      fetchHistory(filters, currentPage); // Refresh history list with current filters and current page
      alert('Điều chỉnh kho thành công!');
    } catch (err) {
      console.error("Failed to adjust stock:", err);
      alert(`Lỗi: ${err.message || 'Không thể điều chỉnh kho.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLogType = (type) => {
    const styles = { padding: '0.25rem 0.5rem', borderRadius: '6px', color: 'white', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'capitalize' };
    switch (type) {
      case 'sale': return <span style={{ ...styles, backgroundColor: '#e53e3e' }}>Bán hàng</span>;
      case 'stock-in': return <span style={{ ...styles, backgroundColor: '#28a745' }}>Nhập kho</span>;
      case 'adjustment': return <span style={{ ...styles, backgroundColor: '#6c757d' }}>Điều chỉnh</span>;
      default: return type;
    }
  };

  const renderPerformedBy = (performer) => {
    if (performer?.user) {
      return <>{performer.user.name || 'N/A'}<br /><span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>({performer.user.email || 'N/A'})</span></>;
    }
    if (performer?.adminEmail) {
      return <>Admin<br /><span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>({performer.adminEmail})</span></>;
    }
    return 'Hệ thống';
  };

  const renderNotesOrId = (log) => {
    if (log.type === 'sale' && log.relatedTransaction?.transactionId) {
      return <><strong style={{color: 'var(--text-muted)'}}>ID:</strong> {log.relatedTransaction.transactionId}</>;
    }
    return log.notes || <span style={{color: 'var(--text-muted)'}}>N/A</span>;
  };

  if (loading) {
    return <div style={adminStyles.container}>Đang tải lịch sử...</div>;
  }

  if (error) {
    return (
      <div style={adminStyles.container}>
        <p style={{ color: '#f56565', textAlign: 'center' }}>{error}</p>
        <button onClick={() => navigate('/admin/products')} style={{ ...adminStyles.button, margin: '1rem auto', display: 'block' }}>
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div style={adminStyles.container}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{...adminStyles.header, marginBottom: '0.5rem'}}>Lịch sử tồn kho</h2>
          <h3 style={{margin: 0, color: 'var(--text-muted)', fontWeight: 'normal'}}>
            Sản phẩm: <span style={{color: 'var(--text-main)', fontWeight: 'bold'}}>{product?.name}</span>
          </h3>
          <p style={{margin: '0.5rem 0 0', color: 'var(--text-muted)'}}>
            Tồn kho hiện tại: <span style={{color: '#48bb78', fontWeight: 'bold'}}>{product?.stock}</span>
          </p>
        </div>
        <div>
          <button onClick={() => setIsModalOpen(true)} style={{...adminStyles.button, ...adminStyles.primaryButton, marginRight: '1rem'}}>
            Điều chỉnh tồn
          </button>
          <button onClick={() => navigate('/admin/products')} style={adminStyles.button}>
            &larr; Quay lại
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div style={adminStyles.modalOverlay}>
          <div style={adminStyles.modalContent}>
            <h3 style={{...adminStyles.header, textAlign: 'center'}}>Điều chỉnh tồn kho</h3>
            <form onSubmit={handleAdjustmentSubmit}>
              <div style={adminStyles.inputGroup}>
                <label style={adminStyles.label}>Số lượng thay đổi</label>
                <input type="number" value={adjustment.quantityChange} onChange={(e) => setAdjustment(prev => ({ ...prev, quantityChange: e.target.value }))} style={adminStyles.input} placeholder="VD: 50 để nhập kho, -5 để xuất kho" required />
              </div>
              <div style={adminStyles.inputGroup}>
                <label style={adminStyles.label}>Ghi chú (Không bắt buộc)</label>
                <textarea value={adjustment.notes} onChange={(e) => setAdjustment(prev => ({ ...prev, notes: e.target.value }))} style={adminStyles.textarea} placeholder="VD: Nhận hàng từ nhà cung cấp, Điều chỉnh sau kiểm kê" />
              </div>
              <div style={adminStyles.buttonGroup}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{...adminStyles.button, ...adminStyles.cancelButton}}>Hủy</button>
                <button type="submit" disabled={isSubmitting} style={{...adminStyles.button, ...adminStyles.primaryButton}}>{isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--header-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        <h4 style={{marginTop: 0, marginBottom: '1rem', color: 'var(--text-muted)'}}>Lọc lịch sử</h4>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="number" name="year" placeholder="Năm (VD: 2023)" value={filters.year} onChange={handleFilterChange} style={{...adminStyles.input, width: '120px'}} />
          <input type="number" name="month" placeholder="Tháng (1-12)" value={filters.month} onChange={handleFilterChange} style={{...adminStyles.input, width: '120px'}} />
          <input type="number" name="day" placeholder="Ngày (1-31)" value={filters.day} onChange={handleFilterChange} style={{...adminStyles.input, width: '120px'}} />
          <button onClick={applyFilters} style={adminStyles.button}>Lọc</button>
          <button onClick={clearFilters} style={{...adminStyles.button, ...adminStyles.secondaryButton}}>Xóa bộ lọc</button>
        </div>
      </div>

      <div style={{overflowX: 'auto'}}>
        <table style={adminStyles.table}>
          <thead>
            <tr>
              <th style={adminStyles.th}>Ngày</th>
              <th style={adminStyles.th}>Loại</th>
              <th style={adminStyles.th}>Thay đổi</th>
              <th style={adminStyles.th}>Tồn kho sau</th>
              <th style={adminStyles.th}>Thực hiện bởi</th>
              <th style={adminStyles.th}>Ghi chú / Mã GD</th></tr></thead>
          <tbody>
            {history.length > 0 ? (
              history.map(log => (
                <tr key={log._id}>
                  <td style={{...adminStyles.td, whiteSpace: 'nowrap'}}>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                  <td style={adminStyles.td}>{renderLogType(log.type)}</td>
                  <td style={{...adminStyles.td, textAlign: 'center', fontWeight: 'bold', color: log.quantityChange > 0 ? '#48bb78' : '#f56565'}}>
                    {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                  </td>
                  <td style={{...adminStyles.td, textAlign: 'center'}}>{log.stockAfter}</td>
                  <td style={adminStyles.td}>{renderPerformedBy(log.performedBy)}</td>
                  <td style={{...adminStyles.td, wordBreak: 'break-word'}}>{renderNotesOrId(log)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{...adminStyles.td, textAlign: 'center', padding: '2rem'}}>
                {filters.year || filters.month || filters.day
                  ? 'Không tìm thấy lịch sử tồn kho cho bộ lọc đã chọn.'
                  : 'Sản phẩm này chưa có lịch sử tồn kho.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div style={{ marginTop: '1.5rem' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchHistory(filters, page)}
          />
        </div>
      )}

      
    </div>
  );
}
