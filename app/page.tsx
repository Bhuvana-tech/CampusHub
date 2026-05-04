'use client';

import { Sidebar } from '@/components/sidebar';
import { PageLayout } from '@/components/page-layout';
import { Card } from '@/components/ui/card';
import { BookOpen, MapPin, AlertCircle, Calendar, Users, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/lib/user-context';

const modules = [
  { name: 'Notes & Resources', icon: BookOpen, href: '/notes', desc: 'Share and find study materials' },
  { name: 'Classrooms', icon: MapPin, href: '/classrooms', desc: 'Check room availability' },
  { name: 'Lost & Found', icon: AlertCircle, href: '/lost-found', desc: 'Report or find lost items' },
  { name: 'Events', icon: Calendar, href: '/events', desc: 'Campus events and activities' },
  { name: 'Team Finder', icon: Users, href: '/team-finder', desc: 'Find project teammates' },
  { name: 'Food Court', icon: UtensilsCrossed, href: '/canteen', desc: 'Pre-order your meals' },
];

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <>
      <Sidebar />
      <PageLayout title="Home" subtitle="Your campus at a glance">
        {/* Welcome Section */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome back, {user.name.split(' ')[0]}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {user.semester} Semester
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                {user.branch}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <Card className="p-5 cursor-pointer hover:shadow-md transition-all bg-white hover:border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                      <Icon size={22} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-0.5">{module.name}</h3>
                      <p className="text-sm text-muted-foreground">{module.desc}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </PageLayout>
    </>
  );
}
