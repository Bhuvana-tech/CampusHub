'use client';

import { Sidebar } from '@/components/sidebar';
import { PageLayout } from '@/components/page-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, Upload, ChevronDown, Star, X, Award, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/user-context';

const semesterSubjects: Record<string, string[]> = {
  'Sem 1': ['Physics', 'Mathematics', 'C Programming', 'Civil', 'Cyber Security'],
  'Sem 2': ['Chemistry', 'Mathematics', 'Electronics', 'Python', 'English'],
  'Sem 3': ['Mathematics', 'OOPs', 'OS', 'DDCO', 'DSA'],
  'Sem 4': ['ADA', 'Mathematics', 'Microcontroller', 'Java', 'DBMS', 'BIO'],
  'Sem 5': ['Computer Networks', 'Software Engineering', 'Machine Learning', 'Web Development', 'Cloud Computing'],
  'Sem 6': ['Artificial Intelligence', 'Big Data', 'IoT', 'Blockchain', 'Project Work'],
};

interface Note {
  id: number;
  subject: string;
  semester: string;
  size: string;
  uploader: string;
  uploaderSemester: string;
  ratings: number[];
}

const initialNotes: Note[] = [
  { id: 1, subject: 'Physics', semester: 'Sem 1', size: '2.4 MB', uploader: 'Rahul K', uploaderSemester: '3rd', ratings: [5, 4, 5, 4, 5, 4] },
  { id: 2, subject: 'Mathematics', semester: 'Sem 1', size: '1.8 MB', uploader: 'Priya S', uploaderSemester: '2nd', ratings: [4, 4, 3, 4] },
  { id: 3, subject: 'C Programming', semester: 'Sem 1', size: '3.2 MB', uploader: 'Arun M', uploaderSemester: '4th', ratings: [5, 5, 5, 4, 5, 5, 4] },
  { id: 4, subject: 'Civil', semester: 'Sem 1', size: '1.5 MB', uploader: 'Sneha R', uploaderSemester: '2nd', ratings: [3, 4, 3] },
  { id: 5, subject: 'Cyber Security', semester: 'Sem 1', size: '2.1 MB', uploader: 'Vikram J', uploaderSemester: '5th', ratings: [4, 5, 4, 4, 5] },
  { id: 6, subject: 'Chemistry', semester: 'Sem 2', size: '1.9 MB', uploader: 'Deepa N', uploaderSemester: '3rd', ratings: [4, 4, 4, 3] },
  { id: 7, subject: 'Mathematics', semester: 'Sem 2', size: '2.0 MB', uploader: 'Karthik P', uploaderSemester: '4th', ratings: [5, 4, 5, 5, 4] },
  { id: 8, subject: 'Electronics', semester: 'Sem 2', size: '2.5 MB', uploader: 'Meera V', uploaderSemester: '3rd', ratings: [3, 4, 3, 4] },
  { id: 9, subject: 'Python', semester: 'Sem 2', size: '1.7 MB', uploader: 'Arjun B', uploaderSemester: '5th', ratings: [5, 5, 4, 5, 5, 4, 5] },
  { id: 10, subject: 'English', semester: 'Sem 2', size: '1.2 MB', uploader: 'Lakshmi T', uploaderSemester: '2nd', ratings: [3, 3, 4] },
  { id: 11, subject: 'Mathematics', semester: 'Sem 3', size: '2.3 MB', uploader: 'Suresh K', uploaderSemester: '5th', ratings: [4, 5, 4, 4] },
  { id: 12, subject: 'OOPs', semester: 'Sem 3', size: '2.8 MB', uploader: 'Ananya G', uploaderSemester: '4th', ratings: [5, 5, 5, 4, 5] },
  { id: 13, subject: 'OS', semester: 'Sem 3', size: '3.1 MB', uploader: 'Ravi S', uploaderSemester: '6th', ratings: [4, 4, 5, 4, 4, 5] },
  { id: 14, subject: 'DDCO', semester: 'Sem 3', size: '2.6 MB', uploader: 'Pooja M', uploaderSemester: '4th', ratings: [3, 4, 4, 3, 4] },
  { id: 15, subject: 'DSA', semester: 'Sem 3', size: '3.5 MB', uploader: 'Naveen R', uploaderSemester: '5th', ratings: [5, 5, 5, 5, 4, 5, 5] },
  { id: 16, subject: 'ADA', semester: 'Sem 4', size: '2.9 MB', uploader: 'Divya K', uploaderSemester: '6th', ratings: [4, 5, 4, 5, 4] },
  { id: 17, subject: 'Mathematics', semester: 'Sem 4', size: '2.2 MB', uploader: 'Mohan P', uploaderSemester: '5th', ratings: [4, 4, 3, 4] },
  { id: 18, subject: 'Microcontroller', semester: 'Sem 4', size: '2.7 MB', uploader: 'Kavitha S', uploaderSemester: '6th', ratings: [5, 4, 5, 5, 4, 5] },
  { id: 19, subject: 'Java', semester: 'Sem 4', size: '3.0 MB', uploader: 'Sanjay V', uploaderSemester: '5th', ratings: [4, 4, 5, 4, 4] },
  { id: 20, subject: 'DBMS', semester: 'Sem 4', size: '3.3 MB', uploader: 'Rekha N', uploaderSemester: '6th', ratings: [5, 5, 4, 5, 5, 4, 5] },
  { id: 21, subject: 'BIO', semester: 'Sem 4', size: '1.6 MB', uploader: 'Ajay T', uploaderSemester: '4th', ratings: [3, 3, 4, 3] },
];

function getAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export default function NotesPage() {
  const { user } = useUser();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Sem 4');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'top'>('all');
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [ratedNotes, setRatedNotes] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const semesters = Object.keys(semesterSubjects);
  const subjects = ['All', ...(semesterSubjects[selectedSemester] || [])];

  let filteredNotes = notes.filter(note => {
    const matchesSearch = note.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = note.semester === selectedSemester;
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    return matchesSearch && matchesSemester && matchesSubject;
  });

  if (activeTab === 'top') {
    filteredNotes = [...filteredNotes].sort((a, b) => getAverageRating(b.ratings) - getAverageRating(a.ratings));
  }

  const topRatedIds = [...notes]
    .filter(n => n.semester === selectedSemester)
    .sort((a, b) => getAverageRating(b.ratings) - getAverageRating(a.ratings))
    .slice(0, 3)
    .map(n => n.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && user) {
      const fileName = e.target.files[0].name;
      setUploadedFile(fileName);
      setToast('Note uploaded successfully!');
      setTimeout(() => setUploadedFile(null), 3000);
    }
  };

  const submitRating = () => {
    if (!previewNote || userRating === 0) return;
    
    setNotes(prev => prev.map(note => {
      if (note.id === previewNote.id) {
        return { ...note, ratings: [...note.ratings, userRating] };
      }
      return note;
    }));
    
    setRatedNotes(prev => [...prev, previewNote.id]);
    setToast('Thanks for rating!');
    setPreviewNote(null);
    setUserRating(0);
  };

  const StarRating = ({ rating, interactive = false }: { rating: number; interactive?: boolean }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setUserRating(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              size={interactive ? 20 : 14}
              className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <Sidebar />
      <PageLayout title="Notes & Resources" subtitle="Share and discover study materials">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <Input
                placeholder="Search notes..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload size={16} />
                {uploadedFile ? `Uploaded` : 'Upload Notes'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Semester</label>
              <button
                onClick={() => setShowSemesterDropdown(!showSemesterDropdown)}
                className="flex items-center justify-between gap-2 px-4 py-2 border border-border rounded-lg bg-background min-w-[140px]"
              >
                <span className="font-medium">{selectedSemester}</span>
                <ChevronDown size={16} className={`transition-transform ${showSemesterDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showSemesterDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[140px]">
                  {semesters.map(semester => (
                    <button
                      key={semester}
                      onClick={() => {
                        setSelectedSemester(semester);
                        setSelectedSubject('All');
                        setShowSemesterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg text-sm ${
                        selectedSemester === semester ? 'bg-primary text-white hover:bg-primary' : ''
                      }`}
                    >
                      {semester}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All Notes
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'top' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Top Rated
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Subject</label>
            <div className="flex gap-2 flex-wrap">
              {subjects.map(subject => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSubject(subject)}
                  className="rounded-full"
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => {
              const avgRating = getAverageRating(note.ratings);
              const isTopRated = topRatedIds.includes(note.id);
              
              return (
                <Card 
                  key={note.id} 
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => {
                    setPreviewNote(note);
                    setUserRating(0);
                  }}
                >
                  {isTopRated && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium border border-yellow-200">
                      <Award size={12} />
                      Top Rated
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground text-lg">{note.subject}</h3>
                        <div className="flex items-center gap-1">
                          <StarRating rating={Math.round(avgRating)} />
                          <span className="text-sm text-muted-foreground ml-1">{avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {note.semester} | {note.size} | by {note.uploader} ({note.uploaderSemester} Sem)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewNote(note);
                          setUserRating(0);
                        }}
                      >
                        <Eye size={14} />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={14} />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No notes found. Try adjusting your filters.</p>
            </Card>
          )}
        </div>

        {/* Preview Modal */}
        {previewNote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{previewNote.subject}</h2>
                  <p className="text-sm text-muted-foreground">
                    {previewNote.semester} | Uploaded by {previewNote.uploader}
                  </p>
                </div>
                <button onClick={() => setPreviewNote(null)} className="p-1 hover:bg-muted rounded">
                  <X size={20} />
                </button>
              </div>

              {/* Preview placeholder */}
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center mb-6">
                <p className="text-muted-foreground">PDF Preview</p>
              </div>

              {/* Rating Section */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Current Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={Math.round(getAverageRating(previewNote.ratings))} />
                      <span className="text-sm text-muted-foreground">
                        {getAverageRating(previewNote.ratings).toFixed(1)} ({previewNote.ratings.length} ratings)
                      </span>
                    </div>
                  </div>
                </div>

                {ratedNotes.includes(previewNote.id) ? (
                  <p className="text-sm text-primary">You rated this note!</p>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Rate this note</p>
                    <div className="flex items-center gap-4">
                      <StarRating rating={userRating} interactive />
                      <Button 
                        size="sm" 
                        disabled={userRating === 0}
                        onClick={submitRating}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1 gap-2">
                  <Download size={16} />
                  Download
                </Button>
                <Button className="flex-1" onClick={() => setPreviewNote(null)}>
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm">{toast}</span>
          </div>
        )}
      </PageLayout>
    </>
  );
}
