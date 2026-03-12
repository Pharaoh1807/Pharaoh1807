import { useEffect, useReducer } from 'react';
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

  useEffect(() => {
    const fetchOrders = async () => {
      dispatch({ type: 'FETCH_START' });
      
      const userToken = localStorage.getItem('user_token');
      if (!userToken) {
        dispatch({ type: 'FETCH_ERROR', payload: 'You need to be logged in to view this page.' });
        return;
      }

      try {
        const data = await api.getUserOrders(userToken);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Could not load purchase history.' });
      }
    };

    fetchOrders();

    const intervalId = setInterval(fetchOrders, 15000); // Refresh every 10 seconds
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

  if (loading) return <div style={styles.container}>Đang tải...</div>;
  if (error) return <div style={styles.container}>{error}</div>;

  // Calculate stats based on completed orders only
  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalProductsPurchased = completedOrders.reduce((acc, order) => acc + order.quantity, 0);
  const totalAmountSpent = completedOrders.reduce((acc, order) => acc + order.amount, 0);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>My Account</h2>
      
      <div style={styles.totalCount}>
        <span>Total Products Purchased: {totalProductsPurchased}</span>
        <span>Total Spent: {totalAmountSpent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
      </div>

      <h3>Lịch sử mua hàng</h3>
      {orders.length > 0 ? (
        <div style={{ width: '100%' }}>
          {orders.map(order => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <strong>Order ID:</strong> {order.transactionId}
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
                  <h4><Link to={`/products/${order.product?._id}`} style={{color: '#fff', textDecoration: 'none'}}>{order.product?.name || 'Sản phẩm không còn tồn tại'}</Link></h4>
                  <p style={{margin: '0.25rem 0'}}>Quantity: {order.quantity}</p>
                  <p style={{margin: '0.25rem 0'}}>Total Amount: {(order.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                  <p style={{margin: '0.25rem 0', fontSize: '0.9rem', color: '#a0aec0'}}>Date: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Bạn chưa mua sản phẩm nào.</p>
      )}
    </div>
  );
}
