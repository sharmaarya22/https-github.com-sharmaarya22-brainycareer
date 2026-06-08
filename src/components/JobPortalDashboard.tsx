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
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeToasts, setActiveToasts] = useState<any[]>([]);
  const [pushedToastIds, setPushedToastIds] = useState<Set<string>>(new Set());
  const [pushPermissionStatus, setPushPermissionStatus] = useState<string>(() => {
    return localStorage.getItem('virtual_push_permission') || 'default';
  });

  const [notificationsConfig, setNotificationsConfig] = useState({
    emailAlerts: true,
    smsAlerts: false,
    whatsAppAlerts: false,
    pushSystemAlerts: true
  });

  // Safe client plans level simulation
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Free');
  
  const [uploadingResume, setUploadingResume] = useState(false);

  const fetchLiveNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.notifications || [];
        
        // Match with already popped toasts in this session to select new unread alerts
        const unreadList = list.filter((n: any) => !n.read);
        const newUnread = unreadList.filter((n: any) => !pushedToastIds.has(n.id));
        
        if (newUnread.length > 0) {
          // If virtual push alerts are permitted, add to sliding popups
          if (notificationsConfig.pushSystemAlerts && pushPermissionStatus === 'granted') {
            setActiveToasts(prev => [...prev, ...newUnread]);
          }
          
          // Mark as popped in active session cache
          setPushedToastIds(prev => {
            const next = new Set(prev);
            newUnread.forEach((n: any) => next.add(n.id));
            return next;
          });
        }
        
        setNotifications(list);
      }
    } catch (e) {
      console.warn("Failed to retrieve live notifications feed:", e);
    }
  };

  const handleMarkNotificationsAsRead = async (ids?: string[]) => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => 
          (!ids || ids.includes(n.id)) ? { ...n, read: true } : n
        ));
      }
    } catch (e) {
      console.warn("Could not mark alerts as read:", e);
    }
  };

  const handleDismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
    handleMarkNotificationsAsRead([id]);
  };

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

  useEffect(() => {
    fetchLiveNotifications();
    const timer = setInterval(() => {
      fetchLiveNotifications();
    }, 4000);
    return () => clearInterval(timer);
  }, [token, pushedToastIds, notificationsConfig.pushSystemAlerts, pushPermissionStatus]);

  // Recruiter add job listing capability
  const handleAddNewVacancy = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const handleUpdateUserPlan = (selectedPlan: 'Free' | 'Pro' | 'Enterprise') => {
    setUserPlan(selectedPlan);
    alert(`Congratulations! You have successfully upgraded to the "${selectedPlan}" credential model. Exclusive AI matching limits configured.`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased selection:bg-indigo-150 selection:text-indigo-905">
      
      {/* Sticky Top Header of clean light theme */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-100 text-white font-black text-base tracking-tighter">
            AJ
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
              AURA GLOBAL <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded font-mono border border-indigo-155">AI MARKETPLACE</span>
            </h1>
            <p className="text-xs uppercase font-extrabold text-slate-400 mt-1.5 tracking-wider">Autonomous Multi-Role Recruitment Suite</p>
          </div>
        </div>

        {/* Global Multi-Role Navigation switch (Light theme upgrade) */}
        <nav className="hidden md:flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1">
          {(user.role === 'seeker' || user.role === 'admin' || !user.role) && (
            <button
              onClick={() => setActivePortal('seeker')}
              className={`px-4.5 py-2 rounded-lg transition-all cursor-pointer ${
                activePortal === 'seeker' 
                  ? 'bg-white text-indigo-700 font-extrabold border border-slate-200 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Job Seeker Portal
            </button>
          )}
          {(user.role === 'employer' || user.role === 'admin') && (
            <button
              onClick={() => setActivePortal('employer')}
              className={`px-4.5 py-2 rounded-lg transition-all cursor-pointer ${
                activePortal === 'employer' 
                  ? 'bg-white text-indigo-700 font-extrabold border border-slate-200 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Employer Console
            </button>
          )}
          {(user.role === 'admin') && (
            <button
              onClick={() => setActivePortal('admin')}
              className={`px-4.5 py-2 rounded-lg transition-all cursor-pointer ${
                activePortal === 'admin' 
                  ? 'bg-white text-indigo-700 font-extrabold border border-slate-200 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Super Admin Panel
            </button>
          )}
          <button
            onClick={() => setActivePortal('pricing')}
            className={`px-4.5 py-2 rounded-lg transition-all cursor-pointer ${
              activePortal === 'pricing' 
                ? 'bg-white text-indigo-700 font-extrabold border border-slate-200 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Premium Upgrade
          </button>
        </nav>

        {/* Dynamic header stats sync & logging */}
        <div className="flex items-center gap-4">
          
          {/* Active Database Health Check indicators */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-xl text-xs font-mono leading-none">
            {isLiveSupabase ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                CLOUD SYNCED
              </span>
            ) : (
              <span className="text-slate-550 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                PORTAL ACTIVE
              </span>
            )}
            <span className="text-[10px] text-indigo-700 font-extrabold ml-1.5 uppercase bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
              {userPlan} Tier
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
                className="p-2.5 border border-slate-200 bg-white shadow-sm rounded-xl hover:bg-slate-50 transition-all cursor-pointer relative"
                title="Notifications Feed Hub"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationsPopover && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Desktop Service Hub</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => handleMarkNotificationsAsRead()}
                        className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium">
                        No push credentials log found. Direct employer views are indexed here.
                      </div>
                    ) : (
                      [...notifications].reverse().map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkNotificationsAsRead([n.id])}
                          className={`p-3.5 transition-all cursor-pointer hover:bg-slate-50/70 flex gap-2.5 items-start ${!n.read ? 'bg-indigo-50/20' : ''}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-indigo-600' : 'bg-transparent'}`} />
                          <div className="space-y-1 w-full">
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-extrabold text-slate-900 leading-tight">{n.title}</span>
                              <span className="text-[9px] text-slate-400 font-mono shrink-0">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[11px] font-medium">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowNotificationsPopover(false);
                      setShowSettingsDrawer(true);
                    }}
                    className="w-full text-center py-3 border-t border-slate-100 font-bold text-indigo-600 hover:bg-slate-50 text-[11px] uppercase tracking-wider block cursor-pointer bg-slate-50/50"
                  >
                    Adjust Toggles & Channels
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={onLogout}
              className="p-2.5 border border-slate-200 bg-white shadow-sm rounded-xl text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              title="Log Out Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Role Switching Grid */}
      <div className="md:hidden grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-slate-100 text-center text-[11px] font-bold border-b border-slate-200">
        {(user.role === 'seeker' || user.role === 'admin' || !user.role) && (
          <button 
            onClick={() => setActivePortal('seeker')}
            className={`py-2 rounded-lg text-xs font-bold ${activePortal === 'seeker' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-600 hover:bg-slate-200/50'}`}
          >
            Seeker
          </button>
        )}
        {(user.role === 'employer' || user.role === 'admin') && (
          <button 
            onClick={() => setActivePortal('employer')}
            className={`py-2 rounded-lg text-xs font-bold ${activePortal === 'employer' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-600 hover:bg-slate-200/50'}`}
          >
            Employer
          </button>
        )}
        {(user.role === 'admin') && (
          <button 
            onClick={() => setActivePortal('admin')}
            className={`py-2 rounded-lg text-xs font-bold ${activePortal === 'admin' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-600 hover:bg-slate-200/50'}`}
          >
            Admin
          </button>
        )}
        <button 
          onClick={() => setActivePortal('pricing')}
          className={`py-2 rounded-lg text-xs font-bold ${activePortal === 'pricing' ? 'bg-indigo-600 text-white shadow-sm font-black' : 'text-slate-600 hover:bg-slate-200/50'}`}
        >
          Pricing
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        {/* Dynamic portal switcher container with motion triggers */}
        <div className="space-y-6">
          {/* Virtual Browser Push Permission Banner */}
          {activePortal === 'seeker' && pushPermissionStatus === 'default' && (
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-3xl p-5 border border-indigo-700 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-indigo-150 shrink-0 mt-0.5">
                  <Bell className="w-5 h-5 text-indigo-200 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black tracking-tight leading-none text-white">Enable Browser Push Alerts for Application Updates</h4>
                  <p className="text-xs text-indigo-100 font-medium">Receive real-time notifications on your desktop immediately when an employer reviews your resume or changes your candidate eligibility status.</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center font-bold text-xs">
                <button
                  onClick={() => {
                    localStorage.setItem('virtual_push_permission', 'granted');
                    setPushPermissionStatus('granted');
                    alert("Aura Push Alerts Enabled! You will now receive visual slide-in push alerts for employer activities.");
                  }}
                  className="px-4 py-2 bg-white text-indigo-700 rounded-xl font-black hover:bg-indigo-100/90 transition-all cursor-pointer shadow-md"
                >
                  Authorize Alerts
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('virtual_push_permission', 'denied');
                    setPushPermissionStatus('denied');
                  }}
                  className="px-4 py-2 hover:bg-white/15 rounded-xl transition-all cursor-pointer text-indigo-100"
                >
                  No, Thanks
                </button>
              </div>
            </div>
          )}

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
              user={user}
              token={token}
              onAddJob={handleAddNewVacancy}
              onRefreshJobs={loadJobsDatabase}
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

      {/* Floating Browser Push Notification Toast Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {activeToasts.map((toast) => (
          <div 
            key={toast.id}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-white/10 shadow-2xl flex gap-3.5 items-start relative shrink-0 select-none antialiased"
            style={{ animation: 'slideIn 0.35s ease-out' }}
          >
            <div className="p-2 bg-indigo-505/20 rounded-xl text-indigo-300">
              <Bell className="w-4 h-4 text-indigo-400 animate-bounce" />
            </div>
            <div className="space-y-1 flex-1 pr-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase font-mono font-bold text-indigo-300 tracking-wider">Aura Push Alert</span>
                <span className="text-[8px] text-slate-400 font-mono">Just Now</span>
              </div>
              <h4 className="text-xs font-black text-white leading-tight">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">{toast.message}</p>
            </div>

            <button 
              onClick={() => handleDismissToast(toast.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white transition-all cursor-pointer p-0.5 rounded-lg hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

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
