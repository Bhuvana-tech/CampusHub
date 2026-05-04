"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Flame, Zap, Clock, Users, ChevronRight, Settings2 } from 'lucide-react';
import axios from 'axios';

type MenuType = {
  _id: string;
  itemName: string;
  price: number;
  protein: number;
  carbs: number;
  isSpecial: boolean;
};

type StatusType = {
  notCrowded: number;
  moderate: number;
  crowded: number;
  reactions: { type: string; count: number }[];
};

export default function Cafeteria() {
  const [menu, setMenu] = useState<MenuType[]>([]);
  const [status, setStatus] = useState<StatusType | null>(null);
  const [voted, setVoted] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    // In a real app, these would fetch from the actual API endpoint
    // We mock the backend response here for demo smoothness, or fetch if available
    setMenu([
      { _id: '1', itemName: 'Grilled Chicken Salad', price: 8.50, protein: 35, carbs: 15, isSpecial: true },
      { _id: '2', itemName: 'Vegan Buddha Bowl', price: 9.00, protein: 15, carbs: 45, isSpecial: false },
      { _id: '3', itemName: 'Classic Cheeseburger', price: 6.50, protein: 25, carbs: 40, isSpecial: false },
    ]);
    
    setStatus({
      notCrowded: 15,
      moderate: 24,
      crowded: 8,
      reactions: [
        { type: 'fast', count: 12 },
        { type: 'rush', count: 4 },
        { type: 'queue', count: 6 }
      ]
    });
  }, []);

  const handleVote = (type: 'notCrowded' | 'moderate' | 'crowded') => {
    if (voted || !status) return;
    setStatus({
      ...status,
      [type]: status[type] + 1
    });
    setVoted(true);
  };

  const handleReaction = (type: 'queue' | 'fast' | 'rush') => {
    if (!status) return;
    const newReactions = status.reactions.map(r => 
      r.type === type ? { ...r, count: r.count + 1 } : r
    );
    setStatus({ ...status, reactions: newReactions });
  };

  if (!status) return null;

  const totalVotes = status.notCrowded + status.moderate + status.crowded;
  const isCrowded = status.crowded > status.moderate && status.crowded > status.notCrowded;
  const isModerate = status.moderate >= status.notCrowded && status.moderate >= status.crowded;
  const currentStatusText = isCrowded ? "Very Crowded" : isModerate ? "Moderate" : "Not Crowded";
  const statusColor = isCrowded ? "text-red-500 bg-red-100" : isModerate ? "text-orange-500 bg-orange-100" : "text-emerald-500 bg-emerald-100";
  const borderGlow = isCrowded ? "shadow-[0_0_20px_rgba(239,68,68,0.2)]" : isModerate ? "shadow-[0_0_20px_rgba(249,115,22,0.2)]" : "shadow-[0_0_20px_rgba(16,185,129,0.2)]";

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Smart Cafeteria 🍽️</h1>
          <p className="text-slate-500">Live crowd status and menu.</p>
        </div>
        <button 
          onClick={() => setIsAdminOpen(!isAdminOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Settings2 className="w-4 h-4" /> Admin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Crowd Status Panel */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 ${borderGlow} transition-all duration-500`}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor.split(' ')[1]}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${statusColor.split(' ')[1]}`}></span>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Live Status</span>
            </div>
            
            <h2 className={`text-4xl font-bold mb-2 ${statusColor.split(' ')[0]}`}>{currentStatusText}</h2>
            <p className="text-slate-500 mb-8">{totalVotes} students reported in the last 15 mins</p>

            <div className="space-y-3">
              <p className="text-sm font-medium mb-4">How's the crowd right now?</p>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleVote('notCrowded')}
                  disabled={voted}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors border ${voted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'} border-emerald-200 text-emerald-700 dark:text-emerald-400`}
                >
                  Chill
                  <span className="block text-xs opacity-70">{status.notCrowded}</span>
                </button>
                <button 
                  onClick={() => handleVote('moderate')}
                  disabled={voted}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors border ${voted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50 dark:hover:bg-orange-900/20'} border-orange-200 text-orange-700 dark:text-orange-400`}
                >
                  Moderate
                  <span className="block text-xs opacity-70">{status.moderate}</span>
                </button>
                <button 
                  onClick={() => handleVote('crowded')}
                  disabled={voted}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors border ${voted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 dark:hover:bg-red-900/20'} border-red-200 text-red-700 dark:text-red-400`}
                >
                  Crowded
                  <span className="block text-xs opacity-70">{status.crowded}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Live Reactions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-soft)]"
          >
            <h3 className="font-bold mb-4">Live Reactions</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleReaction('queue')} className="px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:border-brand-500 transition-colors">
                😫 <span className="text-sm font-medium">Long queue</span> 
                <span className="bg-slate-200 dark:bg-slate-700 text-xs px-2 py-0.5 rounded-full">{status.reactions.find(r=>r.type==='queue')?.count}</span>
              </button>
              <button onClick={() => handleReaction('fast')} className="px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:border-brand-500 transition-colors">
                ⚡ <span className="text-sm font-medium">Fast service</span> 
                <span className="bg-slate-200 dark:bg-slate-700 text-xs px-2 py-0.5 rounded-full">{status.reactions.find(r=>r.type==='fast')?.count}</span>
              </button>
              <button onClick={() => handleReaction('rush')} className="px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:border-brand-500 transition-colors">
                🔥 <span className="text-sm font-medium">Rush hour</span> 
                <span className="bg-slate-200 dark:bg-slate-700 text-xs px-2 py-0.5 rounded-full">{status.reactions.find(r=>r.type==='rush')?.count}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Menu Panel */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold">Today's Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menu.map((item, i) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className={`relative rounded-[2rem] p-6 ${item.isSpecial ? 'bg-gradient-to-br from-brand-600 to-indigo-600 text-white shadow-[var(--shadow-glow)] md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-6' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-soft)]'}`}
              >
                {item.isSpecial && (
                  <>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>
                  </>
                )}
                
                <div className="relative z-10 flex-1">
                  {item.isSpecial && (
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase mb-3 text-brand-100">
                      ★ Today's Special
                    </span>
                  )}
                  <h3 className={`text-xl font-bold mb-1 ${!item.isSpecial && 'text-slate-900 dark:text-white'}`}>{item.itemName}</h3>
                  <p className={`text-sm ${item.isSpecial ? 'text-brand-100' : 'text-slate-500'} mb-4`}>Nutritious and delicious option for your day.</p>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${item.isSpecial ? 'bg-white/10 border border-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      Protein: {item.protein}g
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${item.isSpecial ? 'bg-white/10 border border-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      Carbs: {item.carbs}g
                    </span>
                  </div>
                </div>
                
                <div className={`relative z-10 text-right ${item.isSpecial && 'md:text-center md:bg-white/10 md:backdrop-blur-md md:rounded-[2rem] md:p-6 md:min-w-[160px] md:border md:border-white/20'}`}>
                  <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${item.isSpecial ? 'text-brand-200' : 'text-slate-400'}`}>Price</p>
                  <p className="text-3xl font-bold">${item.price.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Admin Panel Mock */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 mt-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings2 className="w-5 h-5" /> Admin Controls (Demo)</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">
                  + Add Menu Item
                </button>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-slate-300 transition-colors">
                  Manage Specials
                </button>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-slate-300 transition-colors">
                  Reset Crowd Status
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
