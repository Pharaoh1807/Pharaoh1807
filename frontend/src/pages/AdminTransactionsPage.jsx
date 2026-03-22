import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { adminStyles } from '../styles/adminStyles';
import { toast } from 'react-hot-toast';

import * as XLSX from 'xlsx';
const POLLING_INTERVAL = 15000; // Check for new transactions every 15 seconds

// Helper component for filter buttons
const FilterButton = ({ filter, currentFilter, setFilter, count, children }) => {
  const isActive = filter === currentFilter;
  const style = {
    ...adminStyles.button,
    backgroundColor: isActive ? '#4299e1' : '#4a5568',
    color: isActive ? 'white' : '#e2e8f0',
  };
  return (
    <button onClick={() => setFilter(filter)} style={style}>
      {children} ({count})
    </button>
  );
};

// Helper function to get style for status badges
const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    display: 'inline-block',
    color: 'white',
  };
  switch (status) {
    case 'completed':
      return { ...baseStyle, backgroundColor: '#28a745' };
    case 'processing':
      return { ...baseStyle, backgroundColor: '#ffc107', color: 'black' };
    case 'pending':
      return { ...baseStyle, backgroundColor: '#6c757d' };
    default:
      return { ...baseStyle, backgroundColor: '#4a5568' };
  }
};

// Component for Sales Report View
const UserSalesReport = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUsers, setExpandedUsers] = useState({});
  // State for per-user filters
  const [filtersByUser, setFiltersByUser] = useState({});

  const groupedTransactions = useMemo(() => {
    // Only include completed transactions in the sales report
    const completedTransactions = transactions.filter(t => t.status === 'completed');

    const groups = completedTransactions.reduce((acc, t) => {
      const userId = t.user?._id || 'unknown';
      if (!acc[userId]) {
        acc[userId] = {
          user: t.user || { name: 'Người dùng đã bị xóa', email: 'N/A' },
          transactions: [],
          totalSpent: 0,
          totalItems: 0,
        };
      }
      acc[userId].transactions.push(t);
      acc[userId].totalSpent += t.amount;
      acc[userId].totalItems += t.quantity;
      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [transactions]);

  const filteredUserGroups = useMemo(() => {
    if (!searchTerm) return groupedTransactions;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return groupedTransactions.filter(group =>
      group.user.name.toLowerCase().includes(lowerCaseSearch) ||
      group.user.email.toLowerCase().includes(lowerCaseSearch)
    );
  }, [groupedTransactions, searchTerm]);

  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Handle filter changes for a specific user
  const handleFilterChangeForUser = (userId, filterName, value) => {
    setFiltersByUser(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [filterName]: value,
      },
    }));
  };

  // Apply filters to a user's transactions
  const getFilteredUserTransactions = (userId, userTransactions) => {
    const filters = filtersByUser[userId];
    if (!filters) return userTransactions;

    return userTransactions.filter(t => {
      const productNameMatch = !filters.productName || (t.product?.name || '').toLowerCase().includes(filters.productName.toLowerCase());

      const date = new Date(t.createdAt);
      const yearMatch = !filters.year || date.getFullYear() === parseInt(filters.year, 10);
      const monthMatch = !filters.month || (date.getMonth() + 1) === parseInt(filters.month, 10);
      const dayMatch = !filters.day || date.getDate() === parseInt(filters.day, 10);

      return productNameMatch && yearMatch && monthMatch && dayMatch;
    });
  };

  // Function to handle exporting data to Excel
  const handleExportToExcel = () => {
    const dataToExport = filteredUserGroups.flatMap(group =>
      group.transactions.map(t => ({
        'Tên người dùng': group.user.name,
        'Email người dùng': group.user.email,
        'Tên sản phẩm': t.product?.name || 'N/A',
        'Số lượng': t.quantity,
        'Thành tiền (VND)': t.amount,
        'Ngày mua': new Date(t.createdAt).toLocaleString('vi-VN'),
        'Mã giao dịch': t.transactionId,
      }))
    );

    if (dataToExport.length === 0) {
      toast.error('Không có dữ liệu để xuất.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BaoCaoBanHang');

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 25 }, // Tên người dùng
      { wch: 30 }, // Email người dùng
      { wch: 35 }, // Tên sản phẩm
      { wch: 10 }, // Số lượng
      { wch: 20 }, // Thành tiền (VND)
      { wch: 20 }, // Ngày mua
      { wch: 30 }, // Mã giao dịch
    ];

    XLSX.writeFile(workbook, 'BaoCaoBanHang.xlsx');
    toast.success('Đã xuất báo cáo thành công!');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email người dùng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...adminStyles.input, width: '100%', maxWidth: '500px' }}
        />
        <button onClick={handleExportToExcel} style={{ ...adminStyles.button, ...adminStyles.primaryButton }}>
          Xuất ra Excel
        </button>
      </div>

      {filteredUserGroups.length > 0 && (
        <div style={{ display: 'flex', padding: '0.75rem 1.5rem', color: '#a0aec0', fontWeight: 'bold', borderBottom: '2px solid #4a5568' }}>
          <div style={{ flex: 3 }}>Người dùng</div>
          <div style={{ flex: 2, textAlign: 'right' }}>Tổng chi tiêu</div>
          <div style={{ flex: 2, textAlign: 'right' }}>Số sản phẩm</div>
          <div style={{ flex: 1, textAlign: 'right' }}>Chi tiết</div>
        </div>
      )}

      {filteredUserGroups.length > 0 ? (
        filteredUserGroups.map(group => {
          const userId = group.user._id || 'unknown';
          const isExpanded = expandedUsers[userId];
          return (
            <div key={userId} style={{ backgroundColor: '#2d3748', borderRadius: '8px', margin: '0.5rem 0', overflow: 'hidden', border: '1px solid #374151' }}>
              <div onClick={() => toggleUserExpansion(userId)} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#3c465a'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ flex: 3 }}>
                  <h4 style={{ margin: 0, color: '#fff' }}>{group.user.name}</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#a0aec0' }}>{group.user.email}</p>
                </div>
                <div style={{ flex: 2, textAlign: 'right', fontWeight: 'bold', color: '#48bb78' }}>{group.totalSpent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                <div style={{ flex: 2, textAlign: 'right' }}>{group.totalItems}</div>
                <div style={{ flex: 1, textAlign: 'right', fontSize: '1.5rem' }}>{isExpanded ? '▲' : '▼'}</div>
              </div>
              {isExpanded && (
                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  {/* Per-user filter section */}
                  <div style={{ backgroundColor: '#374151', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
                    <h5 style={{ marginTop: 0, marginBottom: '1rem', color: '#cbd5e0' }}>Lọc giao dịch của người dùng này</h5>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Lọc theo tên sản phẩm"
                        value={filtersByUser[userId]?.productName || ''}
                        onChange={(e) => handleFilterChangeForUser(userId, 'productName', e.target.value)}
                        style={{ ...adminStyles.input, width: '200px' }}
                      />
                      <input
                        type="number"
                        placeholder="Năm"
                        value={filtersByUser[userId]?.year || ''}
                        onChange={(e) => handleFilterChangeForUser(userId, 'year', e.target.value)}
                        style={{ ...adminStyles.input, width: '100px' }}
                      />
                      <input
                        type="number"
                        placeholder="Tháng"
                        value={filtersByUser[userId]?.month || ''}
                        onChange={(e) => handleFilterChangeForUser(userId, 'month', e.target.value)}
                        style={{ ...adminStyles.input, width: '100px' }}
                      />
                      <input
                        type="number"
                        placeholder="Ngày"
                        value={filtersByUser[userId]?.day || ''}
                        onChange={(e) => handleFilterChangeForUser(userId, 'day', e.target.value)}
                        style={{ ...adminStyles.input, width: '100px' }}
                      />
                    </div>
                  </div>
                  <table style={{ ...adminStyles.table, marginTop: '1rem', width: '100%', tableLayout: 'fixed' }}>
                    <thead><tr><th style={{ ...adminStyles.th, textAlign: 'left' }}>Sản phẩm</th><th style={adminStyles.th}>Số lượng</th><th style={adminStyles.th}>Thành tiền</th><th style={adminStyles.th}>Ngày mua</th></tr></thead>
                    <tbody>
                      {(() => {
                        const userTransactions = getFilteredUserTransactions(userId, group.transactions);
                        if (userTransactions.length === 0) {
                          return <tr><td colSpan="4" style={{ ...adminStyles.td, textAlign: 'center', padding: '1.5rem' }}>Không có giao dịch nào khớp với bộ lọc.</td></tr>;
                        }
                        return userTransactions.map(t => (
                          <tr key={t._id}>
                            <td style={adminStyles.td}>{t.product?.name || 'Sản phẩm đã bị xóa'}</td>
                            <td style={{ ...adminStyles.td, textAlign: 'center' }}>{t.quantity}</td>
                            <td style={{ ...adminStyles.td, textAlign: 'right' }}>{t.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                            <td style={{ ...adminStyles.td, textAlign: 'center' }}>{new Date(t.createdAt).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      ) : (<p style={{ textAlign: 'center', padding: '2rem' }}>Không có dữ liệu mua hàng để hiển thị.</p>)}
    </div>
  );
};

export default function AdminTransactionsPage() {
  const nav = useNavigate();
  const token = localStorage.getItem('admin_token') || '';
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('processing'); // Default to the most actionable tab
  const [confirmingId, setConfirmingId] = useState(null);
  const seenProcessingIds = useRef(new Set());
  const [viewMode, setViewMode] = useState('management'); // 'management' or 'byUser'

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    nav('/admin');
  }, [nav]);

  // Refactored data fetching logic into a useCallback to make it reusable
  const fetchAndProcessTransactions = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const latestTransactions = await api.getAdminTransactions(token);

      if (isInitialLoad) {
        latestTransactions.forEach(t => {
          if (t.status === 'processing') seenProcessingIds.current.add(t._id);
        });
      } else {
        const newProcessing = latestTransactions.filter(
          t => t.status === 'processing' && !seenProcessingIds.current.has(t._id)
        );

        if (newProcessing.length > 0) {
          toast.success(`Có ${newProcessing.length} đơn hàng mới cần xác nhận!`, {
            icon: '🔔',
            duration: 5000,
          });
          newProcessing.forEach(t => seenProcessingIds.current.add(t._id));
        }
      }

      setTransactions(latestTransactions);
      setError('');
    } catch (err) {
      console.error("Polling/fetching transactions failed:", err);
      setError('Failed to fetch transactions.');
      if (err.response?.status === 401) logout();
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, [token, logout]); // Dependencies for the fetch function

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }

    fetchAndProcessTransactions(true);
    const intervalId = setInterval(() => fetchAndProcessTransactions(false), POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [token, logout, fetchAndProcessTransactions]); // Added fetchAndProcessTransactions to dependencies

  const handleConfirmPayment = useCallback(async (transactionId) => {
    setConfirmingId(transactionId);
    try {
      await api.confirmAdminTransaction(token, transactionId);
      toast.success('Transaction confirmed successfully!');
      // Instead of updating local state, refetch the entire list to ensure data consistency
      await fetchAndProcessTransactions(false);
    } catch (err) {
      console.error("Failed to confirm transaction:", err);
      toast.error(`Error confirming payment: ${err.message || 'Please check console'}`);
    } finally {
      setConfirmingId(null);
    }
  }, [token, fetchAndProcessTransactions]); // Added fetchAndProcessTransactions to dependencies

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.status === filter);
  }, [transactions, filter]);

  const transactionCounts = useMemo(() => ({
    processing: transactions.filter(t => t.status === 'processing').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    all: transactions.length,
  }), [transactions]);

  // Calculate total items sold and total revenue from completed transactions
  const totalItemsSold = useMemo(() => {
    return transactions.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.quantity, 0);
  }, [transactions]);

  const totalRevenue = useMemo(() => {
    return transactions.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);


  return (
    <div style={adminStyles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={adminStyles.header}>{viewMode === 'management' ? 'Quản lý Giao dịch' : 'Thống kê theo Người dùng'}</h2>
        <div>
          <button onClick={() => nav('/admin/products')} style={{ ...adminStyles.button, marginRight: '1rem' }}>
            Dashboard
          </button>
          <button onClick={logout} style={{ ...adminStyles.button, ...adminStyles.dangerButton }}>
            Logout
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#f56565', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

      {/* New stat cards for total items sold and total revenue */}
      <div style={{ ...adminStyles.dashboard, marginBottom: '1.5rem' }}>
        <div style={adminStyles.statCard}>
          <h3 style={adminStyles.statCardTitle}>Tổng sản phẩm đã bán</h3>
          <p style={adminStyles.statCardValue}>{totalItemsSold}</p>
        </div>
        <div style={adminStyles.statCard}>
          <h3 style={adminStyles.statCardTitle}>Tổng doanh thu</h3>
          <p style={adminStyles.statCardValue}>{totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
        </div>
      </div>


      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #4a5568', paddingBottom: '1.5rem' }}>
        <button
          onClick={() => setViewMode('management')}
          style={{ ...adminStyles.button, marginRight: '1rem', backgroundColor: viewMode === 'management' ? '#4299e1' : '#4a5568' }}
        >
          Quản lý Giao dịch
        </button>

        <button
          onClick={() => setViewMode('byUser')}
          style={{ ...adminStyles.button, backgroundColor: viewMode === 'byUser' ? '#4299e1' : '#4a5568' }}
        >
          Thống kê theo Người dùng
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</p>
      ) : viewMode === 'management' ? (
        <>
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <FilterButton filter="processing" currentFilter={filter} setFilter={setFilter} count={transactionCounts.processing}>
              Chờ xác nhận
            </FilterButton>
            <FilterButton filter="completed" currentFilter={filter} setFilter={setFilter} count={transactionCounts.completed}>
              Đã hoàn thành
            </FilterButton>
            <FilterButton filter="pending" currentFilter={filter} setFilter={setFilter} count={transactionCounts.pending}>
              Chưa hoàn tất
            </FilterButton>
            <FilterButton filter="all" currentFilter={filter} setFilter={setFilter} count={transactionCounts.all}>
              Tất cả
            </FilterButton>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={adminStyles.table}>
              <thead>
                <tr>
                  <th style={adminStyles.th}>Ngày</th>
                  <th style={adminStyles.th}>Người dùng</th>
                  <th style={adminStyles.th}>Sản phẩm</th>
                  <th style={adminStyles.th}>Số lượng</th>
                  <th style={adminStyles.th}>Thành tiền</th>
                  <th style={adminStyles.th}>Mã giao dịch</th>
                  <th style={adminStyles.th}>Trạng thái</th>
                  <th style={adminStyles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(transaction => (
                    <tr key={transaction._id}>
                      <td style={adminStyles.td}>{new Date(transaction.createdAt).toLocaleString('vi-VN')}</td>
                      <td style={adminStyles.td}>
                        {transaction.user?.name || 'N/A'}<br />
                        <span style={{ fontSize: '0.8em', color: '#a0aec0' }}>({transaction.user?.email || 'N/A'})</span>
                      </td>
                      <td style={adminStyles.td}>{transaction.product?.name || 'N/A'}</td>
                      <td style={{ ...adminStyles.td, whiteSpace: 'nowrap' }}>
                        {(transaction.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                      <td style={{ ...adminStyles.td, wordBreak: 'break-all' }}>{transaction.transactionId}</td>
                      <td style={adminStyles.td}>
                        <span style={getStatusStyle(transaction.status)}>{transaction.status}</span>
                      </td>
                      <td style={adminStyles.td}>
                        {transaction.status === 'processing' && (
                          <button
                            onClick={() => handleConfirmPayment(transaction._id)}
                            disabled={confirmingId === transaction._id}
                            style={{ ...adminStyles.button, ...adminStyles.primaryButton, ...(confirmingId === transaction._id ? adminStyles.buttonDisabled : {}) }}
                          >
                            {confirmingId === transaction._id ? 'Confirming...' : 'Confirm'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ ...adminStyles.td, textAlign: 'center', padding: '2rem' }}>
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <UserSalesReport transactions={transactions} />
      )}
    </div>
  );
}
