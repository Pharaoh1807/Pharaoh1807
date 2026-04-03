const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction'); // Import Transaction model
const { protect } = require('../middleware/authUserMiddleware');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    

    if (user && (await bcrypt.compare(password, user.password))) {
      // Chỉ trả về token để tăng cường bảo mật và giảm lượng dữ liệu truyền tải
      res.json({ token: generateToken(user._id) });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * @desc    Get user profile / Verify token
 * @route   GET /api/users/me
 * @access  Private
 */
router.get('/me', protect, (req, res) => {
  // 'protect' middleware has already found the user and attached it to req.user
  const token = req.headers.authorization.split(' ')[1];
  res.status(200).json({
    ...req.user.toObject(), // Send all user data (except password)
    token, // Also send the token back so it can be re-saved in localStorage
  });
});

/**
 * @desc    Get user's order history
 * @route   GET /api/users/orders
 * @access  Private
 */
router.get('/orders', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const sort = req.query.sort || 'newest';
    const skip = (page - 1) * limit;

    let query = { user: req.user._id };

    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      // Find matching products first to support querying by product name
      const Product = require('../models/Product');
      const matchingProducts = await Product.find({ name: { $regex: search, $options: 'i' } }, '_id');
      const productIds = matchingProducts.map(p => p._id);
      
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { product: { $in: productIds } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };

    const totalOrders = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit) || 1;

    // Find requested transactions for the logged-in user and populate product details
    const orders = await Transaction.find(query)
      .populate('product', 'name imageUrls priceCents _id') // Lấy thông tin sản phẩm liên quan
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders
      }
    });
  } catch (error) {
    console.error("Error fetching user's orders:", error);
    res.status(500).json({ error: 'Server error while fetching orders.' });
  }
});

module.exports = router;
