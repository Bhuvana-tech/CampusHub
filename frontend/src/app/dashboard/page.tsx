"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Calendar, Users, ArrowRight, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    cafeteriaStatus: 'Loading...',
    upcomingEvents: 0,
    activeUsers: 0
  });

  const [userName, setUserName] = useState('Student');
  const [userId, setUserId] = useState<string | null>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    let currentId = null;
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      setUserName(parsed.name);
      setUserId(parsed._id);
      currentId = parsed._id;
    }
    
    // Fetch live data from backend
    const fetchDashboardData = async () => {
      try {
        const promises = [
          axios.get('http://localhost:5001/api/cafeteria/status'),
          axios.get('http://localhost:5001/api/events'),
          axios.get('http://localhost:5001/api/users')
        ];

        if (currentId) {
          promises.push(axios.get(`http://localhost:5001/api/users/${currentId}`));
        }

        const [cafeteriaRes, eventsRes, usersRes, currentUserRes] = await Promise.all(promises);

        const status = cafeteriaRes.data;
        let cStatus = 'Moderate';
        if (status) {
          const isCrowded = status.crowded > status.moderate && status.crowded > status.notCrowded;
          const isModerate = status.moderate >= status.notCrowded && status.moderate >= status.crowded;
          cStatus = isCrowded ? "Very Crowded" : isModerate ? "Moderate" : "Not Crowded";
        }

        setStats({
          cafeteriaStatus: cStatus,
          upcomingEvents: eventsRes.data.length,
          activeUsers: usersRes.data.length
        });

        if (currentUserRes) {
          setConnections(currentUserRes.data.connections || []);
          setRequests(currentUserRes.data.connectionRequests || []);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAcceptRequest = async (requesterId: string) => {
    if (!userId) return;
    try {
      await axios.post(`http://localhost:5001/api/users/${userId}/accept/${requesterId}`);
      // Optimistically update UI
      const acceptedUser = requests.find(r => r._id === requesterId);
      if (acceptedUser) {
        setConnections([...connections, acceptedUser]);
        setRequests(requests.filter(r => r._id !== requesterId));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to accept request');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {userName} 👋</h1>
        <p className="text-slate-500">Here's what's happening on campus today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Cafeteria Status</p>
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.cafeteriaStatus}</h3>
            </div>
          </div>
          <Link href="/cafeteria" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View Live Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Upcoming Events</p>
              <h3 className="text-xl font-bold">{stats.upcomingEvents} This Week</h3>
            </div>
          </div>
          <Link href="/events" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Discover Events <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Skill Connect</p>
              <h3 className="text-xl font-bold">{stats.activeUsers} Active Users</h3>
            </div>
          </div>
          <Link href="/skill-connect" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Find Teammates <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="relative bg-gradient-to-br from-brand-600 to-indigo-600 rounded-[2rem] p-8 text-white overflow-hidden shadow-[var(--shadow-glow)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-brand-100 mb-6 bg-white/20 w-fit px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
              <Star className="w-4 h-4 fill-current" /> Today's Special
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Grilled Chicken Salad</h2>
            <p className="text-brand-100 mb-8 max-w-sm">High protein, low carb. Perfect for your post-workout meal.</p>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex-1">
                <p className="text-brand-100 text-xs mb-1">Protein</p>
                <p className="font-bold text-xl">35g</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex-1">
                <p className="text-brand-100 text-xs mb-1">Carbs</p>
                <p className="font-bold text-xl">15g</p>
              </div>
              <div className="bg-white text-brand-600 rounded-2xl p-4 flex-1 text-center font-bold text-xl shadow-lg">
                $8.50
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-soft)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Trending Notes</h2>
            <Link href="/notes" className="text-sm font-medium text-brand-600">View all</Link>
          </div>
          <div className="space-y-4 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold group-hover:text-brand-600 transition-colors">Advanced React Patterns</h4>
                  <p className="text-sm text-slate-500">CS301 • 4.8 Rating</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Connections Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-soft)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">My Connections</h2>
            <Link href="/skill-connect" className="text-sm font-medium text-brand-600">Find more</Link>
          </div>
          <div className="space-y-4 flex-1">
            {connections.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No connections yet. Head to Skill Connect!</p>
            ) : (
              connections.map((conn) => (
                <div key={conn._id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-100 to-indigo-100 p-[2px]">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${conn.name}`} alt={conn.name} className="w-full h-full rounded-full bg-white object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold">{conn.name}</h4>
                    <p className="text-xs text-slate-500">{conn.branch}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-[var(--shadow-soft)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Pending Requests</h2>
            <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs font-bold">{requests.length}</span>
          </div>
          <div className="space-y-4 flex-1">
            {requests.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No pending requests right now.</p>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${req.name}`} alt={req.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100" />
                    <div>
                      <h4 className="font-bold text-sm">{req.name}</h4>
                      <p className="text-xs text-slate-500">{req.branch}</p>
                    </div>
                  </div>
                  <button onClick={() => handleAcceptRequest(req._id)} className="bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md hover:bg-brand-700 transition-colors">Accept</button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
