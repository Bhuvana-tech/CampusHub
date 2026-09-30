const Product = require('./models/Product');

// Helper SVG generator function to produce attractive food card images
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
    name: 'Tomato',
    category: 'Vegetables',
    price: 40,
    unit: 'kg',
    image: createSvg('#fef2f2', '🍅', 'Fresh Tomato', '#fca5a5')
  },
  {
    name: 'Potato',
    category: 'Vegetables',
    price: 35,
    unit: 'kg',
    image: createSvg('#fefce8', '🥔', 'Organic Potato', '#fde047')
  },
  {
    name: 'Onion',
    category: 'Vegetables',
    price: 30,
    unit: 'kg',
    image: createSvg('#fae8ff', '🧅', 'Red Onion', '#f0abfc')
  },
  {
    name: 'Carrot',
    category: 'Vegetables',
    price: 50,
    unit: 'kg',
    image: createSvg('#fff7ed', '🥕', 'Fresh Carrot', '#fdba74')
  },
  {
    name: 'Beans',
    category: 'Vegetables',
    price: 60,
    unit: 'kg',
    image: createSvg('#f0fdf4', '🫛', 'Green Beans', '#86efac')
  },
  {
    name: 'Cabbage',
    category: 'Vegetables',
    price: 40,
    unit: 'kg',
    image: createSvg('#ecfdf5', '🥬', 'Green Cabbage', '#6ee7b7')
  },
  {
    name: 'Cauliflower',
    category: 'Vegetables',
    price: 45,
    unit: 'pc',
    image: createSvg('#f8fafc', '🥦', 'Cauliflower', '#cbd5e1')
  },
  {
    name: 'Spinach',
    category: 'Vegetables',
    price: 25,
    unit: 'bunch',
    image: createSvg('#f0fdf4', '🌿', 'Fresh Spinach', '#4ade80')
  },
  {
    name: 'Brinjal',
    category: 'Vegetables',
    price: 35,
    unit: 'kg',
    image: createSvg('#faf5ff', '🍆', 'Fresh Brinjal', '#c084fc')
  },
  {
    name: 'Capsicum',
    category: 'Vegetables',
    price: 70,
    unit: 'kg',
    image: createSvg('#f0fdf4', '🫑', 'Green Capsicum', '#4ade80')
  },

  // FRUITS
  {
    name: 'Apple',
    category: 'Fruits',
    price: 120,
    unit: 'kg',
    image: createSvg('#fef2f2', '🍎', 'Red Apple', '#f87171')
  },
  {
    name: 'Banana',
    category: 'Fruits',
    price: 50,
    unit: 'dozen',
    image: createSvg('#fefce8', '🍌', 'Ripe Banana', '#facc15')
  },
  {
    name: 'Orange',
    category: 'Fruits',
    price: 80,
    unit: 'kg',
    image: createSvg('#fff7ed', '🍊', 'Juicy Orange', '#fb923c')
  },
  {
    name: 'Grapes',
    category: 'Fruits',
    price: 90,
    unit: 'kg',
    image: createSvg('#f5f3ff', '🍇', 'Sweet Grapes', '#c084fc')
  },
  {
    name: 'Mango',
    category: 'Fruits',
    price: 150,
    unit: 'kg',
    image: createSvg('#fffbeb', '🥭', 'King Mango', '#fbbf24')
  },
  {
    name: 'Papaya',
    category: 'Fruits',
    price: 60,
    unit: 'pc',
    image: createSvg('#fff7ed', '🥭', 'Fresh Papaya', '#f97316')
  },
  {
    name: 'Watermelon',
    category: 'Fruits',
    price: 40,
    unit: 'pc',
    image: createSvg('#fef2f2', '🍉', 'Watermelon', '#f87171')
  },
  {
    name: 'Pomegranate',
    category: 'Fruits',
    price: 140,
    unit: 'kg',
    image: createSvg('#fff1f2', '🍎', 'Pomegranate', '#fb7185')
  }
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Seeding initial products into database...');
      await Product.insertMany(sampleProducts);
      console.log(`Successfully seeded ${sampleProducts.length} products!`);
    } else {
      console.log(`Database already has ${count} products. Skipping initial seed.`);
    }
  } catch (err) {
    console.error('Error seeding products:', err);
  }
};

module.exports = { seedProducts, sampleProducts };
