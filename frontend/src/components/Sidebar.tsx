"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Coffee, Users, BookOpen, Calendar, Settings, Search as SearchIcon, ShieldAlert, ShieldCheck, Box, LogOut, MessageSquare, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Cafeteria', href: '/cafeteria', icon: Coffee },
  { name: 'Skill Connect', href: '/skill-connect', icon: Users },
  { name: 'Notes Hub', href: '/notes', icon: BookOpen },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Lost & Found', href: '/lost-found', icon: Box },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'Admin Panel', href: '/admin', icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="w-64 h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-20 hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-500">
          Smart Hub
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="block">
              <div className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'text-brand-700 dark:text-brand-100 font-medium' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-brand-50 dark:bg-brand-900/30 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl w-full transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl w-full transition-colors mt-1">
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
