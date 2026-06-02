import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Mail, UserPlus, Briefcase, Sparkles, AlertCircle } from 'lucide-react';

interface AuthInterfaceProps {
  onAuthSuccess: (user: any, token: string) => void;
}

export default function AuthInterface({ onAuthSuccess }: AuthInterfaceProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { fullName, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Server connection failed.');
      }

      onAuthSuccess(resData.user, resData.token);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-screen bg-[#0f172a] relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden text-slate-100 font-sans">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/15 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <div className="flex justify-center items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/10 text-white">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NexGen AI Jobs
          </span>
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white leading-tight">
          {isLogin ? 'Sign in to your portal' : 'Create your AI profile'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Or{' '}
          <button
            id="toggle-auth-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none cursor-pointer underline decoration-cyan-400/30 underline-offset-4"
          >
            {isLogin ? 'register a new candidate account' : 'sign in with your existing credentials'}
          </button>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full">
        <motion.div
          layout
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-200 font-medium">{error}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    id="reg-fullname-field"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all placeholder:text-slate-500"
                    placeholder="Alex Mercer"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-slate-400" />
                </div>
                <input
                  id="email-field"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all placeholder:text-slate-500"
                  placeholder="alex.mercer@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password-field"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-white/10 rounded-xl shadow-lg shadow-cyan-900/20 text-sm font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Syncing Profile...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {isLogin ? <Sparkles className="w-4 h-4 text-slate-900" /> : <UserPlus className="w-4 h-4 text-slate-900" />}
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Create & Analyze Profile'}</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-white/5 pt-6">
            <div className="text-[10px] text-slate-500 text-center uppercase tracking-wider font-bold">
              Autonomous AI Matchmaker
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                ATS Analysis Feedback
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Real-time Scorecarding
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                Tailored Cover Letters
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                SaaS Job Integrations
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
