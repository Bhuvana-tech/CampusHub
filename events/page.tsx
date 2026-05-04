'use client';

import { Sidebar } from '@/components/sidebar';
import { PageLayout } from '@/components/page-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

const mockEvents = [
  { id: 1, title: 'Hackathon 2026', category: 'Hackathon', date: 'May 10-12, 2026', time: '9:00 AM', location: 'Tech Block', attendees: 350, description: 'Build innovative projects in 48 hours' },
  { id: 2, title: 'Data Science Workshop', category: 'Workshop', date: 'May 8, 2026', time: '2:00 PM', location: 'Lab 511', attendees: 120, description: 'Learn ML fundamentals and data analysis' },
  { id: 3, title: 'Tech Club Launch Event', category: 'Clubs', date: 'May 15, 2026', time: '4:00 PM', location: 'Auditorium', attendees: 200, description: 'Join our new Tech & Innovation club' },
];

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [attendingEvents, setAttendingEvents] = useState<number[]>([]);

  const categories = ['All', ...new Set(mockEvents.map(event => event.category))];

  const filteredEvents = selectedCategory === 'All'
    ? mockEvents
    : mockEvents.filter(event => event.category === selectedCategory);

  const toggleAttending = (eventId: number) => {
    setAttendingEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <>
      <Sidebar />
      <PageLayout title="Campus Events" subtitle="Discover what's happening on campus">
        <div className="mb-6 flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <Card
                key={event.id}
                className="p-6 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                      <Badge variant="secondary">{event.category}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users size={16} />
                        <span>{event.attendees} people attending</span>
                      </div>
                      <p className="text-sm text-foreground mt-2">{event.description}</p>
                    </div>
                  </div>

                  <Button
                    variant={attendingEvents.includes(event.id) ? 'default' : 'outline'}
                    onClick={() => toggleAttending(event.id)}
                  >
                    {attendingEvents.includes(event.id) ? 'Attending' : 'Attend'}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No events found in this category.</p>
            </Card>
          )}
        </div>
      </PageLayout>
    </>
  );
}
