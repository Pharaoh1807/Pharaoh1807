import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import pagesStyles from "../styles/pagesStyles"; // Assuming this has base styles

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px 40px',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#333',
    width: '100%',
    maxWidth: '400px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
  qrImage: {
    width: '250px',
    height: '250px',
    margin: '10px auto',
  },
  modalHeader: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  paymentInfo: {
    textAlign: 'left',
    margin: '1rem 0',
    padding: '1rem',
    backgroundColor: '#f7f7f7',
    borderRadius: '4px',
    wordBreak: 'break-all',
  },
  infoLine: {
    margin: '0.5rem 0',
  },
  closeButton: {
    ...(pagesStyles.buyButton || {}),
    backgroundColor: '#718096', // gray
    marginTop: '1rem',
    width: '100%',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  }
};

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const qrCodeData = location.state?.qrCodeData;
  const transactionId = qrCodeData?.addInfo; // Đây là mã giao dịch duy nhất
  const [step, setStep] = useState('scan'); // 'scan', 'submitting', 'submitted', 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    if (!qrCodeData || !transactionId) {
      console.error("Không tìm thấy dữ liệu giao dịch. Đang chuyển hướng...");
      navigate('/');
    }
  }, [qrCodeData, transactionId, navigate]);

  const closeModal = () => navigate(-1);

  // User confirms they have sent the payment
  const handlePaymentSent = async () => {
    setStep('submitting');
    setError('');
    try {
      // This new API function needs to be added to `api.js`
      await api.notifyPaymentSent(transactionId);
      setStep('submitted');
    } catch (error) {
      setError(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      setStep('error');
    }
  };

  if (!qrCodeData) return null;

  const renderContent = () => {
    switch (step) {
      case 'submitted':
        return (
          <>
            <h3 style={modalStyles.modalHeader}>Đã gửi yêu cầu xác nhận</h3>
            <p>Cảm ơn bạn! Chúng tôi đã nhận được thông báo chuyển khoản và sẽ xác nhận đơn hàng của bạn trong thời gian sớm nhất.</p>
            <p>Bạn có thể theo dõi trạng thái đơn hàng trong trang tài khoản.</p>
            <button onClick={() => navigate('/user/dashboard')} style={modalStyles.closeButton}>Xem lịch sử đơn hàng</button>
          </>
        );
      case 'error':
        return (
          <>
            <h3 style={modalStyles.modalHeader}>Có lỗi xảy ra</h3>
            <p style={{color: 'red'}}>{error}</p>
            <button onClick={closeModal} style={modalStyles.closeButton}>Đóng</button>
          </>
        );
      case 'scan':
      default:
        return (
          <>
            <h3 style={modalStyles.modalHeader}>Quét mã để thanh toán</h3>
            <img src={qrCodeData.qrDataURL} alt="VietQR Code" style={modalStyles.qrImage} />
            <div style={modalStyles.paymentInfo}>
              <p style={{...modalStyles.infoLine, whiteSpace: 'nowrap'}}><strong>Số tiền:</strong> {qrCodeData.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
              <p style={modalStyles.infoLine}><strong>Nội dung:</strong> {qrCodeData.addInfo}</p>
            </div>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>Sau khi chuyển khoản, vui lòng bấm nút xác nhận bên dưới.</p>
            <button onClick={handlePaymentSent} disabled={step === 'submitting'} style={{ ...modalStyles.closeButton, marginTop: '10px', backgroundColor: '#28a745' }}>
              {step === 'submitting' ? 'Đang gửi...' : 'Tôi đã chuyển khoản'}
            </button>
            <button onClick={closeModal} style={{ ...modalStyles.closeButton, backgroundColor: '#aaa' }}>Hủy</button>
          </>
        );
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        {renderContent()}
      </div>
    </div>
  );
}