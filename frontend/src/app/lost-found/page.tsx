"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, MapPin, Phone, Search, Plus, X } from 'lucide-react';
import axios from 'axios';

type Item = {
  _id: string;
  type: 'lost' | 'found';
  itemName: string;
  description: string;
  location: string;
  contact: string;
};

export default function LostAndFound() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'lost', itemName: '', description: '', location: '', contact: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/lost-found');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/lost-found', newItem);
      setIsModalOpen(false);
      fetchItems();
      setNewItem({ type: 'lost', itemName: '', description: '', location: '', contact: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ? true : item.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Lost & Found 🔍</h1>
          <p className="text-slate-500">Help reunite students with their belongings.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20">
          <Plus className="w-4 h-4" /> Report Item
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-[var(--shadow-soft)] border border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-100 dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>All Items</button>
          <button onClick={() => setFilter('lost')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'lost' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' : 'text-slate-500 hover:bg-slate-50'}`}>Lost</button>
          <button onClick={() => setFilter('found')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'found' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'text-slate-500 hover:bg-slate-50'}`}>Found</button>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, i) => (
          <motion.div 
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 border transition-all hover:-translate-y-1 shadow-[var(--shadow-soft)] ${item.type === 'lost' ? 'border-red-100 dark:border-red-900/50' : 'border-emerald-100 dark:border-emerald-900/50'}`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none ${item.type === 'lost' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${item.type === 'lost' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                  {item.type}
                </span>
              </div>

              <h3 className="font-bold text-xl mb-2">{item.itemName}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">{item.description}</p>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" /> {item.location}
                </div>
                {item.contact && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400" /> {item.contact}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"><X className="w-4 h-4" /></button>
              <h2 className="text-2xl font-bold mb-6">Report Item</h2>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <label className={`flex-1 p-3 rounded-xl border text-center cursor-pointer transition-colors ${newItem.type === 'lost' ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'border-slate-200'}`}>
                    <input type="radio" name="type" value="lost" checked={newItem.type === 'lost'} onChange={(e) => setNewItem({...newItem, type: 'lost'})} className="hidden" />
                    I Lost Something
                  </label>
                  <label className={`flex-1 p-3 rounded-xl border text-center cursor-pointer transition-colors ${newItem.type === 'found' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'border-slate-200'}`}>
                    <input type="radio" name="type" value="found" checked={newItem.type === 'found'} onChange={(e) => setNewItem({...newItem, type: 'found'})} className="hidden" />
                    I Found Something
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Item Name</label>
                  <input type="text" required value={newItem.itemName} onChange={e=>setNewItem({...newItem, itemName: e.target.value})} className="w-full border rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800" placeholder="e.g., Blue Hydro Flask" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <textarea required value={newItem.description} onChange={e=>setNewItem({...newItem, description: e.target.value})} className="w-full border rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800" placeholder="Any identifying marks?" rows={3}></textarea>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Location</label>
                  <input type="text" required value={newItem.location} onChange={e=>setNewItem({...newItem, location: e.target.value})} className="w-full border rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800" placeholder="Where was it lost/found?" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Contact Info (Optional)</label>
                  <input type="text" value={newItem.contact} onChange={e=>setNewItem({...newItem, contact: e.target.value})} className="w-full border rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800" placeholder="Email or phone number" />
                </div>
                
                <button type="submit" className="w-full bg-brand-600 text-white rounded-xl py-3 font-bold mt-4 hover:bg-brand-700">Submit Report</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
