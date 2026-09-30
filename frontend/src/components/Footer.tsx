'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">🧺</span>
          <span className="text-lg font-bold text-white tracking-wide">FreshBasket</span>
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Fresh fruits and vegetables, made easy. Shop normally or simply tell us what you need with simple voice assistant support.
        </p>
        <div className="flex justify-center space-x-6 text-xs text-slate-400 pt-2 border-t border-slate-800">
          <Link href="/" className="hover:text-emerald-400 transition">Home</Link>
          <Link href="/products" className="hover:text-emerald-400 transition">Products</Link>
          <Link href="/cart" className="hover:text-emerald-400 transition">Cart</Link>
          <Link href="/orders" className="hover:text-emerald-400 transition">My Orders</Link>
        </div>
        <p className="text-xs text-slate-500 pt-2">
          © {new Date().getFullYear()} FreshBasket — Built as a College Student Project.
        </p>
      </div>
    </footer>
  );
};
