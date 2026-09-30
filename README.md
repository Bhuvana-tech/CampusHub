# 🧺 FreshBasket — Fresh Fruits & Vegetables Made Easy

A simple, beginner-friendly full-stack e-commerce website built for household fresh produce ordering, featuring an interactive **Voice Assistant** for hands-free shopping.

Built as a CSE student project designed for portfolio showcase and GitHub.

---

## 🌟 Key Features

### 🛒 1. Dual Shopping Modes
- **Normal Shopping**: Browse products, search, filter by category (Vegetables / Fruits), adjust quantities, add to cart, and checkout with Cash on Delivery (COD).
- **Simple Voice-Assisted Shopping**: Speak commands naturally to search, add items, remove items, summarize cart, and confirm orders hands-free.

### 🎙️ 2. Simple Voice Assistant
- Powered by the browser's built-in **Web Speech API** (`SpeechRecognition` & `SpeechSynthesis`).
- Supports **English (`en-US`)**, **Hindi (`hi-IN`)**, and **Kannada (`kn-IN`)**.
- Understands natural produce ordering commands like:
  - `"Add 2 kg tomatoes"`
  - `"Add 1 kg potatoes"`
  - `"Add 2 apples"`
  - `"Remove tomatoes"`
  - `"Show my cart"`
  - `"Place my order"`
- Displays spoken response on screen and reads it aloud!
- Includes voice cart summary and voice order confirmation before placing orders.
- Graceful text input fallback if microphone permissions are disabled or unsupported by browser.

### 🥦 3. Farm-Fresh Catalog (18 Sample Products)
- **Vegetables (10)**: Tomato (₹40/kg), Potato (₹35/kg), Onion (₹30/kg), Carrot (₹50/kg), Beans (₹60/kg), Cabbage (₹40/kg), Cauliflower (₹45/pc), Spinach (₹25/bunch), Brinjal (₹35/kg), Capsicum (₹70/kg).
- **Fruits (8)**: Apple (₹120/kg), Banana (₹50/dozen), Orange (₹80/kg), Grapes (₹90/kg), Mango (₹150/kg), Papaya (₹60/pc), Watermelon (₹40/pc), Pomegranate (₹140/kg).

### 💳 4. Real-time Cart, Checkout & Orders
- Real-time cart calculation (Subtotal, Delivery Fee, Total).
- Free delivery on orders over ₹200.
- Simple Checkout with Cash on Delivery (COD).
- **My Orders** page showing order history, item breakdowns, shipping details, and status (`Placed`, `Preparing`, `Delivered`).

### 🔑 5. Simple Authentication
- User Signup & Login with password hashing (`bcryptjs`).
- Session-based guest browsing support.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: In-memory MongoDB store (zero setup required out of the box).
- **Voice Engine**: Browser Web Speech API (`webkitSpeechRecognition` & `speechSynthesis`).

---

## 🛠️ Project Structure

```
smart-hub/
├── backend/
│   ├── db.js          # In-memory produce database store & seeding
│   ├── server.js      # Express API server (Products, Auth, Cart, Orders)
│   └── models/        # Schemas (User, Product, CartItem, Order)
├── frontend/
│   ├── src/
│   │   ├── app/       # Next.js App Router pages (Home, Products, Cart, Checkout, Orders, Auth)
│   │   ├── components/# Navbar, ProductCard, VoiceAssistantModal, FloatingMicButton, Footer
│   │   ├── context/   # AppContext (Cart, Auth, Speech Synthesis & Voice Processing)
│   │   └── lib/       # Voice Command NLP Parser (English, Hindi, Kannada)
└── package.json       # Monorepo scripts
```

---

## ⚡ Quick Start Guide

### 1. Install Dependencies
In the root directory, run:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Run Application
From the root directory:
```bash
npm run dev
```
This command starts both the frontend and backend concurrently:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

---

## 🎤 Sample Voice Commands to Try

| Action | Example Command |
|---|---|
| **Add Product** | `"Add 2 kg tomatoes"`, `"Add 1 kg potatoes"`, `"Add 2 apples"` |
| **Remove Product** | `"Remove tomatoes"`, `"Delete potato"` |
| **Show Cart** | `"Show my cart"`, `"Cart dikhao"` |
| **Place Order** | `"Place my order"`, `"Checkout"` |
| **Voice Confirm** | Say `"Yes"` or `"No"` when prompted by the assistant |

---

## 📜 License
This project is open-source and free to use for learning, demonstration, and academic purposes.
