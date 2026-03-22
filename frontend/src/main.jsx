import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom'; 
import App from './App.jsx';
import Shop from './pages/Shop.jsx';
import Success from './pages/Success.jsx';
import Cancel from './pages/Cancel.jsx';
import Payment from './pages/Payment.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminAddProduct from './pages/AdminAddProduct.jsx';
import AdminEditProduct from './pages/AdminEditProduct.jsx';
import AdminFailedLogin from './pages/AdminFailedLogin.jsx';
import UserLogin from './pages/UserLogin.jsx';
import UserRegister from './pages/UserRegister.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminTransactionsPage from './pages/AdminTransactionsPage.jsx';
import AdminProductHistory from './pages/AdminProductHistory.jsx';
import NotFound from './pages/NotFound.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';


const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Shop /> },
      { path: 'success', element: <Success /> },
      { path: 'cancel', element: <Cancel /> },
      { path: 'payment', element: <Payment /> },
      { path: 'products/:id', element: <ProductDetail /> },
      { path: 'user/login', element: <UserLogin /> },
      { path: 'user/register', element: <UserRegister /> },
      {
        path: 'user/dashboard',
        element: (
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        )
      },
      { path: 'admin', element: <AdminLogin /> },
      { path: 'admin/users', element: <AdminUsers /> },
      { path: 'admin/products', element: <AdminProducts /> },
      { path: 'admin/products/addproduct', element: <AdminAddProduct /> },
      { path: 'admin/products/edit/:id', element: <AdminEditProduct /> },
      { path: 'admin/products/:id/history', element: <AdminProductHistory /> },
      { path: 'admin/transactions', element: <AdminTransactionsPage /> },
      { path: 'admin/failedlogin', element: <AdminFailedLogin /> },
      { path: '404', element: <NotFound /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
