'use client';

import { Sidebar } from '@/components/sidebar';
import { PageLayout } from '@/components/page-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const mockMenuItems = [
  { id: 1, name: 'Paneer Fried Rice', price: 80, veg: true },
  { id: 2, name: 'Chicken Noodles', price: 90, veg: false },
  { id: 3, name: 'Schezwan Fried Rice', price: 70, veg: true },
  { id: 4, name: 'Egg Noodles', price: 65, veg: false },
  { id: 5, name: 'Masala Dosa', price: 50, veg: true },
  { id: 6, name: 'Chocolate Milkshake', price: 40, veg: true },
  { id: 7, name: 'Coke', price: 30, veg: true },
  { id: 8, name: 'Vada Sambar', price: 30, veg: true },
  { id: 9, name: 'Filter Coffee', price: 20, veg: true },
  { id: 10, name: 'Chicken Biryani', price: 120, veg: false },
  { id: 11, name: 'Paneer Butter Masala', price: 100, veg: true },
  { id: 12, name: 'Samosa (2 pcs)', price: 25, veg: true },
];

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CrowdReport {
  level: 'empty' | 'moderate' | 'packed';
  timestamp: number;
}

const initialReports: CrowdReport[] = [
  { level: 'moderate', timestamp: Date.now() - 300000 },
  { level: 'moderate', timestamp: Date.now() - 600000 },
  { level: 'packed', timestamp: Date.now() - 900000 },
  { level: 'moderate', timestamp: Date.now() - 1200000 },
];

function getCrowdLevel(reports: CrowdReport[]): 'low' | 'medium' | 'high' {
  const recentReports = reports.filter(r => Date.now() - r.timestamp < 1800000);
  if (recentReports.length === 0) return 'medium';
  
  const scores = { empty: 1, moderate: 2, packed: 3 };
  const avgScore = recentReports.reduce((sum, r) => sum + scores[r.level], 0) / recentReports.length;
  
  if (avgScore < 1.5) return 'low';
  if (avgScore < 2.5) return 'medium';
  return 'high';
}

function getWaitTime(level: 'low' | 'medium' | 'high'): string {
  if (level === 'low') return '~5 min';
  if (level === 'medium') return '~12 min';
  return '~20+ min';
}

export default function CanteenPage() {
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reports, setReports] = useState<CrowdReport[]>(initialReports);
  const [showReportForm, setShowReportForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [userReported, setUserReported] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const crowdLevel = getCrowdLevel(reports);
  const waitTime = getWaitTime(crowdLevel);
  const recentReportsCount = reports.filter(r => Date.now() - r.timestamp < 1800000).length;

  const addToOrder = (item: typeof mockMenuItems[0]) => {
    setOrder(prev => {
      const existing = prev.find(o => o.id === item.id);
      if (existing) {
        return prev.map(o => o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
    } else {
      setOrder(prev => prev.map(o => o.id === itemId ? { ...o, quantity } : o));
    }
  };

  const removeFromOrder = (itemId: number) => {
    setOrder(prev => prev.filter(o => o.id !== itemId));
  };

  const submitCrowdReport = (level: 'empty' | 'moderate' | 'packed') => {
    setReports(prev => [{ level, timestamp: Date.now() }, ...prev.slice(0, 19)]);
    setShowReportForm(false);
    setUserReported(true);
    setToast('Thanks! Your input helps other students');
  };

  const total = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const getReadyTime = () => {
    const baseMinutes = crowdLevel === 'low' ? 10 : crowdLevel === 'medium' ? 18 : 28;
    const readyDate = new Date(Date.now() + baseMinutes * 60000);
    return readyDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const crowdConfig = {
    low: { label: 'Low', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', borderColor: 'border-green-200' },
    medium: { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    high: { label: 'High', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', borderColor: 'border-red-200' },
  };

  const config = crowdConfig[crowdLevel];

  return (
    <>
      <Sidebar />
      <PageLayout title="Food Court" subtitle="Pre-order and skip the queue">
        {/* Crowd Status Section */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${config.bgLight} ${config.textColor} border ${config.borderColor}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                <span className="font-medium text-sm">Crowd: {config.label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock size={14} />
                <span>Wait: {waitTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {recentReportsCount} student{recentReportsCount !== 1 ? 's' : ''} reported in the last 30 mins
                {userReported && <span className="text-primary ml-1">(incl. you)</span>}
              </span>
              
              {showReportForm ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => submitCrowdReport('empty')}
                    className="py-1.5 px-3 text-xs font-medium rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    Empty
                  </button>
                  <button
                    onClick={() => submitCrowdReport('moderate')}
                    className="py-1.5 px-3 text-xs font-medium rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                  >
                    Moderate
                  </button>
                  <button
                    onClick={() => submitCrowdReport('packed')}
                    className="py-1.5 px-3 text-xs font-medium rounded-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Packed
                  </button>
                  <button
                    onClick={() => setShowReportForm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowReportForm(true)}>
                  Report crowd level
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Grid */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-lg text-foreground mb-4">Today&apos;s Menu</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mockMenuItems.map(item => (
                <Card
                  key={item.id}
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30"
                  onClick={() => addToOrder(item)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-foreground line-clamp-2 flex-1 pr-2">{item.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs shrink-0 ${item.veg ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                    >
                      {item.veg ? 'Veg' : 'Non-Veg'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">₹{item.price}</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4 h-fit">
              <h3 className="font-semibold text-lg text-foreground mb-4">Order Summary</h3>

              {order.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {order.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 bg-muted rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}
                            className="p-1 hover:bg-white rounded"
                          >
                            <Minus size={14} className="text-muted-foreground" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}
                            className="p-1 hover:bg-white rounded"
                          >
                            <Plus size={14} className="text-muted-foreground" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromOrder(item.id); }}
                            className="p-1 hover:bg-white rounded ml-1"
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3 mb-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">₹{total}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setShowConfirmation(true)}
                  >
                    Confirm Pre-Order
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No items added. Click on menu items to add to order.
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={24} className="text-green-500" />
                <h2 className="text-xl font-bold">Order Confirmed</h2>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-muted-foreground">Your order has been placed successfully.</p>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Your order will be ready at</p>
                  <p className="text-2xl font-bold text-primary">{getReadyTime()}</p>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Total paid: </span>
                  <span className="font-bold text-foreground">₹{total}</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setShowConfirmation(false);
                  setOrder([]);
                }}
              >
                Done
              </Button>
            </Card>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-sm">{toast}</span>
          </div>
        )}
      </PageLayout>
    </>
  );
}
