require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// --- AUTH ROUTES ---

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, hashedPassword);
    res.status(201).json({ message: 'User registered', userId: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user: ' + err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body; // 'username' here can be username or email
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Login error' });
  }
});

// --- PRODUCT ROUTES ---

app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// --- ORDER ROUTES ---

app.post('/api/checkout', authenticate, (req, res) => {
  const { items, total } = req.body; // items: [{productId, quantity, price}]
  
  const transaction = db.transaction(() => {
    const orderResult = db.prepare('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)').run(req.userId, total);
    const orderId = orderResult.lastInsertRowid;
    
    const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      insertOrderItem.run(orderId, item.productId, item.quantity, item.price);
    }
    return orderId;
  });

  try {
    const orderId = transaction();
    res.status(201).json({ message: 'Order created', orderId });
  } catch (err) {
    res.status(500).json({ message: 'Checkout error: ' + err.message });
  }
});

app.get('/api/orders', authenticate, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(orders);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
