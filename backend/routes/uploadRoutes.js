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

// Catch multer errors specifically
router.post('/', adminAuth, (req, res, next) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ error: 'Thiếu cấu hình Cloudinary trong file .env. Bạn cần khởi động lại Server Node.js sau khi điền .env nhé!' });
  }
  
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('Multer/Cloudinary Error:', err);
      return res.status(500).json({ error: err.message || 'Lỗi khi upload ảnh lên Cloudinary.' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Không tìm thấy file ảnh để upload.' });
    }
    
    // Return the secure URL from Cloudinary
    res.json({ url: req.file.path });
  });
});

module.exports = router;
