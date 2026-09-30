'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Package, Clock, CheckCircle2, ShoppingBag, MapPin } from 'lucide-react';

export default function MyOrdersPage() {
  const { orders, fetchOrders, activeUserId } = useApp();

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Preparing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-2xl">
          📦
        </div>
        <h1 className="text-2xl font-bold text-slate-800">No Orders Yet</h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          You haven't placed any orders yet. Start shopping or order with voice to place your first order!
        </p>
        <Link
          href="/products"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">My Orders</h1>
        <p className="text-sm text-slate-500">Track and view your previous household produce orders</p>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={order._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              
              {/* Order Card Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 text-sm">Order #{order._id.substring(order._id.length - 8)}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Placed on {dateFormatted}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-500 block">Total Amount</span>
                  <span className="text-lg font-extrabold text-emerald-700">₹{order.total}</span>
                </div>
              </div>

              {/* Order Card Items */}
              <div className="p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Items Ordered</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{item.name}</span>
                        <span className="text-slate-500">{item.quantity} {item.unit} x ₹{item.price}</span>
                      </div>
                      <span className="font-bold text-slate-900">₹{item.quantity * item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment info */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Delivering to: <strong>{order.shippingAddress.fullName}</strong>, {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium self-start sm:self-auto">
                    {order.paymentMethod}
                  </span>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
