"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface UserData {
  _id: string;
  name: string;
  branch: string;
}

interface NotificationData {
  _id: string;
  content: string;
  isRead: boolean;
  relatedUser?: {
    name: string;
  };
}

export default function TopNavbar() {
  const [user, setUser] = useState<UserData>({ _id: '', name: 'Student', branch: '' });
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { socket } = useSocket();

  const fetchNotifications = useCallback(async (userId: string) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      fetchNotifications(parsed._id);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_notification', (notif: NotificationData) => {
      setNotifications(prev => [notif, ...prev]);
    });
    return () => { socket.off('new_notification'); };
  }, [socket]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`http://localhost:5001/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markAsRead(n._id)));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-20 w-full glass sticky top-0 z-30 px-8 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search for people, notes, or events..."
          className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">

        {/* Bell button */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setShowDropdown(prev => !prev)}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown — fixed so it escapes any stacking context */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 max-h-[420px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
                style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-brand-500 text-white rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                      <Bell className="w-8 h-8 opacity-30" />
                      <p className="text-sm">No notifications yet.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => markAsRead(notif._id)}
                        className={`p-3 rounded-xl cursor-pointer flex gap-3 transition-colors ${
                          notif.isRead
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800'
                            : 'bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 border border-brand-100 dark:border-brand-900/40'
                        }`}
                      >
                        <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${notif.isRead ? 'text-slate-300 dark:text-slate-600' : 'text-brand-500'}`} />
                        <div className="min-w-0">
                          <p className={`text-sm leading-snug ${notif.isRead ? 'text-slate-500 dark:text-slate-400' : 'font-medium text-slate-800 dark:text-slate-100'}`}>
                            {notif.content}
                          </p>
                          {notif.relatedUser && (
                            <p className="text-xs text-slate-400 mt-0.5">From: {notif.relatedUser.name}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-400 p-[2px]">
            <Image
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full rounded-full bg-white dark:bg-slate-900 object-cover"
            />
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{user.branch}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
