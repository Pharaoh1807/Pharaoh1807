const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const User = require('../models/User');
const InventoryLog = require('../models/InventoryLog');
const Transaction = require('../models/Transaction');
const adminAuth = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Admin login: issues JWT based on env credentials
router.post('/login', (req, res) => {  
  
  const { email, password } = req.body || {};
  console.log('Admin login attempt:', email, password)
  
  
  if (email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin', sub: email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
    
    ; // Debugging output
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Verify admin token
router.post("/verify-token", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1] || "";
  
  if (!token) return res.status(401).json({error: "No token provides"})
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      return res.json({ valid: true });
    }
    res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: 'Invalid token' });
  }
  
  
})

// Admin: list all products
router.get('/products', adminAuth, async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  res.json(products);
});

// Admin: create product
router.post('/products', adminAuth, async (req, res) => {
  const { name, description = '', longDescription = '', priceCents, imageUrls = [], active = true } = req.body || {};
  if (!name || typeof priceCents !== 'number') return res.status(400).json({ error: 'name and priceCents required' });
  const p = await Product.create({ name, description, longDescription, priceCents, imageUrls, active });
  res.status(201).json(p);
});

// Admin: get single product
router.get('/products/:id', adminAuth, async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Admin: get inventory history for a single product
router.get('/products/:id/history', adminAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const { year, month, day } = req.query;

    const query = { product: productId };

    if (year) {
      const y = parseInt(year, 10);
      const m = month ? parseInt(month, 10) - 1 : 0;
      const d = day ? parseInt(day, 10) : 1;
      
      const startDate = new Date(Date.UTC(y, m, d));
      
      let endDate;
      if (day) {
        endDate = new Date(Date.UTC(y, m, d + 1));
      } else if (month) {
        endDate = new Date(Date.UTC(y, m + 1, 1));
      } else {
        endDate = new Date(Date.UTC(y + 1, 0, 1));
      }
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    console.log('Inventory history query:', query);

    const history = await InventoryLog.find(query)
      .populate({
          path: 'relatedTransaction',
          select: 'transactionId'
      })
      .populate({
          path: 'performedBy.user',
          select: 'name email'
      })
      .sort({ createdAt: -1 });


    res.json(history);
  } catch (error) {
    console.error('Error fetching product inventory history:', error);
    res.status(500).json({ error: 'Server error while fetching product history.' });
  }
});

// Admin: Adjust inventory history for a single product
router.post('/products/:id/stock', adminAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const {quantityChange, notes} = req.body
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const newStock = product.stock + quantityChange;
    if (newStock < 0) return res.status(400).json({ error: 'Stock cannot be negative' });
    product.stock = newStock;
    await product.save();
    await InventoryLog.create({
      product: productId,
      type: quantityChange > 0 ? 'stock-in' : 'adjustment',
      quantityChange,
      stockAfter: newStock,
      notes: notes || ''
    });
    res.json({ message: 'Stock adjusted successfully', product });  
    
  } catch (error) {
    console.error("Stock update error:", error);
  res.status(500).json({ error: "Server error" });
  }
});




// Admin: update product
router.put('/products/:id', adminAuth, async (req, res) => {
  const updates = req.body || {};
  if (updates.priceCents != null && typeof updates.priceCents !== 'number') return res.status(400).json({ error: 'priceCents must be number' });
  const p = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// @desc    Adjust product stock and create a log
// @route   POST /api/admin/products/:id/adjust-stock
// @access  Private/Admin
router.post('/products/:id/adjust-stock', adminAuth, async (req, res) => {
  try {
    const { quantityChange, notes } = req.body;
    const productId = req.params.id;

    const qty = parseInt(quantityChange, 10);
    if (isNaN(qty) || qty === 0) {
      return res.status(400).json({ error: 'Quantity change must be a non-zero integer.' });
    }
    
    const type = qty > 0 ? 'stock-in' : 'adjustment';

    // Atomically find and update to prevent race conditions
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: -qty } }, // Ensures stock won't go negative
      { $inc: { stock: qty } },
      { new: true }
    );

    if (!updatedProduct) {
      const product = await Product.findById(productId);
      return res.status(400).json({ 
        error: `Stock adjustment failed. Not enough stock for this operation. Current stock: ${product?.stock || 0}.` 
      });
    }

    // Create log entry
    await InventoryLog.create({
      product: productId,
      type: type,
      quantityChange: qty,
      stockAfter: updatedProduct.stock,
      notes: notes || '',
      performedBy: { adminEmail: req.user.sub } // admin email from token
    });

    res.json({ message: 'Stock adjusted successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({ error: 'Server error while adjusting stock.' });
  }
});

// Admin: delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// @desc    Lấy danh sách người dùng với phân trang (cho Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    // Lấy tham số page và limit từ query string, với giá trị mặc định
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;

    // Đếm tổng số lượng người dùng để tính toán tổng số trang
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    // Tìm kiếm người dùng với phân trang, không lấy mật khẩu và sắp xếp theo ngày tạo mới nhất
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    // Trả về dữ liệu theo định dạng mà frontend mong đợi
    res.json({
      users,
      pagination: { currentPage: page, totalPages, totalUsers },
    });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách người dùng.' });
  }
});

// @desc    Delete a user by ID
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error while deleting user.' });
  }
});

// @desc    Update a user by ID
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (password) {
      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }
      
      let user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      if (name) user.name = name;
      if (email) user.email = email;
      user.password = password; // Trigger pre('save') hook in User model to hash with bcrypt
      await user.save();
      
      user = user.toObject();
      delete user.password;
      return res.json(user);
    } else {
      // If no new password, update name/email via findByIdAndUpdate
      const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 11000) return res.status(400).json({ error: 'Email already in use.' });
    res.status(500).json({ error: 'Server error while updating user.' });
  }
});

// @desc    Get all transactions (for Admin)
// @route   GET /api/admin/transactions
// @access  Private/Admin
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('user', 'name email') // Populate user name and email
      .populate('product', 'name imageUrls priceCents') // Populate product name, imageUrls, price
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching all transactions for admin:', error);
    res.status(500).json({ error: 'Server error while fetching transactions.' });
  }
});

// @desc    Admin confirms a payment
// @route   POST /api/admin/transactions/:id/confirm
// @access  Private/Admin
router.post('/transactions/:id/confirm', adminAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    if (transaction.status !== 'processing') {
      return res.status(400).json({ error: `Transaction is in '${transaction.status}' state, cannot confirm.` });
    }

    // Atomically find and update the product stock to prevent race conditions
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: transaction.product, stock: { $gte: transaction.quantity } },
      { $inc: { stock: -transaction.quantity } },
      { new: true }
    );

    if (!updatedProduct) {
      // If the update failed, it's either because the product doesn't exist or stock is insufficient.
      const product = await Product.findById(transaction.product);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${transaction.product} could not be found. Cannot update stock.` });
      } else {
        return res.status(400).json({
          error: `Cannot confirm transaction. Not enough stock for "${product.name}". Required: ${transaction.quantity}, Available: ${product.stock}.`
        });
      }
    }

    // If stock update was successful, proceed to update transaction status
    transaction.status = 'completed';
    await transaction.save();

    // Create an inventory log for the sale
    await InventoryLog.create({
      product: transaction.product,
      type: 'sale',
      quantityChange: -transaction.quantity,
      stockAfter: updatedProduct.stock,
      relatedTransaction: transaction._id,
      performedBy: { user: transaction.user }
    });

    // Respond with the updated transaction, populated with details
    const result = await Transaction.findById(req.params.id)
      .populate('user', 'name email')
      .populate('product', 'name imageUrls priceCents');

    res.json(result);
  } catch (error) {
    console.error('Error confirming transaction:', error);
    res.status(500).json({ error: 'Server error while confirming transaction.' });
  }
});

module.exports = router;
