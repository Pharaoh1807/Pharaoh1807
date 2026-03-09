import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const userToken = localStorage.getItem('user_token'); // Kiểm tra sự tồn tại của token người dùng

  if (!userToken) { // Nếu không có token, chuyển hướng đến trang đăng nhập
    // Chuyển hướng về trang đăng nhập và lưu lại trang họ đang cố truy cập
    // để có thể quay lại sau khi đăng nhập thành công.
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  return children;
}
