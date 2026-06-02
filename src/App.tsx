import React, { useState, useEffect } from 'react';
import { User } from './types';
import AuthInterface from './components/AuthInterface';
import JobPortalDashboard from './components/JobPortalDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-authenticate active sessions from localStorage on boot
  useEffect(() => {
    const storedToken = localStorage.getItem('nexgen_job_token');
    const loadSession = async () => {
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/user', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Clean up stale token
            localStorage.removeItem('nexgen_job_token');
          }
        } catch (e) {
          console.error('Failed to restore candidate session', e);
        }
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  const handleAuthSuccess = (authenticatedUser: User, sessionToken: string) => {
    setUser(authenticatedUser);
    setToken(sessionToken);
    localStorage.setItem('nexgen_job_token', sessionToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexgen_job_token');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div id="loading-fallback" className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center overflow-hidden font-sans">
        {/* Background Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs uppercase tracking-widest font-extrabold text-slate-500">
            Scanning candidate registry...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div id="application-container" className="min-h-screen bg-[#0f172a]">
      {user && token ? (
        <JobPortalDashboard 
          user={user} 
          token={token} 
          onLogout={handleLogout} 
          onUserUpdate={handleUserUpdate} 
        />
      ) : (
        <AuthInterface onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}
