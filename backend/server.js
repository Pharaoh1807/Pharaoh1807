require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware should be placed before any routes
app.use(cors({ origin: '*', credentials: true }));

// Route imports
const productsRoute = require('./routes/products');
const adminRoute = require('./routes/admin');
const uploadRoute = require('./routes/uploadRoutes');

const { router: checkoutRoute, webhookHandler, stripe } = require('./routes/checkout');
const vietqrRoute = require('./routes/vietqr');
const transactionsRoute = require('./routes/transactions');
const userRoute = require('./routes/users');
// Webhook must use raw body

// JSON body parser for other API routes


app.use('/api/products', productsRoute);
app.use('/api/admin', adminRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/checkout', checkoutRoute);
app.use('/api/vietqr', vietqrRoute);
app.use('/api/transactions', transactionsRoute);
app.use('/api/users', userRoute);


app.use("/", (req, res, next) => {
  res.json(`Hi`)});

const start = async () => {
  try {
    // Since you are using Mongoose models, you should connect using mongoose.
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
  } catch (e) {
    console.error('Failed to start server', e);
    process.exit(1);
  }
};

start();
