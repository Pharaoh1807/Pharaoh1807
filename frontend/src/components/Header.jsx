import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Toaster } from 'react-hot-toast';
import { usePendingTransactionsCount } from '../hooks/usePendingTransactionsCount'; // Import the new hook

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [bell, setBell] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const previousOrdersRef = useRef({ userId: null, orders: [] });
  const notificationTimeoutRef = useRef(null);
  const location = useLocation(); // Hook để theo dõi sự thay đổi đường dẫn
  const navigate = useNavigate();


  const adminToken = localStorage.getItem('admin_token'); // Get admin token directly here
  // Hàm kiểm tra trạng thái đăng nhập, ưu tiên admin
  const checkAuthStatus = () => {
    const adminToken = localStorage.getItem('admin_token');
    const rawUserToken = localStorage.getItem('user_token'); // Lấy chuỗi JWT thuần túy

    // Hàm xác thực session của người dùng một cách an toàn
    const verifyUserSession = () => {
      setIsAdmin(false);
      if (rawUserToken) {
        // Nếu có chuỗi token người dùng, xác thực nó
        api.verifyUserToken(rawUserToken)
          .then(freshUserData => {
            // Token hợp lệ, cập nhật state và localStorage với dữ liệu mới từ server
            setUserInfo(freshUserData);
            localStorage.setItem('user_info', JSON.stringify(freshUserData));
          })
          .catch(() => {
            // Token không hợp lệ hoặc đã hết hạn, dọn dẹp cả user_token và user_info
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_info');
            setUserInfo(null);
          });
      } else {
        // Không có chuỗi token người dùng, đảm bảo user_info cũng được xóa
        localStorage.removeItem('user_info');
        setUserInfo(null);
      }
      /* Logic cũ đã bị loại bỏ:
      const userToken = localStorage.getItem('user_token');
      if (userToken) {
        try {
          const { token } = JSON.parse(userToken);
          if (!token) throw new Error("Không có token trong user_info");

          api.verifyUserToken(token)
            .then(freshUserData => {
              setUserInfo(freshUserData);
              localStorage.setItem('user_info', JSON.stringify(freshUserData));
            })
            .catch(() => {
              localStorage.removeItem('user_info');
              setUserInfo(null);
            });
        } catch (e) {
          // Dữ liệu trong localStorage bị lỗi, dọn dẹp
          localStorage.removeItem('user_info');
          setUserInfo(null);
        }
      } else {
        setUserInfo(null);
      } */
    };

    if (adminToken) {
      api.verifyAdminToken(adminToken)
        .then(data => {
          if (data.valid) {
            setIsAdmin(true);
            setUserInfo(null);
            // Nếu admin đã đăng nhập, đảm bảo session người dùng được xóa hoàn toàn
            localStorage.removeItem('user_token');
            if (localStorage.getItem('user_info')) localStorage.removeItem('user_info');
          } else {
            localStorage.removeItem('admin_token');
            verifyUserSession();
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          verifyUserSession();
        });
    } else {
      verifyUserSession();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token'); // Xóa chuỗi token người dùng
    localStorage.removeItem('user_info');
    setUserInfo(null);
    // Khi người dùng đăng xuất, cũng nên xóa token admin để đảm bảo sạch sẽ
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
    navigate('/');
  };

  // Chạy hàm kiểm tra mỗi khi người dùng chuyển trang
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  // Handlers for showing/hiding the notification dropdown with a delay
  // to allow the user to move their mouse into the dropdown.
  const handleNotificationEnter = () => {

    clearTimeout(notificationTimeoutRef.current);
    setShowNotifications(true);
  };

  const handleNotificationLeave = () => {
    // Set a timeout to hide the dropdown, allowing the user to move the cursor into it
    setBell(false);
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotifications(false);
    }, 300); // 300ms delay
  };

  // Effect for polling user order status to create notifications
  useEffect(() => {
    // If no user is logged in, do nothing and clear any existing state.
    if (!userInfo) {
      setNotifications([]);
      previousOrdersRef.current = { userId: null, orders: [] };
      return;
    }

    // Clear any pending timeouts when user info changes
    clearTimeout(notificationTimeoutRef.current);
    const userToken = localStorage.getItem('user_token');
    if (!userToken) return;

    const fetchAndCheckOrders = async () => {
      try {
        const latestOrders = await api.getUserOrders(userToken);

        // If the user has changed since the last check, or if it's the very first fetch for this user,
        // just populate the ref and wait for the next poll to compare.
        if (previousOrdersRef.current.userId !== userInfo._id) {
          previousOrdersRef.current = { userId: userInfo._id, orders: latestOrders };
          return;
        }

        // Compare new orders with old ones to find status changes.
        const oldOrders = previousOrdersRef.current.orders;
        const newNotifications = [];
        latestOrders.forEach(newOrder => {
          const oldOrder = oldOrders.find(o => o._id === newOrder._id);


          if (oldOrder && oldOrder.status === 'processing' && newOrder.status === 'completed') {

            newNotifications.push({
              id: newOrder._id,
              message: `Đơn hàng #${newOrder.transactionId.slice(-6)} đã được xác nhận!`,
              link: '/user/dashboard'
            });
          }
        });



        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev]);
          setBell(true); // Show the bell notification badge

        }

        // Always update the ref with the latest data for the current user.
        previousOrdersRef.current = { userId: userInfo._id, orders: latestOrders };
      } catch (error) {
        console.error("Failed to poll for order updates:", error);
      }
    };

    fetchAndCheckOrders(); // Initial fetch to populate the reference
    const POLLING_INTERVAL = 15000; // Poll every 15 seconds
    const intervalId = setInterval(fetchAndCheckOrders, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
      clearTimeout(notificationTimeoutRef.current); // Cleanup timeout on unmount
    };
  }, [userInfo]); // Rerun this effect when the user logs in or out.

  // Use the new hook to get pending transaction count for admin
  const { count: pendingTransactionsCount, loading: pendingCountLoading } = usePendingTransactionsCount(adminToken);

  // Style for the notification badge
  const notificationBadgeStyle = {
    backgroundColor: '#e53e3e', // Red color for notification
    color: 'white',
    borderRadius: '50%',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginLeft: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };




  return (
    <div style={{
      backgroundColor: '#1a202c',
      color: '#e2e8f0',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <Toaster position="top-center" reverseOrder={false} />

      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1a202c',
        borderBottom: '1px solid #4a5568',
        zIndex: 1000,
        padding: '0 4%'
      }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 0',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>

          <Link to="/" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Nutritions Shop - Hao Hao
          </Link>
          <nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {isAdmin ? (
                <>
                  <Link to="/admin/transactions" style={{ color: '#cbd5e0', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    Order
                    {!pendingCountLoading && pendingTransactionsCount > 0 && (
                      <span style={notificationBadgeStyle}>
                        {pendingTransactionsCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/admin/products" style={{ color: '#cbd5e0', textDecoration: 'none', fontWeight: 'bold' }}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#f56565', cursor: 'pointer', fontWeight: 'bold' }}>Log Out</button>
                </>
              ) : userInfo ? (
                <>
                  <span style={{ color: '#cbd5e0' }}>Chào, {userInfo.name}</span>

                  {/* Notification Area */}
                  <div
                    style={{ position: 'relative' }}
                    onMouseEnter={handleNotificationEnter}
                    onMouseLeave={handleNotificationLeave}
                  >
                    <div style={{ color: '#cbd5e0', cursor: 'pointer', position: 'relative', padding: '0.5rem' }}>
                      <span role="img" aria-label="notifications">🔔</span>
                      {bell && notifications.length > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '0',
                          right: '0',
                          backgroundColor: '#e53e3e',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {notifications.length}
                        </span>
                      )}
                    </div>

                    {showNotifications && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: '#2d3748',
                        border: '1px solid #4a5568',
                        borderRadius: '8px',
                        width: '300px',
                        zIndex: 1001,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                      }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #4a5568', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0 }}>Thông báo</h4>
                          {notifications.length > 0 && (
                            <button
                              onClick={() => {
                                setNotifications([]);
                                setShowNotifications(false); // Also hide the dropdown
                              }}
                              style={{ background: 'none', border: 'none', color: '#63b3ed', cursor: 'pointer', fontSize: '0.8rem' }}
                            >Xóa tất cả</button>
                          )}
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '400px', overflowY: 'auto' }}>
                          {notifications.length > 0 ? (
                            notifications.map(notif => (
                              <li key={notif.id} style={{ borderBottom: '1px solid #4a5568' }}>
                                <Link to={notif.link} onClick={() => setShowNotifications(false)} style={{ display: 'block', padding: '0.75rem 1rem', color: '#e2e8f0', textDecoration: 'none', transition: 'background-color 0.2s' }}>
                                  {notif.message}
                                </Link>
                              </li>
                            ))
                          ) : (
                            <li style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#a0aec0' }}>Không có thông báo mới.</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Link to="/user/dashboard" style={{ color: '#cbd5e0', textDecoration: 'none', fontWeight: 'bold' }}>Account</Link>
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#f56565', cursor: 'pointer', fontWeight: 'bold' }}>Log Out</button>
                </>
              ) : (
                <Link to="/user/login" style={{ color: '#cbd5e0', textDecoration: 'none', fontWeight: 'bold' }}>
                  Log In
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main style={{
        paddingTop: '90px', // Điều chỉnh theo chiều cao header
        paddingLeft: '4%',
        paddingRight: '4%'
      }}><Outlet /></main>
    </div>

  );
}
