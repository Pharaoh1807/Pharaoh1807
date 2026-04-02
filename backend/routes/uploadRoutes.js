const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const adminAuth = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nutrition-shop', // Images will be saved in this folder on Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  },
});

const upload = multer({ storage: storage });

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary and return its URL
// @access  Private/Admin
router.post('/', adminAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }
    // Return the secure URL from Cloudinary
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({ error: 'Image upload failed.' });
  }
});

module.exports = router;
