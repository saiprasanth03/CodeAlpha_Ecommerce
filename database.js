// const sqlite3 = require('sqlite3');
// const { open } = require('sqlite');
// const path = require('path');

// const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

// // Create tables
// db.serialize(() => {
//   db.run(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       username TEXT UNIQUE NOT NULL,
//       email TEXT UNIQUE NOT NULL,
//       password_hash TEXT NOT NULL
//     )
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS products (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       description TEXT,
//       price REAL NOT NULL,
//       image_url TEXT,
//       category TEXT
//     )
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS orders (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       user_id INTEGER NOT NULL,
//       total_amount REAL NOT NULL,
//       status TEXT DEFAULT 'pending',
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (user_id) REFERENCES users (id)
//     )
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS order_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       order_id INTEGER NOT NULL,
//       product_id INTEGER NOT NULL,
//       quantity INTEGER NOT NULL,
//       price REAL NOT NULL,
//       FOREIGN KEY (order_id) REFERENCES orders (id),
//       FOREIGN KEY (product_id) REFERENCES products (id)
//     )
//   `);
// });


// // Seed some products
// const seedProducts = [
//   {
//     name: 'Smart Pro Watch',
//     description: 'Next-gen fitness tracking with sleek AMOLED display and 10-day battery.',
//     price: 2499.00,
//     image_url: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800',
//     category: 'Electronics'
//   },
//   {
//     name: 'Sonic Beats Buds',
//     description: 'Immersive sound with active noise cancellation and ergonomic fit.',
//     price: 1999.00,
//     image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
//     category: 'Audio'
//   },
//   {
//     name: 'Stealth RGB Keyboard',
//     description: 'Mechanical switches with customizable RGB lighting for elite gaming.',
//     price: 4500.00,
//     image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
//     category: 'Gaming'
//   },
//   {
//     name: 'UltraWide 27\" Monitor',
//     description: 'Stunning 4K resolution with HDR support and ultra-thin bezels.',
//     price: 18500.00,
//     image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
//     category: 'Computing'
//   },
//   {
//     name: 'ErgoMouse Wireless',
//     description: 'Advanced ergonomic design with precision tracking and vertical grip.',
//     price: 1299.00,
//     image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
//     category: 'Computing'
//   },
//   {
//     name: 'Bolt SSD 1TB',
//     description: 'Ultra-fast external storage with USB-C and rugged design.',
//     price: 7499.00,
//     image_url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800',
//     category: 'Storage'
//   },
//   {
//     name: 'Aura Charging Pad',
//     description: '15W fast wireless charging with premium tempered glass finish.',
//     price: 899.00,
//     image_url: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=800',
//     category: 'Accessories'
//   },
//   {
//     name: 'Vision 4K Webcam',
//     description: 'Crystal clear 4K video with dual microphones and privacy cover.',
//     price: 3500.00,
//     image_url: 'https://images.unsplash.com/photo-1589330694653-ded6df53f6ee?w=800',
//     category: 'Computing'
//   },
//   {
//     name: 'Pro Desk Mat',
//     description: 'Water-resistant micro-texture surface for smooth mouse movement.',
//     price: 599.00,
//     image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
//     category: 'Accessories'
//   }
// ];



// // Clear existing products and re-seed (handling foreign key constraints)
// db.serialize(() => {
//   db.run('PRAGMA foreign_keys = OFF');
//   db.run('DELETE FROM products');
//   db.run('PRAGMA foreign_keys = ON');

//   const stmt = db.prepare(
//     'INSERT OR IGNORE INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)'
//   );

//   seedProducts.forEach(p => {
//     stmt.run(p.name, p.description, p.price, p.image_url, p.category);
//   });

//   stmt.finalize();
// });


const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Mongo error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;