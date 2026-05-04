"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, ChevronRight, UserPlus, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';

type EventData = {
  _id: string;
  title: string;
  date: string;
  location?: string;
  description: string;
  attendees: any[];
};

type Connection = {
  _id: string;
  name: string;
  branch: string;
};

// ── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({
  event,
  currentUser,
  onClose,
}: {
  event: EventData;
  currentUser: { _id: string };
  onClose: () => void;
}) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [inviting, setInviting] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/users/${currentUser._id}`);
        setConnections(res.data.connections || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, [currentUser._id]);

  const handleInvite = async (targetId: string) => {
    setInviting(targetId);
    try {
      await axios.post(
        `http://localhost:5001/api/events/${event._id}/invite/${targetId}`,
        { userId: currentUser._id }
      );
      setInvited(prev => new Set([...prev, targetId]));
    } catch (err) {
      console.error(err);
      alert('Failed to send invite. Please try again.');
    } finally {
      setInviting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Invite to Event</h3>
            <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[260px]">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Connections list */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading connections…</span>
            </div>
          ) : connections.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No connections yet</p>
              <p className="text-xs mt-1">Connect with people in Skill Connect first!</p>
            </div>
          ) : (
            connections.map(conn => {
              const isInvited = invited.has(conn._id);
              const isInviting = inviting === conn._id;

              return (
                <div
                  key={conn._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                      <Image
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${conn.name}`}
                        alt={conn.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{conn.name}</p>
                      <p className="text-xs text-slate-400">{conn.branch}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => !isInvited && handleInvite(conn._id)}
                    disabled={isInvited || isInviting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isInvited
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
                        : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-500/30'
                    }`}
                  >
                    {isInviting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isInvited ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Invited
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Invite
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {connections.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 text-center">
              {invited.size > 0 ? `✅ ${invited.size} invite${invited.size > 1 ? 's' : ''} sent!` : 'Click Invite to send a notification to your connections'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Event Radar Page ─────────────────────────────────────────────────────
export default function EventRadar() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [inviteEvent, setInviteEvent] = useState<EventData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [registerSuccess, setRegisterSuccess] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const stored = localStorage.getItem('user');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, [fetchEvents]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return isNaN(d.getTime())
      ? dateString
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleRegister = async (eventId: string) => {
    if (!currentUser) return alert('Please log in first.');
    try {
      const res = await axios.post(`http://localhost:5001/api/events/${eventId}/register`, {
        userId: currentUser._id,
      });
      setEvents(events.map(e => e._id === eventId ? { ...e, attendees: res.data.attendees } : e));
      if (selectedEvent?._id === eventId) {
        setSelectedEvent({ ...selectedEvent, attendees: res.data.attendees });
      }
      setRegisterSuccess('Successfully registered! 🎉');
      setTimeout(() => setRegisterSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to register');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Event Radar 📅</h1>
        <p className="text-slate-500">Discover what&apos;s happening around campus.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event, i) => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedEvent(event)}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-600 to-indigo-600 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg">
                  Event
                </span>
                <div className="flex -space-x-2">
                  {event.attendees.slice(0, 3).map(a => (
                    <div key={a._id} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 relative overflow-hidden">
                      <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${a.name}`} fill alt={a.name} />
                    </div>
                  ))}
                  {event.attendees.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      +{event.attendees.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 group-hover:text-brand-600 transition-colors">{event.title}</h2>

              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" /> {formatDate(event.date)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-xs text-slate-400">{event.attendees.length} going</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="h-32 bg-gradient-to-r from-brand-600 to-indigo-600" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider rounded-lg mb-4 inline-block">
                  Event
                </span>
                <h2 className="text-3xl font-bold mb-4">{selectedEvent.title}</h2>

                <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <Clock className="w-5 h-5" />
                    </div>
                    {formatDate(selectedEvent.date)}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold mb-2">About the Event</h3>
                  <p className="text-slate-500 leading-relaxed">{selectedEvent.description}</p>
                </div>

                {/* Success toast */}
                <AnimatePresence>
                  {registerSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {registerSuccess}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {selectedEvent.attendees.slice(0, 5).map(a => (
                        <img key={a._id} src={`https://api.dicebear.com/7.x/notionists/svg?seed=${a.name}`} className="w-10 h-10 rounded-full border-2 border-slate-50 dark:border-slate-800 bg-slate-200" alt={a.name} />
                      ))}
                    </div>
                    <div>
                      <p className="font-bold">{selectedEvent.attendees.length} Attendees</p>
                      <p className="text-xs text-slate-400">Registered</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {/* Register button */}
                    {currentUser && selectedEvent.attendees.find(a => a._id === currentUser._id) ? (
                      <button disabled className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Registered
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(selectedEvent._id)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
                      >
                        <UserPlus className="w-4 h-4" /> Register Now
                      </button>
                    )}

                    {/* ✅ Fixed Invite button */}
                    <button
                      onClick={() => {
                        if (!currentUser) return alert('Please log in first.');
                        setInviteEvent(selectedEvent);
                      }}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Send className="w-4 h-4" /> Invite Friends
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {inviteEvent && currentUser && (
          <InviteModal
            event={inviteEvent}
            currentUser={currentUser}
            onClose={() => setInviteEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
