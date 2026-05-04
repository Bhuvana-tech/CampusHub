"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Coffee, BookOpen, Calendar, Trash2, Plus } from 'lucide-react';
import axios from 'axios';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'cafeteria' | 'notes' | 'events'>('cafeteria');
  
  // Data States
  const [menu, setMenu] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  // Form States
  const [newMenu, setNewMenu] = useState({ itemName: '', price: 0, protein: 0, carbs: 0, isSpecial: false });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const menuRes = await axios.get('http://localhost:5001/api/cafeteria/menu');
      setMenu(menuRes.data);
      const notesRes = await axios.get('http://localhost:5001/api/notes');
      setNotes(notesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('http://localhost:5001/api/cafeteria/menu', newMenu);
    setNewMenu({ itemName: '', price: 0, protein: 0, carbs: 0, isSpecial: false });
    fetchData();
  };

  const handleDeleteMenu = async (id: string) => {
    await axios.delete(`http://localhost:5001/api/cafeteria/menu/${id}`);
    fetchData();
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('http://localhost:5001/api/events', newEvent);
    setNewEvent({ title: '', date: '', description: '' });
    alert('Event added successfully!');
  };

  const handleDeleteNote = async (id: string) => {
    await axios.delete(`http://localhost:5001/api/notes/${id}`);
    fetchData();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
          <ShieldCheck className="w-8 h-8 text-brand-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Admin Panel</h1>
          <p className="text-slate-500">Manage campus resources and content.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button onClick={() => setActiveTab('cafeteria')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'cafeteria' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          <Coffee className="w-4 h-4 inline mr-2" /> Cafeteria
        </button>
        <button onClick={() => setActiveTab('events')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'events' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          <Calendar className="w-4 h-4 inline mr-2" /> Events
        </button>
        <button onClick={() => setActiveTab('notes')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'notes' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          <BookOpen className="w-4 h-4 inline mr-2" /> Notes Hub
        </button>
      </div>

      <div className="pt-4">
        {/* Cafeteria Admin */}
        {activeTab === 'cafeteria' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[var(--shadow-soft)] border border-slate-100">
              <h2 className="text-xl font-bold mb-6">Add Menu Item</h2>
              <form onSubmit={handleAddMenu} className="space-y-4">
                <input type="text" required placeholder="Item Name" value={newMenu.itemName} onChange={e => setNewMenu({...newMenu, itemName: e.target.value})} className="w-full border dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" required placeholder="Price ($)" value={newMenu.price || ''} onChange={e => setNewMenu({...newMenu, price: parseFloat(e.target.value)})} className="w-full border dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800" />
                  <input type="number" required placeholder="Protein (g)" value={newMenu.protein || ''} onChange={e => setNewMenu({...newMenu, protein: parseInt(e.target.value)})} className="w-full border dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800" />
                  <input type="number" required placeholder="Carbs (g)" value={newMenu.carbs || ''} onChange={e => setNewMenu({...newMenu, carbs: parseInt(e.target.value)})} className="w-full border dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800" />
                </div>
                <label className="flex items-center gap-2 font-medium text-sm">
                  <input type="checkbox" checked={newMenu.isSpecial} onChange={e => setNewMenu({...newMenu, isSpecial: e.target.checked})} className="w-4 h-4" />
                  Mark as Today's Special
                </label>
                <button type="submit" className="w-full bg-brand-600 text-white rounded-xl py-3 font-bold hover:bg-brand-700">Add Item</button>
              </form>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Current Menu</h2>
              <div className="space-y-3">
                {menu.map(item => (
                  <div key={item._id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100">
                    <div>
                      <h4 className="font-bold flex items-center gap-2">
                        {item.itemName} 
                        {item.isSpecial && <span className="px-2 py-0.5 text-[10px] bg-brand-100 text-brand-700 rounded-full">SPECIAL</span>}
                      </h4>
                      <p className="text-xs text-slate-500">${item.price}</p>
                    </div>
                    <button onClick={() => handleDeleteMenu(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Events Admin */}
        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[var(--shadow-soft)] border border-slate-100">
              <h2 className="text-xl font-bold mb-6">Create Event</h2>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <input type="text" required placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full border dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800" />
                <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full border dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800" />
                <textarea required placeholder="Description" rows={3} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full border dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800"></textarea>
                <button type="submit" className="w-full bg-brand-600 text-white rounded-xl py-3 font-bold hover:bg-brand-700">Publish Event</button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Notes Admin */}
        {activeTab === 'notes' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <h2 className="text-xl font-bold mb-4">Manage Uploaded Notes</h2>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
               {notes.map(note => (
                 <div key={note._id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
                   <div>
                     <h4 className="font-bold">{note.title}</h4>
                     <p className="text-xs text-slate-500">{note.uploader} • {note.subject}</p>
                   </div>
                   <button onClick={() => handleDeleteNote(note._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Note">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               ))}
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
