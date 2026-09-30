'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../lib/voiceParser';
import { Plus, Minus, ShoppingCart, Check } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>(product.image);

  const handleAddToCart = async () => {
    await addToCart(product._id, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between">
      <div>
        {/* Product Image & Category Tag */}
        <div className="relative bg-slate-50 p-4 flex items-center justify-center border-b border-slate-100 h-48">
          <span className="absolute top-3 left-3 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {product.category}
          </span>
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => {
              const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f0fdf4" rx="16"/><circle cx="200" cy="130" r="70" fill="#ffffff"/><text x="200" y="150" font-size="72" text-anchor="middle" dominant-baseline="middle">🧺</text><text x="200" y="245" font-family="sans-serif" font-size="22" font-weight="700" fill="#1e293b" text-anchor="middle">${product.name}</text></svg>`;
              setImgSrc(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
            }}
            className="h-36 w-full object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-slate-800 text-lg leading-snug">{product.name}</h3>
          <div className="flex items-baseline space-x-1 text-emerald-700 font-extrabold text-xl">
            <span>₹{product.price}</span>
            <span className="text-xs text-slate-500 font-normal">/ {product.unit}</span>
          </div>
        </div>
      </div>

      {/* Quantity & Add to Cart Controls */}
      <div className="p-4 pt-0 space-y-3">
        {/* Quantity selector */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-1">
          <span className="text-xs font-semibold text-slate-600 pl-2">Qty:</span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 bg-white rounded border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-sm text-slate-800 w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 bg-white rounded border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 transition shadow-xs ${
            addedToast
              ? 'bg-emerald-800 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {addedToast ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
