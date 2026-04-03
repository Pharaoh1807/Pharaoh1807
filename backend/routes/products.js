const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// Public: get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    // Only return the product if it exists and is active
    if (!product || !product.active) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(`Error fetching product with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Public: list active products
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = { active: true };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit) || 1;

    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    res.json({
      products: products || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
