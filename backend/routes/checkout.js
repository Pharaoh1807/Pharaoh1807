const express = require('express');
require('dotenv').config();

const Stripe = require('stripe');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body || {};
    const product = await Product.findOne({ _id: productId, active: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const amountCents = product.priceCents * quantity;
    const order = await Order.create({
      product: product._id,
      quantity,
      amountCents,
      currency: 'usd',
      status: 'pending',
      provider: 'stripe'
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: product.name, description: product.description },
            unit_amount: product.priceCents
          },
          quantity
        }
      ],
      success_url: `${process.env.CLIENT_URL}/success?orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { orderId: String(order._id) }
    });

    order.providerSessionId = session.id;
    await order.save();

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Cannot create checkout session' });
  }
});

// Webhook (register before JSON parser in server.js using express.raw)
function webhookHandler(stripeInstance) {
  return (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata && session.metadata.orderId;
      if (orderId) {
        Order.findByIdAndUpdate(orderId, { status: 'paid', providerSessionId: session.id }).exec();
      }
    }
    res.json({ received: true });
  };
}

module.exports = { router, webhookHandler };
