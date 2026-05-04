"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Star, Search, Upload, ShieldCheck, Eye, TrendingUp, X } from 'lucide-react';
import axios from 'axios';

export default function NotesHub() {
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeBranch, setActiveBranch] = useState('All');
  
  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({ title: '', subject: '', tags: [] as string[] });

  const branches = ['All', 'CS', 'IT', 'ME', 'EC'];
  const availableTags = ['Highly Trusted', 'Exam Focused', 'Most Viewed'];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/notes');
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', uploadData.title);
    formData.append('subject', uploadData.subject);
    formData.append('uploader', 'Current Student'); // In a real app, from auth session
    formData.append('tags', JSON.stringify(uploadData.tags));

    try {
      await axios.post('http://localhost:5001/api/notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsModalOpen(false);
      setFile(null);
      setUploadData({ title: '', subject: '', tags: [] });
      fetchNotes();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    }
  };

  const toggleTag = (tag: string) => {
    if (uploadData.tags.includes(tag)) {
      setUploadData({ ...uploadData, tags: uploadData.tags.filter(t => t !== tag) });
    } else {
      setUploadData({ ...uploadData, tags: [...uploadData.tags, tag] });
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || note.subject.toLowerCase().includes(search.toLowerCase());
    return matchesSearch; // Ignoring branch filter for now unless we add branch to note schema
  });

  const getTagStyle = (tag: string) => {
    switch(tag) {
      case 'Highly Trusted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Exam Focused': return 'bg-red-100 text-red-700 border-red-200';
      case 'Most Viewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTagIcon = (tag: string) => {
    switch(tag) {
      case 'Highly Trusted': return <ShieldCheck className="w-3 h-3" />;
      case 'Exam Focused': return <TrendingUp className="w-3 h-3" />;
      case 'Most Viewed': return <Eye className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Smart Notes Hub 📚</h1>
          <p className="text-slate-500">Discover and upload high-quality academic notes.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20">
          <Upload className="w-4 h-4" /> Upload Notes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-[var(--shadow-soft)] border border-slate-100">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {branches.map(branch => (
            <button key={branch} onClick={() => setActiveBranch(branch)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeBranch === branch ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              {branch === 'All' ? 'All Branches' : branch}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search subject or title..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note, i) => {
          const isTrusted = note.tags.includes('Highly Trusted');
          return (
            <motion.div key={note._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`relative bg-white rounded-[2rem] p-6 border transition-all hover:-translate-y-1 group ${isTrusted ? 'border-brand-200 shadow-[0_8px_30px_rgb(139,92,246,0.12)]' : 'border-slate-100 shadow-[var(--shadow-soft)]'}`}>
              {isTrusted && <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>}
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isTrusted ? 'bg-gradient-to-br from-brand-500 to-indigo-500 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 text-slate-500'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {note.tags.map((tag: string) => (
                      <span key={tag} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getTagStyle(tag)}`}>
                        {getTagIcon(tag)} {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <p className="text-xs font-bold text-brand-600 mb-1">{note.subject}</p>
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-brand-600 transition-colors">{note.title}</h3>
                  <p className="text-sm text-slate-500">By {note.uploader}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {note.rating || 0}</div>
                  </div>
                  
                  {/* Download using the backend static URL */}
                  <a href={`http://localhost:5001${note.fileUrl}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"><X className="w-4 h-4" /></button>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Upload className="w-5 h-5 text-brand-600" /> Upload Notes</h2>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <input type="text" required value={uploadData.title} onChange={e=>setUploadData({...uploadData, title: e.target.value})} className="w-full border dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800" placeholder="e.g., React Hooks Guide" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Subject</label>
                  <input type="text" required value={uploadData.subject} onChange={e=>setUploadData({...uploadData, subject: e.target.value})} className="w-full border dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800" placeholder="e.g., Web Development" />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Apply Tags (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${uploadData.tags.includes(tag) ? 'bg-brand-100 text-brand-700 border-brand-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">File (PDF/Image)</label>
                  <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full border dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-400 hover:file:bg-brand-100 dark:hover:file:bg-brand-900/50" />
                </div>
                
                <button type="submit" className="w-full bg-brand-600 text-white rounded-xl py-3 font-bold mt-4 hover:bg-brand-700 transition-colors">Upload File</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
