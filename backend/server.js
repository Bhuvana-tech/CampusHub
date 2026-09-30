const express = require('express');
const cors = require('cors');
const store = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FreshBasket Backend', timestamp: new Date() });
});

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------

// User Signup
app.post('/api/users/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    const user = await store.createUser({ name, email, password });
    res.status(201).json({ user, token: user._id });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to create user account.' });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const user = await store.loginUser({ email, password });
    res.json({ user, token: user._id });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ error: err.message || 'Invalid email or password.' });
  }
});

// ----------------------------------------------------
// PRODUCT ROUTES
// ----------------------------------------------------

// Get all products (with optional filter by category or search term)
app.get('/api/products', (req, res) => {
  try {
    const { category, search } = req.query;
    const products = store.getProducts({ category, search });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = store.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

// ----------------------------------------------------
// CART ROUTES
// ----------------------------------------------------

// Get Cart for User / Session
app.get('/api/cart', (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const items = store.getCart(userId);
    res.json(items);
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).json({ error: 'Failed to fetch cart.' });
  }
});

// Add Item to Cart
app.post('/api/cart', (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId are required.' });
    }

    const item = store.addToCart({ userId, productId, quantity });
    res.json(item);
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
});

// Update Cart Item Quantity
app.put('/api/cart/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const updated = store.updateCartQuantity(id, quantity);
    res.json(updated || { message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error updating cart item:', err.message);
    res.status(500).json({ error: 'Failed to update cart item.' });
  }
});

// Remove Cart Item
app.delete('/api/cart/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.removeCartItem(id);
    res.json({ message: 'Item removed successfully.' });
  } catch (err) {
    console.error('Error deleting cart item:', err.message);
    res.status(500).json({ error: 'Failed to delete cart item.' });
  }
});

// Clear Cart for User
app.delete('/api/cart/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    store.clearUserCart(userId);
    res.json({ message: 'Cart cleared successfully.' });
  } catch (err) {
    console.error('Error clearing cart:', err.message);
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
});

// ----------------------------------------------------
// ORDER ROUTES
// ----------------------------------------------------

// Create Order
app.post('/api/orders', (req, res) => {
  try {
    const { userId, items, total, deliveryFee = 0, shippingAddress } = req.body;
    if (!userId || !items || !items.length || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required order details.' });
    }

    const order = store.createOrder({ userId, items, total, deliveryFee, shippingAddress });
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// Get User Orders
app.get('/api/orders', (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const orders = store.getOrders(userId);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

app.listen(PORT, () => {
  console.log(`FreshBasket Backend Server running on port ${PORT}`);
});
