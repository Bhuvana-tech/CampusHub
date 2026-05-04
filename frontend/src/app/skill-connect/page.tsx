"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserPlus, Calendar, Sparkles } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';

type UserData = {
  _id: string;
  name: string;
  branch: string;
  skills: string[];
  interests: string[];
};

export default function SkillConnect() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const stored = localStorage.getItem('user');
    if (stored) {
      setCurrentUserId(JSON.parse(stored)._id);
    }
  }, [fetchUsers]);

  const handleConnect = async (targetId: string) => {
    if (!currentUserId) return alert("Please log in first!");
    try {
      await axios.post(`http://localhost:5001/api/users/${currentUserId}/request/${targetId}`);
      alert("Connection request sent!");
      // Optionally re-fetch to update status if we returned it, but for simplicity just alert.
    } catch (err) {
      console.error(err);
      alert("Failed to send request.");
    }
  };

  const allSkills = Array.from(new Set(users.flatMap(u => u.skills)));

  const filteredUsers = users.filter(user => {
    if (user._id === currentUserId) return false; // Hide current user
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = activeFilter ? user.skills.includes(activeFilter) : true;
    return matchesSearch && matchesFilter;
  });

  // Suggest first two users for demo
  const suggestedUsers = users.slice(0, 2);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Skill Connect 🤝</h1>
          <p className="text-slate-500">Discover and connect with students based on skills.</p>
        </div>
      </div>

      {/* Suggested Connections */}
      {suggestedUsers.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" /> Suggested for you
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedUsers.map((user, i) => (
              <motion.div 
                key={user._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-brand-600 to-indigo-600 rounded-3xl p-6 text-white shadow-[var(--shadow-glow)] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white p-[2px] shadow-lg overflow-hidden relative">
                    <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} alt={user.name} fill className="rounded-full bg-slate-100 object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-brand-100 text-sm">{user.branch}</p>
                  </div>
                </div>
                <div className="space-y-4 relative z-10">
                  <div>
                    <p className="text-xs text-brand-200 uppercase tracking-wider font-bold mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleConnect(user._id)} className="flex-1 bg-white text-brand-600 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-50 transition-colors">Connect</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Discovery Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="text-xl font-bold">Discover People</h2>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search names or skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveFilter(null)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!activeFilter ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}>All</button>
          {allSkills.map(skill => (
            <button key={skill} onClick={() => setActiveFilter(skill)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === skill ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}>{skill}</button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, i) => (
            <motion.div key={user._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-soft)] hover:border-brand-200 dark:hover:border-brand-800 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-100 to-indigo-100 p-1 relative overflow-hidden">
                  <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} alt={user.name} fill className="rounded-full bg-white object-cover" />
                </div>
                <div>
                  <h3 className="font-bold group-hover:text-brand-600 transition-colors">{user.name}</h3>
                  <p className="text-slate-500 text-sm">{user.branch}</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex flex-wrap gap-1.5">
                  {user.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => handleConnect(user._id)} className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-sm font-semibold hover:bg-brand-50 hover:text-brand-600 transition-colors"><UserPlus className="w-4 h-4" /> Connect</button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-sm font-semibold hover:bg-brand-50 hover:text-brand-600 transition-colors"><Calendar className="w-4 h-4" /> Invite</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
