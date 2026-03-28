const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password_hash: String
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image_url: String,
  category: String
});

const orderSchema = new mongoose.Schema({
  user_id: String,
  total_amount: Number,
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now },
  items: [
    {
      productId: String,
      quantity: Number,
      price: Number
    }
  ]
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Product: mongoose.model('Product', productSchema),
  Order: mongoose.model('Order', orderSchema)
};