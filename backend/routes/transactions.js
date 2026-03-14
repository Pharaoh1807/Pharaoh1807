const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
// const { protect } = require('../middleware/authUserMiddleware'); // Uncomment if you want to protect these routes

/**
 * @desc    Check transaction status
 * @route   GET /api/transactions/status/:transactionId
 * @access  Public (or Private if transactionId is sensitive)
 */
router.get('/status/:transactionId', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transactionId: req.params.transactionId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ status: transaction.status });
  } catch (error) {
    console.error('Error checking transaction status:', error);
    res.status(500).json({ error: 'Server error while checking transaction status.' });
  }
});

/**
 * @desc    Mock confirmation of payment (for demo purposes)
 * @route   POST /api/transactions/confirm-mock
 * @access  Public (or Private if you want to restrict who can mock confirm)
 */
router.post('/confirm-mock', async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required.' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: transactionId, status: 'pending' }, // Chỉ cập nhật nếu trạng thái đang là 'pending'
      { status: 'completed' },
      { new: true } // Trả về tài liệu đã được cập nhật
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Pending transaction not found or already completed.' });
    }

    res.json({ message: 'Transaction status updated to completed.', transaction });
  } catch (error) {
    console.error('Error mocking payment confirmation:', error);
    res.status(500).json({ error: 'Server error while mocking payment confirmation.' });
  }
});

router.delete('/:transactionId', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ transactionId: req.params.transactionId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Server error while deleting transaction.' });
  }
});

module.exports = router;
