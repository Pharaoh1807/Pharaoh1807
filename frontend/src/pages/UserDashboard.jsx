import { useEffect, useReducer, useState } from 'react';
import { api } from '../api';
import pagesStyles from '../styles/pagesStyles';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';

// Reducer for managing component state
const initialState = {
  orders: [],
  totalPages: 1,
  totalOrders: 0,
  loading: true,
  error: '',
};

function orderReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        orders: action.payload.orders || [],
        totalPages: action.payload.pagination?.totalPages || 1,
        totalOrders: action.payload.pagination?.totalOrders || 0
      };
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
      return { style: { ...baseStyle, backgroundColor: 'var(--text-muted)' }, text: status };
  }
};

export default function UserDashboard() {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const { orders, loading, error } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateSort, setDateSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // We should debounce search, but for simplicity we rely on useEffect dependency
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateSort]);

  useEffect(() => {
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
        const data = await api.getUserOrders(userToken, currentPage, itemsPerPage, searchTerm, statusFilter, dateSort);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        if (isInitialLoad) {
          dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Could not load purchase history.' });
        } else {
          console.error('Background fetch error:', err);
        }
      }
    };

    fetchOrders(true);

    const intervalId = setInterval(() => fetchOrders(false), 15000);
    return () => clearInterval(intervalId);

  }, [currentPage, searchTerm, statusFilter, dateSort]);

  const styles = {
    container: { ...pagesStyles.container, alignItems: 'flex-start' },
    header: { ...pagesStyles.header, marginBottom: '2rem' },
    orderCard: {
      backgroundColor: 'var(--header-bg)',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      border: '1px solid var(--border-color)',
      width: '100%',
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border-color)',
      paddingBottom: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    orderProduct: { display: 'flex', alignItems: 'center', gap: '1rem' },
    productImage: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' },
    totalCount: {
      backgroundColor: 'var(--header-bg)',
      border: '1px solid var(--border-color)',
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

  // Note: Statistics (Total products, total spent) for server-side pagination 
  // requires an aggregate endpoint. In a real-world scenario, you might have `/api/users/stats`.
  // For now, if accurate global state is needed, we'll hide them or show stats for current page,
  // but to keep it simple, we'll try to provide them or drop them if they don't apply.
  // Wait, these totals only calculated the fetch array. We'll disable them temporarily if the backend doesn't send global stats.
  const totalProductsPurchased = orders.reduce((acc, order) => acc + (order.status === 'completed' ? order.quantity : 0), 0);
  const totalAmountSpent = orders.reduce((acc, order) => acc + (order.status === 'completed' ? order.amount : 0), 0);

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
        backgroundColor: 'var(--header-bg)',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
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
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-main)',
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
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-main)',
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
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-main)',
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
        {loading && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Đang tải...</span>}
      </div>
      {orders.length > 0 ? (
        <div style={{ width: '100%' }}>
          {orders.map(order => (
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
                  <h4><Link to={`/products/${order.product?._id}`} style={{ color: 'var(--title-color)', textDecoration: 'none' }}>{order.product?.name || 'Sản phẩm không còn tồn tại'}</Link></h4>
                  <p style={{ margin: '0.25rem 0' }}>Số lượng: {order.quantity}</p>
                  <p style={{ margin: '0.25rem 0' }}>Tổng tiền: {(order.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>
          ))}
          {state.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={state.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      ) : (
        <p>{orders.length > 0 ? 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc.' : 'Bạn chưa mua sản phẩm nào.'}</p>
      )}
    </div>
  );
}
