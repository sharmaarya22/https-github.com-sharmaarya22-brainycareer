import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Mail, UserPlus, Briefcase, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';

interface AuthInterfaceProps {
  onAuthSuccess: (user: any, token: string) => void;
}

export default function AuthInterface({ onAuthSuccess }: AuthInterfaceProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'employer'>('seeker');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP State configuration
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = isLogin 
      ? { email, password, isLogin: true } 
      : { fullName, email, password, role: selectedRole, isLogin: false };

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Identity validation check failed.');
      }

      setSimulatedCode(resData.otpCode);
      setShowOtpScreen(true);
      setOtpError(null);
    } catch (err: any) {
      setError(err.message || 'Identity verification check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setLoading(true);

    try {
      // 1. Verify OTP
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, enteredOtp: userOtp }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Verification pin is incorrect.');
      }

      // 2. Real Registration or Login submit
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { fullName, email, password, role: selectedRole };

      const authResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const authData = await authResponse.json();
      if (!authResponse.ok) {
        throw new Error(authData.error || 'Finalizing authentication session failed.');
      }

      onAuthSuccess(authData.user, authData.token);
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-screen bg-slate-50 relative flex flex-col justify-center items-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-slate-800 font-sans">
      {/* Background soft pastel blurs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-indigo-100/60 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] bg-teal-50/70 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 text-center mb-8">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-indigo-200 text-white leading-none">
            BC
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900 font-sans">
            Brainy<span className="text-indigo-600">Career.com</span>
          </span>
        </div>
        
        <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {showOtpScreen 
            ? 'Verify Your Identity' 
            : isLogin 
            ? 'Sign in to your portal' 
            : 'Create your AI profile'}
        </h2>
        
        {!showOtpScreen && (
          <p className="mt-3 text-base text-slate-600">
            Or{' '}
            <button
              id="toggle-auth-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none cursor-pointer underline decoration-indigo-300 underline-offset-4 text-base"
            >
              {isLogin ? 'register a new candidate account' : 'sign in with your existing credentials'}
            </button>
          </p>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 w-full">
        <motion.div
          layout
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-100"
        >
          {showOtpScreen ? (
            <div className="space-y-6">
              <div className="space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider font-mono bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  Verification Required
                </span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  To complete safety checks for <strong>{email}</strong>, input the 6-digit verification code below.
                </p>
              </div>

              {/* Secure sandbox warning helper showing simulated OTP */}
              <div className="bg-indigo-50/70 border border-indigo-150 p-4.5 rounded-2xl text-center space-y-1">
                <span className="text-[10px] tracking-wider font-mono font-bold text-indigo-750 block uppercase">
                  🔑 SYSTEM LOG: IDENTITY OTPPIN
                </span>
                <p className="text-[11px] text-indigo-900 leading-relaxed font-semibold">
                  For quick testing of BrainyCareer security gate, input this pin:
                </p>
                <div className="text-3xl font-black font-mono tracking-widest text-indigo-600 py-1">
                  {simulatedCode}
                </div>
              </div>

              {otpError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800 font-semibold">{otpError}</div>
                </div>
              )}

              <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-5">
                <div>
                  <input
                    id="otp-input-field"
                    type="text"
                    required
                    maxLength={6}
                    value={userOtp}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                      setUserOtp(digitsOnly);
                    }}
                    className="block w-full text-center py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-950 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-3xl font-black font-mono tracking-widest transition-all placeholder:text-slate-300"
                    placeholder="••••••"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpScreen(false);
                      setUserOtp('');
                      setOtpError(null);
                    }}
                    className="w-1/3 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-all text-center"
                  >
                    Back
                  </button>
                  <button
                    id="otp-verify-submit-btn"
                    type="submit"
                    disabled={loading || userOtp.length !== 6}
                    className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-150 text-center"
                  >
                    {loading ? 'Verifying Identity...' : 'Confirm OTP Pin'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3.5"
                >
                  <AlertCircle className="w-5.5 h-5.5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-base text-red-800 font-semibold">{error}</div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm uppercase tracking-wider font-bold text-slate-500 mb-2.5">
                        Select Account Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'seeker', label: 'Job Seeker', desc: 'Apply & Match Resumes' },
                          { id: 'employer', label: 'Employer', desc: 'Screen & Post Jobs' }
                        ].map((roleOpt) => (
                          <button
                            key={roleOpt.id}
                            type="button"
                            onClick={() => setSelectedRole(roleOpt.id as any)}
                            className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                              selectedRole === roleOpt.id
                                ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-extrabold shadow-sm'
                                : 'border-slate-200 bg-slate-50/50 text-slate-650 hover:border-slate-350 hover:text-slate-905'
                            }`}
                          >
                            <div className="text-sm font-bold tracking-tight">{roleOpt.label}</div>
                            <div className="text-xs text-slate-550 mt-1 leading-tight font-sans text-center">{roleOpt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                          id="reg-fullname-field"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all placeholder:text-slate-400 font-medium"
                          placeholder="Alex Mercer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="email-field"
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all placeholder:text-slate-400 font-medium"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="password-field"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all placeholder:text-slate-400 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-xl shadow-indigo-100 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Syncing Security Gateway...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isLogin ? <Sparkles className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
                      <span>{isLogin ? 'Sign In to Dashboard' : 'Create & Analyze Profile'}</span>
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-10 border-t border-slate-100 pt-8">
                <div className="text-xs text-slate-400 text-center uppercase tracking-wider font-bold">
                  Autonomous AI Matchmaker Suite
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    ATS Analysis Feedback
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                    Real-time Scorecarding
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    Tailored Cover Letters
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Enterprise Integrations
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
