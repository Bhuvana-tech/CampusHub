const bcrypt = require('bcryptjs');

// Helper SVG generator function to produce attractive food card images as fallback
const createSvg = (bgColor, emoji, text, circleColor) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="${bgColor}" rx="16"/>
    <circle cx="200" cy="130" r="85" fill="${circleColor}" opacity="0.4"/>
    <circle cx="200" cy="130" r="70" fill="#ffffff" opacity="0.9"/>
    <text x="200" y="150" font-size="72" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <text x="200" y="245" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#1e293b" text-anchor="middle">${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const sampleProducts = [
  // VEGETABLES
  {
    _id: 'prod_veg_1',
    name: 'Tomato',
    category: 'Vegetables',
    price: 40,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_veg_2',
    name: 'Potato',
    category: 'Vegetables',
    price: 35,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_veg_3',
    name: 'Onion',
    category: 'Vegetables',
    price: 30,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_veg_4',
    name: 'Carrot',
    category: 'Vegetables',
    price: 50,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1598170845058-12ef4a457511?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_veg_5',
    name: 'Beans',
    category: 'Vegetables',
    price: 60,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_veg_6',
    name: 'Cabbage',
    category: 'Vegetables',
    price: 40,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_veg_7',
    name: 'Cauliflower',
    category: 'Vegetables',
    price: 45,
    unit: 'pc',
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_veg_8',
    name: 'Spinach',
    category: 'Vegetables',
    price: 25,
    unit: 'bunch',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_veg_9',
    name: 'Brinjal',
    category: 'Vegetables',
    price: 35,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_veg_10',
    name: 'Capsicum',
    category: 'Vegetables',
    price: 70,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=80'
  },

  // FRUITS
  {
    _id: 'prod_fruit_1',
    name: 'Apple',
    category: 'Fruits',
    price: 120,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_fruit_2',
    name: 'Banana',
    category: 'Fruits',
    price: 50,
    unit: 'dozen',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_fruit_3',
    name: 'Orange',
    category: 'Fruits',
    price: 80,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_fruit_4',
    name: 'Grapes',
    category: 'Fruits',
    price: 90,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_fruit_5',
    name: 'Mango',
    category: 'Fruits',
    price: 150,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_fruit_6',
    name: 'Papaya',
    category: 'Fruits',
    price: 60,
    unit: 'pc',
    image: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_fruit_7',
    name: 'Watermelon',
    category: 'Fruits',
    price: 40,
    unit: 'pc',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80'
  },
  {
    _id: 'prod_fruit_8',
    name: 'Pomegranate',
    category: 'Fruits',
    price: 140,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80'
  }
];

class InMemoryStore {
  constructor() {
    this.users = [];
    this.products = [...sampleProducts];
    this.cartItems = [];
    this.orders = [];
    this.idCounter = 100;
  }

  generateId(prefix = 'id') {
    this.idCounter += 1;
    return `${prefix}_${Date.now()}_${this.idCounter}`;
  }

  // User Methods
  async createUser({ name, email, password }) {
    const existing = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: this.generateId('user'),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return { _id: newUser._id, name: newUser.name, email: newUser.email };
  }

  async loginUser({ email, password }) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }
    return { _id: user._id, name: user.name, email: user.email };
  }

  // Product Methods
  getProducts({ category, search }) {
    let result = [...this.products];
    if (category && category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    return result;
  }

  getProductById(id) {
    return this.products.find(p => p._id === id || p._id.toString() === id.toString());
  }

  // Cart Methods
  getCart(userId) {
    const userCart = this.cartItems.filter(item => item.userId === userId);
    return userCart.map(item => {
      const prod = this.getProductById(item.productId);
      return {
        _id: item._id,
        userId: item.userId,
        quantity: item.quantity,
        productId: prod || { _id: item.productId, name: 'Unknown', price: 0, unit: 'unit', image: '' }
      };
    });
  }

  addToCart({ userId, productId, quantity = 1 }) {
    const qty = Number(quantity);
    let item = this.cartItems.find(i => i.userId === userId && i.productId === productId);
    if (item) {
      item.quantity += qty;
      if (item.quantity <= 0) {
        this.cartItems = this.cartItems.filter(i => i._id !== item._id);
        return null;
      }
    } else {
      if (qty <= 0) return null;
      item = {
        _id: this.generateId('cart'),
        userId,
        productId,
        quantity: qty
      };
      this.cartItems.push(item);
    }
    const prod = this.getProductById(productId);
    return {
      _id: item._id,
      userId: item.userId,
      quantity: item.quantity,
      productId: prod
    };
  }

  updateCartQuantity(id, quantity) {
    const qty = Number(quantity);
    const index = this.cartItems.findIndex(i => i._id === id);
    if (index === -1) return null;

    if (qty <= 0) {
      this.cartItems.splice(index, 1);
      return null;
    }

    this.cartItems[index].quantity = qty;
    const item = this.cartItems[index];
    const prod = this.getProductById(item.productId);
    return {
      _id: item._id,
      userId: item.userId,
      quantity: item.quantity,
      productId: prod
    };
  }

  removeCartItem(id) {
    this.cartItems = this.cartItems.filter(i => i._id !== id);
    return true;
  }

  clearUserCart(userId) {
    this.cartItems = this.cartItems.filter(i => i.userId !== userId);
    return true;
  }

  // Order Methods
  createOrder({ userId, items, total, deliveryFee = 0, shippingAddress }) {
    const newOrder = {
      _id: this.generateId('ord'),
      userId,
      items,
      total,
      deliveryFee,
      shippingAddress,
      status: 'Placed',
      paymentMethod: 'Cash on Delivery',
      createdAt: new Date().toISOString()
    };
    this.orders.unshift(newOrder);
    this.clearUserCart(userId);
    return newOrder;
  }

  getOrders(userId) {
    return this.orders.filter(o => o.userId === userId);
  }
}

const store = new InMemoryStore();
module.exports = store;
