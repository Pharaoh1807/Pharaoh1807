const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, default: '' }, // Mô tả ngắn
  longDescription: { type: String, default: '' }, // Mô tả dài
  category: { type: String, default: 'Uncategorized', trim: true, index: true }, // Thêm danh mục sản phẩm
  priceCents: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 }, // Thêm số lượng tồn kho
  imageUrls: { type: [String], default: [] },
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
  collection: 'products'
});

// Thêm text index để hỗ trợ tìm kiếm hiệu quả trên các trường name và category
productSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
