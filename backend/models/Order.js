const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 },
  amountCents: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'usd' },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'canceled'], default: 'pending' },
  provider: { type: String, default: 'stripe' },
  providerSessionId: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
