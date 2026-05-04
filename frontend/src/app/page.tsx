"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Mail, Sparkles, User, BookOpen, GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Student Profile Fields (register only)
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [semester, setSemester] = useState('1');
  const [interests, setInterests] = useState<string[]>([]);

  const router = useRouter();

  // If already logged in, skip the login page
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Admin shortcut
    if (email === 'admin@campus.com' && password === '1234') {
      localStorage.setItem('user', JSON.stringify({ name: 'Admin', role: 'admin' }));
      window.location.href = '/admin';
      return;
    }

    try {
      if (!isLogin) {
        // ── REGISTER ──────────────────────────────────────────
        const res = await axios.post('http://localhost:5001/api/users', {
          name,
          email,
          password,
          branch,
          semester,
          interests
        });
        localStorage.setItem('user', JSON.stringify({
          _id: res.data._id,
          name: res.data.name,
          branch: res.data.branch,
          role: 'student'
        }));
        window.location.href = '/dashboard';
      } else {
        // ── LOGIN ─────────────────────────────────────────────
        const res = await axios.post('http://localhost:5001/api/users/login', { email, password });
        localStorage.setItem('user', JSON.stringify({
          _id: res.data._id,
          name: res.data.name,
          branch: res.data.branch,
          role: 'student'
        }));
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.error;
        if (msg === 'Email already in use') {
          setError('An account with this email already exists. Please sign in.');
        } else if (msg === 'No account found with that email') {
          setError('No account found. Please create a profile first.');
        } else if (msg === 'Incorrect password') {
          setError('Incorrect password. Please try again.');
        } else {
          setError(msg || 'Something went wrong. Please try again.');
        }
      } else {
        setError('Could not connect to server. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const commonInterests = ['AI/ML', 'Web Dev', 'Design', 'Hackathons', 'Robotics', 'Gaming', 'Startups'];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 py-12">
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-16 h-16 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-brand-500/30"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Smart Hub</h1>
          <p className="text-slate-500">{isLogin ? 'Welcome back! Sign in to continue.' : 'Create your student profile — just once!'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-800">

          {/* Tab toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-2">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isLogin ? 'bg-white dark:bg-slate-700 shadow text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isLogin ? 'bg-white dark:bg-slate-700 shadow text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Create Profile
            </button>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Register-only fields */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alice Johnson"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Branch & Semester */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Branch</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none"
                      >
                        <option>Computer Science</option>
                        <option>Information Tech</option>
                        <option>Electronics</option>
                        <option>Mechanical</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Semester</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none"
                      >
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {commonInterests.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${interests.includes(interest) ? 'bg-brand-100 text-brand-700 border-brand-200 dark:bg-brand-900/30 dark:text-brand-300' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? "your@email.com" : "student@campus.edu"}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                required
                minLength={4}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {isLogin && (
              <p className="text-xs text-slate-400 ml-1 mt-1">
                Admin: <span className="font-mono">admin@campus.com</span> / <span className="font-mono">1234</span>
              </p>
            )}
            {!isLogin && (
              <p className="text-xs text-slate-400 ml-1 mt-1">
                Demo accounts: <span className="font-mono">alice@campus.edu</span> / <span className="font-mono">password123</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all mt-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {isLogin ? 'Signing in…' : 'Creating profile…'}
              </span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Profile & Sign In'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Switch hint */}
          <p className="text-center text-sm text-slate-500 pt-1">
            {isLogin ? (
              <>New here?{' '}
                <button type="button" onClick={() => { setIsLogin(false); setError(''); }} className="text-brand-600 font-semibold hover:underline">Create a profile</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => { setIsLogin(true); setError(''); }} className="text-brand-600 font-semibold hover:underline">Sign in</button>
              </>
            )}
          </p>
        </form>
      </motion.div>
    </div>
  );
}
