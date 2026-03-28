require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const connectDB = require('./database');
const { User, Product, Order } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 🔐 Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};


// --- AUTH ---

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password_hash: hashedPassword
  });

  res.json({ message: 'User created', userId: user._id });
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email: username }]
  });

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '1h'
  });

  res.json({ token, username: user.username });
});


// --- PRODUCTS ---

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});


// --- ORDERS ---

app.post('/api/checkout', authenticate, async (req, res) => {
  const { items, total } = req.body;

  const order = await Order.create({
    user_id: req.userId,
    total_amount: total,
    items
  });

  res.json({ message: 'Order placed', orderId: order._id });
});

app.get('/api/orders', authenticate, async (req, res) => {
  const orders = await Order.find({ user_id: req.userId }).sort({ created_at: -1 });
  res.json(orders);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});