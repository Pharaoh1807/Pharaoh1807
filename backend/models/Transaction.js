const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Thêm trường user
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'processing'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
