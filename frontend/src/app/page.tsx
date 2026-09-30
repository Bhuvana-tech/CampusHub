'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Mic, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { products, setIsVoiceOpen, loadingProducts } = useApp();

  // Pick top 6 popular products for homepage preview
  const popularProducts = products.slice(0, 6);

  return (
    <div className="space-y-12 pb-16">
      
      {/* HERO SECTION */}
      <section className="bg-emerald-50 border-b border-emerald-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Household Grocery Delivery
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Fresh fruits &amp; vegetables, made easy.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Shop normally or simply tell us what you need.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setIsVoiceOpen(true)}
              className="w-full sm:w-auto bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-xs"
            >
              <Mic className="w-5 h-5 text-emerald-600" />
              <span>🎤 Order with Voice</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3 SIMPLE BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          
          <div className="flex items-start space-x-3 p-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Fresh everyday</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sourced daily from local markets for top quality.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Reasonable prices</h3>
              <p className="text-xs text-slate-500 mt-0.5">Fair, everyday household pricing without markup.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Easy ordering</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click to buy or speak directly to our voice assistant.</p>
            </div>
          </div>

        </div>
      </section>

      {/* POPULAR PRODUCE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Popular Produce</h2>
            <p className="text-xs text-slate-500">Freshly picked household favorites</p>
          </div>
          <Link
            href="/products"
            className="text-emerald-700 hover:text-emerald-800 font-bold text-sm flex items-center space-x-1"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading fresh produce...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {popularProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
