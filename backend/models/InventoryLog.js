const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['sale', 'stock-in', 'adjustment'],
    default: 'adjustment'
  },
  quantityChange: { type: Number, required: true },
  stockAfter: { type: Number, required: true },
  notes: { type: String, default: '' },
  relatedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  performedBy: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      adminEmail: { type: String }
  }
}, { 
  timestamps: true,
  collection: 'inventory_logs'
});

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
