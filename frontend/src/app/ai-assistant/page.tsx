"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Sparkles, Paperclip, X, FileText, Lightbulb, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface UserData {
  _id: string;
  name: string;
  branch: string;
}

const SUGGESTED_PROMPTS = [
  "Summarize the key points from my notes",
  "What are the most important topics covered?",
  "Quiz me on what I uploaded",
  "Explain this topic in simple terms",
];

const GENERAL_PROMPTS = [
  "What events are happening this week?",
  "How do I connect with CS students?",
  "Where can I find study notes?",
  "What's on the cafeteria menu today?",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hi! I'm your Smart Campus AI. You can chat with me about campus life, or **upload your notes** (PDF or .txt) and ask me questions about them! 📚" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<UserData | null>(null);
  const [noteContext, setNoteContext] = useState<string>('');
  const [noteFileName, setNoteFileName] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUserContext(JSON.parse(stored));
  }, []);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages, isTyping]);

  // Extract text from a .txt file
  const extractTxtText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Extract text from PDF using pdfjs-dist
  const extractPdfText = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    setNoteFileName(file.name);

    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        text = await extractPdfText(file);
      } else {
        text = await extractTxtText(file);
      }

      // Trim to 8000 chars to keep prompts manageable
      const trimmed = text.slice(0, 8000);
      setNoteContext(trimmed);

      setMessages(prev => [...prev, {
        role: 'ai',
        content: `✅ I've loaded **${file.name}** (${Math.ceil(trimmed.length / 100) * 100} characters extracted). Ask me anything about it — I can summarize, explain, or quiz you!`
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `❌ Sorry, I couldn't read that file. Please try a plain .txt or a text-based PDF.`
      }]);
      setNoteFileName('');
    } finally {
      setIsLoadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearNotes = () => {
    setNoteContext('');
    setNoteFileName('');
    setMessages(prev => [...prev, { role: 'ai', content: "Notes cleared. I'm back to general campus assistant mode 🎓" }]);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await axios.post('http://localhost:5001/api/ai/chat', {
        prompt: text,
        noteContext: noteContext || undefined,
        userContext
      });

      setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  }, [noteContext, userContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const prompts = noteContext ? SUGGESTED_PROMPTS : GENERAL_PROMPTS;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">

      {/* BG Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Campus AI <Sparkles className="w-4 h-4 text-brand-500" />
            </h2>
            <p className="text-xs text-slate-500">
              {noteContext ? `📄 Notes mode: ${noteFileName}` : 'General assistant mode'}
            </p>
          </div>
        </div>

        {/* Notes badge */}
        <AnimatePresence>
          {noteFileName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-full text-xs font-medium text-brand-700 dark:text-brand-300"
            >
              <FileText className="w-3.5 h-3.5" />
              {noteFileName.length > 20 ? noteFileName.slice(0, 20) + '…' : noteFileName}
              <button onClick={clearNotes} className="hover:text-red-500 transition-colors ml-1">
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 z-10">

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Try asking…
            </p>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm ${msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-brand-100 dark:bg-brand-900/50 text-brand-600'}`}>
              {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none shadow-md' : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>
              {msg.content.split('**').map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-brand-100 dark:bg-brand-900/50 text-brand-600">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur z-10 shrink-0">

        {/* Suggested prompts when notes loaded */}
        {noteContext && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="notes-upload"
          />
          <label
            htmlFor="notes-upload"
            className={`flex-shrink-0 p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isLoadingFile
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-pulse'
                : noteContext
                ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-800 text-brand-600'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200'
            }`}
            title="Upload notes (PDF or .txt)"
          >
            {isLoadingFile ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </label>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={noteContext ? `Ask about ${noteFileName}…` : "Ask anything about campus…"}
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-brand-600 text-white p-3.5 rounded-2xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2">
          📎 Upload PDF or .txt notes to ask questions about them
        </p>
      </div>
    </div>
  );
}
