'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Mic } from 'lucide-react';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, setIsVoiceOpen } = useApp();

  const subtotal = cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
  const deliveryFee = subtotal >= 200 || subtotal === 0 ? 0 : 30;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-3xl">
          🧺
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Looks like you haven't added any fresh produce to your basket yet.
        </p>
        <div className="flex justify-center space-x-3 pt-4">
          <Link
            href="/products"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
          >
            Browse Products
          </Link>
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center space-x-1"
          >
            <Mic className="w-4 h-4" />
            <span>Order with Voice</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Your Cart</h1>
          <p className="text-sm text-slate-500">{cart.length} item(s) in your basket</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const itemTotal = item.productId.price * item.quantity;
            return (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
              >
                {/* Image + Title */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-slate-50 rounded-lg p-2 flex items-center justify-center shrink-0 border border-slate-100">
                    <img
                      src={item.productId.image}
                      alt={item.productId.name}
                      className="h-12 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{item.productId.name}</h3>
                    <p className="text-xs text-slate-500">
                      ₹{item.productId.price} / {item.productId.unit}
                    </p>
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center justify-between w-full sm:w-auto space-x-6">
                  <div className="flex items-center space-x-2 border border-slate-300 rounded-lg p-1 bg-slate-50">
                    <button
                      onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                      className="w-7 h-7 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm text-slate-800 w-8 text-center">
                      {item.quantity} {item.productId.unit}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                      className="w-7 h-7 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total price & delete */}
                  <div className="flex items-center space-x-4">
                    <span className="font-extrabold text-slate-900 text-base">
                      ₹{itemTotal}
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs sticky top-20">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">₹{subtotal}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="text-emerald-600 font-bold">FREE</span>
              ) : (
                <span className="font-bold text-slate-800">₹{deliveryFee}</span>
              )}
            </div>

            {subtotal < 200 && subtotal > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                Add ₹{200 - subtotal} more for FREE delivery!
              </p>
            )}

            <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span className="text-emerald-700 text-xl">₹{total}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-xs"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
