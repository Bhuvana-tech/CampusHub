'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';
import { parseVoiceCommand, Product, ParsedCommand } from '../lib/voiceParser';

export interface CartItem {
  _id: string;
  quantity: number;
  productId: Product;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
  }>;
  total: number;
  deliveryFee: number;
  status: 'Placed' | 'Preparing' | 'Delivered';
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AppContextType {
  user: User | null;
  guestUserId: string;
  activeUserId: string;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  loadingProducts: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  placeOrder: (shippingAddress: ShippingAddress) => Promise<Order | null>;
  fetchOrders: () => Promise<void>;
  
  // Voice assistant
  isVoiceOpen: boolean;
  setIsVoiceOpen: (open: boolean) => void;
  selectedLanguage: 'en-US' | 'en-IN' | 'hi-IN' | 'kn-IN' | 'te-IN';
  setSelectedLanguage: (lang: 'en-US' | 'en-IN' | 'hi-IN' | 'kn-IN' | 'te-IN') => void;
  voiceTranscript: string;
  setVoiceTranscript: (txt: string) => void;
  assistantMessage: string;
  setAssistantMessage: (msg: string) => void;
  isListening: boolean;
  setIsListening: (l: boolean) => void;
  awaitingOrderConfirmation: boolean;
  processVoiceCommand: (text: string) => Promise<void>;
  speakResponse: (text: string, langOverride?: string) => void;
  isSpeechSupported: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestUserId, setGuestUserId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Voice assistant state
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-US' | 'en-IN' | 'hi-IN' | 'kn-IN' | 'te-IN'>('en-IN');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [assistantMessage, setAssistantMessage] = useState<string>('Hello! Click the mic or type to speak with me.');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [awaitingOrderConfirmation, setAwaitingOrderConfirmation] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);

  // Initialize guest ID & user from local storage
  useEffect(() => {
    let savedGuestId = localStorage.getItem('freshbasket_guest_id');
    if (!savedGuestId) {
      savedGuestId = 'guest_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('freshbasket_guest_id', savedGuestId);
    }
    setGuestUserId(savedGuestId);

    const savedUser = localStorage.getItem('freshbasket_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error loading saved user:', e);
      }
    }

    // Check Speech Recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
      }
    }
  }, []);

  const activeUserId = user ? user._id : guestUserId;

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch cart
  const fetchCart = async () => {
    if (!activeUserId) return;
    try {
      const res = await fetch(`${API_URL}/api/cart?userId=${activeUserId}`);
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    if (!activeUserId) return;
    try {
      const res = await fetch(`${API_URL}/api/orders?userId=${activeUserId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeUserId) {
      fetchCart();
      fetchOrders();
    }
  }, [activeUserId]);

  // Auth Functions
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('freshbasket_user', JSON.stringify(data.user));
        return true;
      } else {
        alert(data.error || 'Login failed');
        return false;
      }
    } catch (err) {
      alert('Network error. Failed to log in.');
      return false;
    }
  };

  const signup = async (name: string, email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('freshbasket_user', JSON.stringify(data.user));
        return true;
      } else {
        alert(data.error || 'Signup failed');
        return false;
      }
    } catch (err) {
      alert('Network error. Failed to create account.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('freshbasket_user');
  };

  // Cart Functions
  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!activeUserId) return;
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, productId, quantity })
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error('Error updating cart:', err);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const clearCart = async () => {
    if (!activeUserId) return;
    try {
      await fetch(`${API_URL}/api/cart/user/${activeUserId}`, { method: 'DELETE' });
      setCart([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  // Order Functions
  const placeOrder = async (shippingAddress: ShippingAddress): Promise<Order | null> => {
    if (!activeUserId || cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
    const deliveryFee = subtotal >= 200 || subtotal === 0 ? 0 : 30;
    const total = subtotal + deliveryFee;

    const items = cart.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      unit: item.productId.unit,
      quantity: item.quantity
    }));

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUserId,
          items,
          total,
          deliveryFee,
          shippingAddress
        })
      });

      if (res.ok) {
        const orderData = await res.json();
        setCart([]);
        await fetchOrders();
        return orderData;
      }
    } catch (err) {
      console.error('Error placing order:', err);
    }
    return null;
  };

  // Speech Synthesis Helper
  const speakResponse = (text: string, langOverride?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // cancel any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langOverride || selectedLanguage;
      utterance.rate = 0.95; // clear student-friendly pace
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
    }
  };

  // Process Voice Command
  const processVoiceCommand = async (commandText: string) => {
    setVoiceTranscript(commandText);
    const parsed: ParsedCommand = parseVoiceCommand(commandText, products);

    let reply = '';
    const lang = selectedLanguage;

    // Check if user is confirming or denying a pending order request
    if (awaitingOrderConfirmation) {
      if (parsed.action === 'CONFIRM_YES') {
        // Default student address for voice order
        const defaultAddr: ShippingAddress = {
          fullName: user ? user.name : 'Voice Customer',
          phone: '9876543210',
          address: 'Hostel Block A, Campus Road',
          city: 'Bengaluru',
          pincode: '560001'
        };

        const createdOrder = await placeOrder(defaultAddr);
        if (createdOrder) {
          if (lang === 'hi-IN') {
            reply = 'Aapka order kamyaabi se place ho gaya hai.';
          } else if (lang === 'kn-IN') {
            reply = 'Namma aadesha saphalaagi sweekarisalaagide.';
          } else if (lang === 'te-IN') {
            reply = 'Mee aadesam saphalamga place cheyabadindi.';
          } else {
            reply = 'Your order has been placed successfully.';
          }
        } else {
          reply = 'Sorry, there was an issue placing your order.';
        }
        setAwaitingOrderConfirmation(false);
        setAssistantMessage(reply);
        speakResponse(reply, lang);
        return;
      } else if (parsed.action === 'CONFIRM_NO') {
        if (lang === 'hi-IN') {
          reply = 'Teek hai, aapka order place nahi kiya gaya hai.';
        } else if (lang === 'kn-IN') {
          reply = 'Aayithu, namma aadesha sweekarisalaagilla.';
        } else if (lang === 'te-IN') {
          reply = 'Sare, mee aadesam place cheyabada ledhu.';
        } else {
          reply = 'Okay, your order has not been placed.';
        }
        setAwaitingOrderConfirmation(false);
        setAssistantMessage(reply);
        speakResponse(reply, lang);
        return;
      }
    }

    // Handle normal actions
    if (parsed.action === 'ADD' && parsed.product) {
      await addToCart(parsed.product._id, parsed.quantity);
      const prodName = parsed.product.name;
      const qty = parsed.quantity;
      const unit = parsed.unit || parsed.product.unit;

      if (lang === 'hi-IN') {
        reply = `${qty} ${unit} ${prodName} aapke cart me add kar diya gaya hai.`;
      } else if (lang === 'kn-IN') {
        reply = `${qty} ${unit} ${prodName} cart ge serisalaagide.`;
      } else if (lang === 'te-IN') {
        reply = `${qty} ${unit} ${prodName} mee cart lo ki cherchabadindi.`;
      } else {
        reply = `Added ${qty} ${unit} of ${prodName} to your cart.`;
      }
    } else if (parsed.action === 'REMOVE' && parsed.product) {
      const itemInCart = cart.find(c => c.productId._id === parsed.product?._id);
      if (itemInCart) {
        await removeFromCart(itemInCart._id);
        if (lang === 'hi-IN') {
          reply = `${parsed.product.name} ko cart se hata diya gaya hai.`;
        } else if (lang === 'kn-IN') {
          reply = `${parsed.product.name} annu cart ninda tegedhaalaagide.`;
        } else if (lang === 'te-IN') {
          reply = `${parsed.product.name} mee cart nundi thesiveyabadindi.`;
        } else {
          reply = `Removed ${parsed.product.name} from your cart.`;
        }
      } else {
        reply = `${parsed.product.name} is not in your cart.`;
      }
    } else if (parsed.action === 'SHOW_CART') {
      if (cart.length === 0) {
        reply = 'Your cart is empty.';
      } else {
        const itemSummaries = cart.map(c => `${c.quantity} ${c.productId.unit} ${c.productId.name}`).join(', ');
        const subtotal = cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
        const delivery = subtotal >= 200 ? 0 : 30;
        const total = subtotal + delivery;

        if (lang === 'hi-IN') {
          reply = `Aapke cart me: ${itemSummaries} hai. Total ₹${total} hai. Kya aap order place karna chahte hain?`;
        } else if (lang === 'kn-IN') {
          reply = `Namma cart nalli: ${itemSummaries} ide. Total ₹${total}. Aadeshawannu confirm maadalu chhistheera?`;
        } else if (lang === 'te-IN') {
          reply = `Mee cart lo: ${itemSummaries} unnai. Total ₹${total}. Aadesam confirm cheyala?`;
        } else {
          reply = `Your cart contains: ${itemSummaries}. Your total is ₹${total}. Would you like to place the order?`;
        }
        setAwaitingOrderConfirmation(true);
      }
    } else if (parsed.action === 'PLACE_ORDER') {
      if (cart.length === 0) {
        reply = 'Your cart is empty. Please add items before placing an order.';
      } else {
        const itemSummaries = cart.map(c => `${c.quantity} ${c.productId.unit} ${c.productId.name}`).join(', ');
        const subtotal = cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
        const delivery = subtotal >= 200 ? 0 : 30;
        const total = subtotal + delivery;

        if (lang === 'hi-IN') {
          reply = `Aapke cart me ${itemSummaries} hai. Total ₹${total} hai. Kya aap order confirm karna chahte hain?`;
        } else if (lang === 'kn-IN') {
          reply = `Namma cart nalli ${itemSummaries} ide. Total ₹${total}. Aadeshawannu confirm maadalu chhistheera?`;
        } else if (lang === 'te-IN') {
          reply = `Mee cart lo ${itemSummaries} unnai. Total ₹${total}. Aadesam confirm cheyala?`;
        } else {
          reply = `Your cart contains: ${itemSummaries}. Your total is ₹${total}. Would you like to confirm your order?`;
        }
        setAwaitingOrderConfirmation(true);
      }
    } else {
      if (lang === 'hi-IN') {
        reply = 'Kshama kijiye, samajh nahi aaya. Kripya kahein: "2 kg tomatoes".';
      } else if (lang === 'kn-IN') {
        reply = 'Kshamisi, arthavaagilla. "2 kg tomatoes" endhu heli.';
      } else if (lang === 'te-IN') {
        reply = 'Kshaminchandi, artham kaledhu. "2 kg tomatoes" ani cheppandi.';
      } else {
        reply = "Sorry, I didn't understand. Please try saying something like '2 kg tomatoes'.";
      }
    }

    setAssistantMessage(reply);
    speakResponse(reply, lang);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        guestUserId,
        activeUserId,
        products,
        cart,
        orders,
        loadingProducts,
        login,
        signup,
        logout,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        fetchOrders,
        isVoiceOpen,
        setIsVoiceOpen,
        selectedLanguage,
        setSelectedLanguage,
        voiceTranscript,
        setVoiceTranscript,
        assistantMessage,
        setAssistantMessage,
        isListening,
        setIsListening,
        awaitingOrderConfirmation,
        processVoiceCommand,
        speakResponse,
        isSpeechSupported
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
