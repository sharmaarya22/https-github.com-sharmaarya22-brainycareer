import React, { useState, useEffect } from 'react';
import { User, Job, MatchResult } from '../types';
import { 
  Sparkles, AlertCircle, LogOut, Check, Edit3, TrendingUp, Info, 
  Settings, Globe, RefreshCw, Layers, ShieldCheck, MailCheck, Bell, User as UserIcon
} from 'lucide-react';
import JobSeekerPortal from './JobSeekerPortal';
import EmployerPortal from './EmployerPortal';
import AdminPortal from './AdminPortal';
import PricingTiers from './PricingTiers';

interface JobPortalDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export default function JobPortalDashboard({ user, token, onLogout, onUserUpdate }: JobPortalDashboardProps) {
  
  // High-fidelity portal roles selector
  const [activePortal, setActivePortal] = useState<'seeker' | 'employer' | 'admin' | 'pricing'>(user.role || 'seeker');
  
  // Automatically sync activePortal if the user's role is updated or refreshed
  useEffect(() => {
    if (user && user.role) {
      setActivePortal(user.role);
    }
  }, [user?.role]);

  // Custom interactive variables
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Telemetry properties synced from database
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [clickedJobs, setClickedJobs] = useState<string[]>([]);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [supabaseEnabled, setSupabaseEnabled] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [checkingSync, setCheckingSync] = useState(false);

  // Notification configuration builders
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [notificationsConfig, setNotificationsConfig] = useState({
    emailAlerts: true,
    smsAlerts: false,
    whatsAppAlerts: false,
    pushSystemAlerts: true
  });

  // Safe client plans level simulation
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Free');
  
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleResumeUpload = async (fileContent: { text?: string; base64?: string }, fileName: string) => {
    setUploadingResume(true);
    try {
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText: fileContent.text, fileBase64: fileContent.base64, fileName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse user resume.');

      onUserUpdate(data.user);
    } catch (err: any) {
      console.warn("Resume upload failed:", err.message);
      throw err; // Propagate exception to UI
    } finally {
      setUploadingResume(false);
    }
  };

  // Load telemetry sync states
  const fetchTelemetryActivities = async () => {
    try {
      const res = await fetch('/api/user/activities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppliedJobs(data.applied || []);
        setClickedJobs(data.clicked || []);
        setSentEmails(data.emails || []);
        setSupabaseEnabled(data.supabaseEnabled || false);
        setIsLiveSupabase(data.isLiveSupabase || false);
      }
    } catch (e) {
      console.error('Failed to load user activities tracking:', e);
    }
  };

  // Main loader for jobs and matches descending by fit
  const loadJobsDatabase = async () => {
    setLoadingJobs(true);
    setCheckingSync(true);
    try {
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await jobsRes.json();
      let jobList: Job[] = jobsData.jobs || [];

      let matchesList: MatchResult[] = [];
      if (user.resumeText) {
        const matchesRes = await fetch('/api/jobs/matched', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          matchesList = matchesData.matches || [];
          setMatches(matchesList);
        }
      }

      // Automatically sort vacancy list by match percentage descending if CV is present
      if (user.resumeText && matchesList.length > 0) {
        jobList = [...jobList].sort((a, b) => {
          const scoreA = matchesList.find(m => m.jobId === a.id)?.score || 0;
          const scoreB = matchesList.find(m => m.jobId === b.id)?.score || 0;
          return scoreB - scoreA;
        });
      }

      setJobs(jobList);
      await fetchTelemetryActivities();
    } catch (e) {
      console.error("Failed to load global listings:", e);
    } finally {
      setLoadingJobs(false);
      setCheckingSync(false);
    }
  };

  useEffect(() => {
    loadJobsDatabase();
  }, [user.resumeText]);

  // Recruiter add job listing capability
  const handleAddNewVacancy = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const handleUpdateUserPlan = (selectedPlan: 'Free' | 'Pro' | 'Enterprise') => {
    setUserPlan(selectedPlan);
    alert(`Congratulations! You have successfully upgraded to the "${selectedPlan}" credential model. Exclusive AI matching limits configured.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased selection:bg-cyan-500/20 selection:text-cyan-200 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      
      {/* Sticky Top Header of Glow SaaS style */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.35)] text-slate-950 font-black text-sm tracking-tighter">
            AJ
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5 leading-none">
              AURA GLOBAL <span className="text-[10px] text-cyan-400 font-bold bg-cyan-450/10 px-2 py-0.5 rounded font-mono border border-cyan-500/15 animate-pulse">AI MARKETPLACE</span>
            </h1>
            <p className="text-[9.5px] uppercase font-bold text-slate-500 mt-1">Autonomous Multi-Role Recruitment Suite</p>
          </div>
        </div>

        {/* Global Multi-Role Navigation switch */}
        <nav className="hidden md:flex bg-slate-900/85 p-1 rounded-xl border border-slate-805 text-[10.5px] font-bold">
          {(user.role === 'seeker' || user.role === 'admin' || !user.role) && (
            <button
              onClick={() => setActivePortal('seeker')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePortal === 'seeker' ? 'bg-slate-800 text-white font-extrabold border border-slate-700/60 shadow text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Job Seeker Portal
            </button>
          )}
          {(user.role === 'employer' || user.role === 'admin') && (
            <button
              onClick={() => setActivePortal('employer')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePortal === 'employer' ? 'bg-slate-800 text-white font-extrabold border border-slate-700/60 shadow text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Employer Console
            </button>
          )}
          {(user.role === 'admin') && (
            <button
              onClick={() => setActivePortal('admin')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePortal === 'admin' ? 'bg-slate-800 text-white font-extrabold border border-slate-700/60 shadow text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Super Admin Panel
            </button>
          )}
          <button
            onClick={() => setActivePortal('pricing')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activePortal === 'pricing' ? 'bg-slate-800 text-white font-extrabold border border-slate-700/60 shadow text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Premium Upgrade
          </button>
        </nav>

        {/* Dynamic header stats sync & logging */}
        <div className="flex items-center gap-4">
          
          {/* Active Database Health Check indicators */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 py-1.5 px-3 rounded-xl text-[10px] font-mono leading-none">
            {isLiveSupabase ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                CLOUD SYNCED
              </span>
            ) : (
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                PORTAL ACTIVE
              </span>
            )}
            <span className="text-[10px] text-indigo-400 font-extrabold ml-1.5 uppercase bg-indigo-500/10 border border-indigo-500/15 px-1.5 py-0.5 rounded">
              {userPlan} Tier
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsDrawer(true)}
              className="p-2 border border-white/5 bg-slate-900/40 rounded-xl hover:bg-white/5 transition-all cursor-pointer relative"
              title="Notification Settings"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {notificationsConfig.emailAlerts && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
              )}
            </button>
            
            <button
              onClick={onLogout}
              className="p-2 border border-white/5 bg-slate-900/40 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              title="Log Out Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Role Switching Grid */}
      <div className="md:hidden grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-slate-950 text-center text-[10px] font-bold border-b border-white/5">
        {(user.role === 'seeker' || user.role === 'admin' || !user.role) && (
          <button 
            onClick={() => setActivePortal('seeker')}
            className={`py-1.5 rounded-lg ${activePortal === 'seeker' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400'}`}
          >
            Seeker
          </button>
        )}
        {(user.role === 'employer' || user.role === 'admin') && (
          <button 
            onClick={() => setActivePortal('employer')}
            className={`py-1.5 rounded-lg ${activePortal === 'employer' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400'}`}
          >
            Employer
          </button>
        )}
        {(user.role === 'admin') && (
          <button 
            onClick={() => setActivePortal('admin')}
            className={`py-1.5 rounded-lg ${activePortal === 'admin' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400'}`}
          >
            Admin
          </button>
        )}
        <button 
          onClick={() => setActivePortal('pricing')}
          className={`py-1.5 rounded-lg ${activePortal === 'pricing' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400'}`}
        >
          Pricing
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        {/* Dynamic portal switcher container with motion triggers */}
        <div className="space-y-6">
          {activePortal === 'seeker' && (
            <JobSeekerPortal 
              user={user}
              token={token}
              jobs={jobs}
              matches={matches}
              onUserUpdate={onUserUpdate}
              appliedJobs={appliedJobs}
              clickedJobs={clickedJobs}
              sentEmails={sentEmails}
              supabaseEnabled={supabaseEnabled}
              isLiveSupabase={isLiveSupabase}
              onRefreshTelemetry={loadJobsDatabase}
              onUploadResume={handleResumeUpload}
              uploadingResume={uploadingResume}
            />
          )}

          {activePortal === 'employer' && (
            <EmployerPortal 
              jobs={jobs}
              onAddJob={handleAddNewVacancy}
              registeredUsers={[user]}
              currentPlan={userPlan}
            />
          )}

          {activePortal === 'admin' && (
            <AdminPortal />
          )}

          {activePortal === 'pricing' && (
            <PricingTiers 
              currentPlan={userPlan}
              onSelectPlan={handleUpdateUserPlan}
            />
          )}
        </div>

      </main>

      {/* PERSISTENT SIDE DRAWER FOR EMAIL, SMS, WHATSAPP SETTINGS */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-[#0b101d] border-l border-white/10 w-full max-w-sm p-6 flex flex-col justify-between h-full font-sans text-xs">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white">Application Communications</h3>
                  <p className="text-[10px] text-slate-400">Manage real-time recruiter message routes.</p>
                </div>
                <button 
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Toggles items array */}
              <div className="space-y-3">
                {[
                  { id: 'emailAlerts', label: 'E-mail Delivery Node', desc: 'Direct delivery notification with verified matching ranks.' },
                  { id: 'smsAlerts', label: 'SMS Callback Alerts', desc: 'Receive phone screening alerts with dynamic dates.' },
                  { id: 'whatsAppAlerts', label: 'WhatsApp Automation Dispatcher', desc: 'Recruiter communication messages dispatched using instant WhatsApp channels format.' },
                  { id: 'pushSystemAlerts', label: 'Push Notifications & Easy Badges', desc: 'Alert badges tracking on matching telemetry benchmarks.' }
                ].map(item => (
                  <label key={item.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-start gap-3.5 cursor-pointer hover:border-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={(notificationsConfig as any)[item.id]}
                      onChange={() => {
                        setNotificationsConfig(prev => ({
                          ...prev,
                          [item.id]: !(prev as any)[item.id]
                        }));
                      }}
                      className="accent-cyan-400 w-4 h-4 shrink-0 mt-0.5"
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-white block leading-tight">{item.label}</span>
                      <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  setShowSettingsDrawer(false);
                  alert("Real-time notifications preferences updated successfully.");
                }}
                className="w-full bg-cyan-400 text-slate-950 font-black py-2.5 rounded-xl cursor-pointer"
              >
                Save Notification Channels
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Inline Close helper icon
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
