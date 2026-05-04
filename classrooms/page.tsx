'use client';

import { Sidebar } from '@/components/sidebar';
import { PageLayout } from '@/components/page-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@/lib/user-context';

interface CrowdReport {
  level: 'low' | 'medium' | 'high';
  timestamp: number;
  userId?: string;
}

interface Classroom {
  id: number;
  name: string;
  building: string;
  capacity: number;
  facilities: string[];
  reports: CrowdReport[];
}

const facilitiesOptions = ['Projector', 'Lab', 'AC', 'Whiteboard'];

const initialClassrooms: Classroom[] = [
  { id: 1, name: 'Room 101', building: 'BSN BLOCK', capacity: 50, facilities: ['Projector', 'AC', 'Whiteboard'], reports: [
    { level: 'low', timestamp: Date.now() - 300000 },
    { level: 'low', timestamp: Date.now() - 600000 },
    { level: 'medium', timestamp: Date.now() - 900000 },
  ]},
  { id: 2, name: 'Room 205', building: 'ACADEMIC BLOCK', capacity: 40, facilities: ['Projector', 'Whiteboard'], reports: [
    { level: 'medium', timestamp: Date.now() - 180000 },
    { level: 'medium', timestamp: Date.now() - 420000 },
  ]},
  { id: 3, name: 'Lab 511a', building: 'C V RAMAN BLOCK', capacity: 35, facilities: ['Lab', 'AC', 'Projector'], reports: [
    { level: 'high', timestamp: Date.now() - 120000 },
    { level: 'high', timestamp: Date.now() - 240000 },
    { level: 'high', timestamp: Date.now() - 360000 },
  ]},
  { id: 4, name: 'BSN Auditorium', building: 'BSN BLOCK', capacity: 200, facilities: ['Projector', 'AC'], reports: [
    { level: 'medium', timestamp: Date.now() - 480000 },
    { level: 'high', timestamp: Date.now() - 660000 },
  ]},
  { id: 5, name: 'Room 102', building: 'ACADEMIC BLOCK', capacity: 45, facilities: ['Whiteboard'], reports: [
    { level: 'high', timestamp: Date.now() - 90000 },
    { level: 'high', timestamp: Date.now() - 300000 },
  ]},
  { id: 6, name: 'Lab 511b', building: 'C V RAMAN BLOCK', capacity: 25, facilities: ['Lab', 'AC'], reports: []},
  { id: 7, name: 'Room 501', building: 'BSN BLOCK', capacity: 60, facilities: ['Projector', 'AC', 'Whiteboard'], reports: [
    { level: 'low', timestamp: Date.now() - 600000 },
  ]},
  { id: 8, name: 'Room 305', building: 'ACADEMIC BLOCK', capacity: 55, facilities: ['Projector', 'Whiteboard'], reports: [
    { level: 'medium', timestamp: Date.now() - 720000 },
    { level: 'low', timestamp: Date.now() - 900000 },
  ]},
  { id: 9, name: 'Room 402', building: 'BSN BLOCK', capacity: 45, facilities: ['AC', 'Whiteboard'], reports: [
    { level: 'low', timestamp: Date.now() - 1200000 },
    { level: 'low', timestamp: Date.now() - 1500000 },
  ]},
];

function getCrowdLevel(reports: CrowdReport[]): 'low' | 'medium' | 'high' | 'unknown' {
  const recentReports = reports.filter(r => Date.now() - r.timestamp < 1800000);
  if (recentReports.length === 0) return 'unknown';
  
  const scores = { low: 1, medium: 2, high: 3 };
  const avgScore = recentReports.reduce((sum, r) => sum + scores[r.level], 0) / recentReports.length;
  
  if (avgScore < 1.5) return 'low';
  if (avgScore < 2.5) return 'medium';
  return 'high';
}

function getTimeAgo(timestamp: number): string {
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function ClassroomsPage() {
  const { user } = useUser();
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [reportingRoomId, setReportingRoomId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [userReportedRooms, setUserReportedRooms] = useState<number[]>([]);

  const buildings = ['All', ...new Set(classrooms.map(room => room.building))];

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredRooms = classrooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuilding === 'All' || room.building === selectedBuilding;
    const matchesFacilities = selectedFacilities.length === 0 || 
      selectedFacilities.every(f => room.facilities.includes(f));
    return matchesSearch && matchesBuilding && matchesFacilities;
  });

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev =>
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const submitReport = (roomId: number, level: 'low' | 'medium' | 'high') => {
    setClassrooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          reports: [
            { level, timestamp: Date.now(), userId: user?.name },
            ...room.reports.slice(0, 9)
          ]
        };
      }
      return room;
    }));
    setReportingRoomId(null);
    setUserReportedRooms(prev => [...prev, roomId]);
    setToast('Thanks! Your input helps other students');
  };

  const crowdConfig = {
    low: { label: 'Low', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
    medium: { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
    high: { label: 'High', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
    unknown: { label: 'No data', color: 'bg-gray-400', textColor: 'text-gray-600', bgLight: 'bg-gray-50' },
  };

  return (
    <>
      <Sidebar />
      <PageLayout title="Classroom Availability" subtitle="Crowd-sourced room occupancy">
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <Input
              placeholder="Search classrooms..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Building</label>
            <div className="flex gap-2 flex-wrap">
              {buildings.map(building => (
                <Button
                  key={building}
                  variant={selectedBuilding === building ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBuilding(building)}
                  className="rounded-full"
                >
                  {building}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Facilities</label>
            <div className="flex gap-2 flex-wrap">
              {facilitiesOptions.map(facility => (
                <Button
                  key={facility}
                  variant={selectedFacilities.includes(facility) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFacility(facility)}
                  className="rounded-full"
                >
                  {facility}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.length > 0 ? (
            filteredRooms.map(room => {
              const crowdLevel = getCrowdLevel(room.reports);
              const config = crowdConfig[crowdLevel];
              const recentReports = room.reports.filter(r => Date.now() - r.timestamp < 1800000);
              const lastUpdate = room.reports[0]?.timestamp;
              const userReported = userReportedRooms.includes(room.id);

              return (
                <Card key={room.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">{room.building}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${config.bgLight} ${config.textColor}`}>
                      <span className={`w-2 h-2 rounded-full ${config.color}`} />
                      {config.label}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users size={14} />
                      <span>Capacity: {room.capacity}</span>
                    </div>
                    {recentReports.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {recentReports.length} student{recentReports.length !== 1 ? 's' : ''} reported
                      </p>
                    )}
                    {lastUpdate && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>Updated {getTimeAgo(lastUpdate)}</span>
                        {userReported && <span className="text-primary">(you reported)</span>}
                      </div>
                    )}
                  </div>

                  {room.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {room.facilities.map(f => (
                        <Badge key={f} variant="secondary" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {reportingRoomId === room.id ? (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">How crowded is it?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitReport(room.id, 'low')}
                          className="flex-1 py-1.5 px-2 text-xs font-medium rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        >
                          Few people
                        </button>
                        <button
                          onClick={() => submitReport(room.id, 'medium')}
                          className="flex-1 py-1.5 px-2 text-xs font-medium rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                        >
                          Half full
                        </button>
                        <button
                          onClick={() => submitReport(room.id, 'high')}
                          className="flex-1 py-1.5 px-2 text-xs font-medium rounded-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Packed
                        </button>
                      </div>
                      <button 
                        onClick={() => setReportingRoomId(null)}
                        className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setReportingRoomId(room.id)}
                    >
                      Report Occupancy
                    </Button>
                  )}
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full p-8 text-center text-muted-foreground">
              <p>No classrooms found. Try adjusting your filters.</p>
            </Card>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-sm">{toast}</span>
          </div>
        )}
      </PageLayout>
    </>
  );
}
