import { useEffect, useReducer, useState } from 'react';
import { api } from '../api';
import pagesStyles from '../styles/pagesStyles';
import { Link } from 'react-router-dom';

// Reducer for managing component state
const initialState = {
  orders: [],
  loading: true,
  error: '',
};

function orderReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// Helper function to get style and text for status badges
const getOrderStatusInfo = (status) => {
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
      return { style: { ...baseStyle, backgroundColor: '#28a745' }, text: 'Đã hoàn thành' };
    case 'processing':
      return { style: { ...baseStyle, backgroundColor: '#ffc107', color: 'black' }, text: 'Chờ xác nhận' };
    case 'pending':
      return { style: { ...baseStyle, backgroundColor: '#6c757d' }, text: 'Chờ thanh toán' };
    default:
      return { style: { ...baseStyle, backgroundColor: '#4a5568' }, text: status };
  }
};

export default function UserDashboard() {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const { orders, loading, error } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateSort, setDateSort] = useState('newest');

  useEffect(() => {
    // Determine whether to show loading indicator. Only show on initial load (orders.length === 0).
    const fetchOrders = async (isInitialLoad = false) => {
      if (isInitialLoad) {
        dispatch({ type: 'FETCH_START' });
      }

      const userToken = localStorage.getItem('user_token');
      if (!userToken) {
        dispatch({ type: 'FETCH_ERROR', payload: 'You need to be logged in to view this page.' });
        return;
      }

      try {
        const data = await api.getUserOrders(userToken);
        // Only update if data changed (prevent unnecessary re-renders)
        // Since we are replacing the full list, use JSON.stringify as a simple comparison, or just dispatch.
        // React's functional update on dispatch will re-render, but won't remount components if keys stay the same.
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // We only want to show full error page if it's the initial load or a critical error.
        // For background polling, we can choose to log it or update a silent error state.
        if (isInitialLoad) {
          dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Could not load purchase history.' });
        } else {
          console.error('Background fetch error:', err);
        }
      }
    };

    fetchOrders(true); // Initial load

    const intervalId = setInterval(() => fetchOrders(false), 15000); // Background refresh every 15s without setting loading=true
    return () => clearInterval(intervalId); // Cleanup on unmount

  }, []);

  const styles = {
    container: { ...pagesStyles.container, alignItems: 'flex-start' },
    header: { ...pagesStyles.header, marginBottom: '2rem' },
    orderCard: {
      backgroundColor: '#2d3748',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      border: '1px solid #4a5568',
      width: '100%',
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #4a5568',
      paddingBottom: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    orderProduct: { display: 'flex', alignItems: 'center', gap: '1rem' },
    productImage: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' },
    totalCount: {
      backgroundColor: '#4a5568',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '2rem',
      textAlign: 'left',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }
  };

  // Calculate stats based on completed orders only (safe to run on empty array)
  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalProductsPurchased = completedOrders.reduce((acc, order) => acc + order.quantity, 0);
  const totalAmountSpent = completedOrders.reduce((acc, order) => acc + order.amount, 0);

  // Apply filters and sorting
  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    if (dateSort === 'newest') return dateB - dateA;
    if (dateSort === 'oldest') return dateA - dateB;
    return 0;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Tài khoản của tôi</h2>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div style={styles.totalCount}>
        <span>Tổng sản phẩm đã mua: {totalProductsPurchased}</span>
        <span>Tổng tiền đã chi: {totalAmountSpent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: '#2d3748',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #4a5568',
        width: '100%',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #4a5568',
              backgroundColor: '#1a202c',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #4a5568',
              backgroundColor: '#1a202c',
              color: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="processing">Chờ xác nhận</option>
            <option value="pending">Chờ thanh toán</option>
          </select>
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #4a5568',
              backgroundColor: '#1a202c',
              color: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Mới nhất trước</option>
            <option value="oldest">Cũ nhất trước</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Lịch sử mua hàng</h3>
        {orders.length === 0 && loading && <span style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Đang tải...</span>}
      </div>
      {filteredOrders.length > 0 ? (
        <div style={{ width: '100%' }}>
          {filteredOrders.map(order => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <strong>Mã đơn hàng:</strong> {order.transactionId}
                </div>
                <div>
                  <span style={getOrderStatusInfo(order.status).style}>
                    {getOrderStatusInfo(order.status).text}
                  </span>
                </div>
              </div>
              <div style={styles.orderProduct}>


                <img src={order.product?.imageUrls?.[0] || 'https://placehold.co/80x80'} alt={order.product?.name} style={styles.productImage} />
                <div>
                  <h4><Link to={`/products/${order.product?._id}`} style={{ color: '#fff', textDecoration: 'none' }}>{order.product?.name || 'Sản phẩm không còn tồn tại'}</Link></h4>
                  <p style={{ margin: '0.25rem 0' }}>Số lượng: {order.quantity}</p>
                  <p style={{ margin: '0.25rem 0' }}>Tổng tiền: {(order.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#a0aec0' }}>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>{orders.length > 0 ? 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc.' : 'Bạn chưa mua sản phẩm nào.'}</p>
      )}
    </div>
  );
}
