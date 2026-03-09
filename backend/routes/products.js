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
    const products = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();
    res.json(products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
