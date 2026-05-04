'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Home, MapPin, Users, Calendar, AlertCircle, UtensilsCrossed, LogOut, Edit2, ChevronDown } from 'lucide-react';
import { useUser } from '@/lib/user-context';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Notes', href: '/notes', icon: BookOpen },
  { name: 'Classrooms', href: '/classrooms', icon: MapPin },
  { name: 'Lost & Found', href: '/lost-found', icon: AlertCircle },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Team Finder', href: '/team-finder', icon: Users },
  { name: 'Food Court', href: '/canteen', icon: UtensilsCrossed },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoggedIn } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (!isLoggedIn && pathname !== '/login') {
      router.push('/login');
    }
  }, [isLoggedIn, pathname, router]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r border-border p-6 hidden md:flex md:flex-col fixed left-0 top-0 h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">CampusHub</h1>
        <p className="text-sm text-muted-foreground">Your campus companion</p>
      </div>

      <nav className="space-y-1 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="pt-4 border-t border-border relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.semester} Sem | {user.branch}</p>
          </div>
          <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
        </button>

        {showProfileMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-border rounded-lg shadow-lg p-3 space-y-3">
            <div className="pb-2 border-b border-border">
              <p className="font-medium text-sm text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.semester} Semester | {user.branch}</p>
              {user.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                      {skill}
                    </span>
                  ))}
                  {user.skills.length > 4 && (
                    <span className="text-xs text-muted-foreground">+{user.skills.length - 4} more</span>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                setShowProfileMenu(false);
                router.push('/login');
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-muted rounded transition-colors"
            >
              <Edit2 size={14} />
              Edit Profile
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
