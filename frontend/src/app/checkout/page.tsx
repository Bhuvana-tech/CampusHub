'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { ShippingAddress } from '../../context/AppContext';
import { CheckCircle2, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, user, placeOrder } = useApp();
  const router = useRouter();

  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: user ? user.name : '',
    phone: '',
    address: '',
    city: 'Bengaluru',
    pincode: '560001'
  });

  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
  const deliveryFee = subtotal >= 200 || subtotal === 0 ? 0 : 30;
  const total = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      alert('Please fill in all shipping details.');
      return;
    }

    setSubmitting(true);
    const created = await placeOrder(formData);
    setSubmitting(false);

    if (created) {
      router.push('/orders');
    } else {
      alert('Failed to place order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h1>
        <p className="text-sm text-slate-500">Please add items to your cart before checking out.</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
        >
          Go to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Checkout</h1>
        <p className="text-sm text-slate-500">Provide delivery address to complete your household order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Delivery Address</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Street Address / House No. *</label>
              <textarea
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. #42, 3rd Main Road, Indiranagar"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

          </div>

          {/* Payment Method Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span className="font-bold text-sm text-emerald-900">Payment Method</span>
            </div>
            <div className="bg-white border border-emerald-300 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💵</span>
                <span className="font-bold text-sm text-slate-800">Cash on Delivery (COD)</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Selected</span>
            </div>
            <p className="text-xs text-slate-500">Pay conveniently with cash when your fresh produce arrives at your doorstep.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-xl text-base transition shadow-sm flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Place Order (₹{total})</span>
              </>
            )}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs sticky top-20">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Items ({cart.length})
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <div>
                  <span className="font-bold text-slate-800">{item.productId.name}</span>
                  <span className="text-slate-500 block">{item.quantity} {item.productId.unit} x ₹{item.productId.price}</span>
                </div>
                <span className="font-bold text-slate-900">₹{item.quantity * item.productId.price}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-800">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="text-emerald-700">₹{total}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
