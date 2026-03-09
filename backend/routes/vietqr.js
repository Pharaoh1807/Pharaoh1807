const express = require('express');
const axios = require('axios');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { randomBytes } = require('crypto');
const { protect } = require('../middleware/authUserMiddleware');

const router = express.Router();

// Generate VietQR code for a product purchase
router.post('/generate', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.active) {
      return res.status(404).json({ error: 'Product not found or is not active.' });
    }

    // Generate a unique transaction ID
    const transactionId = `ORDER${Date.now()}${randomBytes(4).toString('hex').toUpperCase()}`;
    const amount = product.priceCents * quantity;

    // Ban đầu tạo với trạng thái 'pending'. Flow: pending -> processing -> completed
    await Transaction.create({
      transactionId,
      user: req.user._id, // Liên kết giao dịch với user đã đăng nhập
      product: product._id,
      quantity,
      amount,
      status: 'pending',
    });

    // --- Real VietQR API Call ---
    const vietQR_API_URL = 'https://api.vietqr.io/v2/generate';
    const payload = {
      accountNo: process.env.ACCOUNT_NO,
      accountName: process.env.ACCOUNT_NAME,
      acqId: process.env.ACQ_ID,
      amount: amount,
      addInfo: transactionId,
      format: "text",
      template: "compact",
    };

    // API của VietQR để tạo mã QR không yêu cầu header xác thực.
    const vietQRResponse = await axios.post(vietQR_API_URL, payload);

    if (vietQRResponse.data.code !== '00') {
      console.error('VietQR API Error:', vietQRResponse.data.desc);
      throw new Error(vietQRResponse.data.desc || 'VietQR API returned an error');
    }

    const qrDataURL = vietQRResponse.data.data.qrDataURL;

    res.json({
      qrDataURL: qrDataURL, // The real QR data URL from VietQR
      amount: amount,
      addInfo: transactionId,
    });
  } catch (error) {
    console.error('Error generating mock VietQR code:', error);
    res.status(500).json({ error: 'Could not generate QR code.', details: error.message });
  }
});

// @desc    User notifies that they have made the payment
// @route   POST /api/vietqr/notify-payment/:transactionId
// @access  Private
router.post('/notify-payment/:transactionId', protect, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findOne({ transactionId, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or does not belong to user.' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'This transaction is not awaiting payment notification.' });
    }

    // Update status to 'processing' (awaiting admin confirmation)
    transaction.status = 'processing';
    await transaction.save();

    res.json({ success: true, message: 'Payment notification received. Awaiting admin confirmation.' });
  } catch (error) {
    console.error('Error in payment notification:', error);
    res.status(500).json({ error: 'Server error while notifying payment.' });
  }
});

module.exports = router;
