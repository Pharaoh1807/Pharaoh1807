import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <div style={{ 
      backgroundColor: '#1a202c', 
      color: '#e2e8f0', 
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <Toaster position="top-center" reverseOrder={false} />
      <div style={{ padding: '0 4%' }}>
        <Header />
        <main style={{ paddingTop: '90px' }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}