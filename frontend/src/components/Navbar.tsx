'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Mic, User, LogOut, Menu, X, ShoppingCart } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, cart, logout, setIsVoiceOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
              🧺
            </div>
            <div>
              <span className="text-xl font-bold text-emerald-800 tracking-tight">FreshBasket</span>
              <span className="hidden sm:inline-block text-xs block text-emerald-600 font-medium">Household Produce</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-slate-700 hover:text-emerald-700 font-medium text-sm transition">
              Home
            </Link>
            <Link href="/products" className="text-slate-700 hover:text-emerald-700 font-medium text-sm transition">
              Products
            </Link>
            <Link href="/orders" className="text-slate-700 hover:text-emerald-700 font-medium text-sm transition">
              My Orders
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Voice Assistant Button */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full font-medium text-sm transition shadow-sm"
            >
              <Mic className="w-4 h-4 text-emerald-100" />
              <span>Order with Voice</span>
            </button>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-2 rounded-lg font-medium text-sm transition"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-700" />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth status */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <span className="text-xs font-medium text-slate-600">Hi, <strong className="text-slate-800">{user.name.split(' ')[0]}</strong></span>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-1.5 text-slate-500 hover:text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  href="/login"
                  className="text-slate-700 hover:text-emerald-700 px-3 py-1.5 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="bg-emerald-600 text-white p-2 rounded-full shadow-sm"
              aria-label="Order with voice"
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <Link href="/cart" className="relative p-2 text-slate-700">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-medium border-b border-slate-100"
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-medium border-b border-slate-100"
          >
            Products
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-medium border-b border-slate-100"
          >
            My Orders
          </Link>
          
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsVoiceOpen(true);
            }}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm"
          >
            <Mic className="w-4 h-4" />
            <span>Order with Voice</span>
          </button>

          {user ? (
            <div className="pt-2 flex items-center justify-between">
              <span className="text-sm text-slate-600">Logged in as <strong>{user.name}</strong></span>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-red-600 text-sm font-medium"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 bg-slate-800 text-white rounded-lg text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
