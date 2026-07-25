import React, { useState, useEffect } from 'react';
import { User, Job, MatchResult } from '../types';
import { 
  Sparkles, AlertCircle, LogOut, Check, Edit3, TrendingUp, Info, 
  Settings, Globe, RefreshCw, Layers, ShieldCheck, MailCheck, Bell, User as UserIcon,
  Menu, MessageSquare, LayoutDashboard, HelpCircle, Award, Compass, Sparkle,
  ChevronLeft, ChevronRight, Bot, SlidersHorizontal, Briefcase, FileText, Mail, Palette, X as CloseIcon
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
  
  // Synchronized seeker active tab state
  const [seekerSubTab, setSeekerSubTab] = useState<'jobs' | 'match' | 'resume' | 'letters' | 'interview' | 'tracker' | 'coach' | 'visitors' | 'ats' | 'career_path' | 'skills'>('match');
  // Sidebar collapsing toggle state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
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
  const [applicationsDetails, setApplicationsDetails] = useState<any[]>([]);
  const [clickedJobs, setClickedJobs] = useState<string[]>([]);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [supabaseEnabled, setSupabaseEnabled] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [checkingSync, setCheckingSync] = useState(false);

  // Portal Theme Preset state
  const [currentTheme, setCurrentTheme] = useState<'pearl' | 'midnight' | 'emerald' | 'gold'>(() => {
    return (localStorage.getItem('portal_theme_preset') as any) || 'pearl';
  });
  const [showThemePopover, setShowThemePopover] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('portal_theme_preset', currentTheme);
  }, [currentTheme]);

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
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro' | 'Enterprise'>(() => user.plan || 'Free');

  useEffect(() => {
    if (user && user.plan) {
      setUserPlan(user.plan);
    }
  }, [user]);
  
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
        setApplicationsDetails(data.appliedDetails || []);
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
        const matchesRes = await fetch('/api/jobs/matched?force=true', {
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

  const triggerToast = (title: string, message: string) => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setActiveToasts(prev => [{ id, title, message }, ...prev]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const handleUpdateUserPlan = (selectedPlan: 'Free' | 'Pro' | 'Enterprise') => {
    setUserPlan(selectedPlan);
    onUserUpdate({ ...user, plan: selectedPlan });
    triggerToast(
      "Upgrade Successful!",
      `Congratulations! You have upgraded to the "${selectedPlan}" workspace. Advanced corporate search and ATS metrics are fully enabled.`
    );
    // Reload activities to get the billing emails & notifications list instantly
    setTimeout(() => {
      fetchLiveNotifications();
      fetchTelemetryActivities();
    }, 500);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotInput, setChatbotInput] = useState('');
  const [chatbotMessages, setChatbotMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: `Hello! I'm your Career Copilot. How can I help you today? You can ask me about your job matches, premium plan benefits, or how to optimize your resume.` }
  ]);
  const [chatbotLoading, setChatbotLoading] = useState(false);

  const handleSendChatbotMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatbotInput.trim()) return;

    const userText = chatbotInput.trim();
    setChatbotMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatbotInput('');
    setChatbotLoading(true);

    setTimeout(() => {
      let aiText = "I'm here to guide you! BrainyCareer helps you evaluate compliance scores, map tech gaps, and dispatch tailored pitches to recruiters. Let me know if you want summary advice on your resume.";
      const query = userText.toLowerCase();

      if (query.includes('match') || query.includes('job') || query.includes('align')) {
        if (matches.length > 0) {
          const top = matches.slice(0, 3).map(m => `${m.job.title} at ${m.job.company} (${m.score}% Match)`).join(', ');
          aiText = `Based on your resume analysis, your best matching positions are: ${top}. Feel free to check the 'Top Matches for You' tab for detailed analytics!`;
        } else {
          aiText = "I don't see an uploaded resume in your profile yet. Once you drag & drop your credentials on the Seeker Portal, I can dynamically rank your compatibility across all global listings!";
        }
      } else if (query.includes('premium') || query.includes('plan') || query.includes('price') || query.includes('free') || query.includes('cost')) {
        aiText = "BrainyCareer offers two simple plans:\n\n1. Free Tier: Allows up to 5 job applications per day and custom cover letters for those 5 jobs.\n2. Gold Premium (INR 249): Unlocks unlimited job applications, resume optimizations, comprehensive ATS gap analysis, and direct dispatcher integrations.";
      } else if (query.includes('skill') || query.includes('gap') || query.includes('missing')) {
        if (matches.length > 0 && matches[0].missingSkills.length > 0) {
          const gaps = matches[0].missingSkills.join(', ');
          aiText = `Our ATS compliance check shows that for your target role (${matches[0].job.title}), your primary missing skills are: ${gaps}. We recommend adding certifications or project highlights for these in your profile.`;
        } else {
          aiText = "You have an excellent skill alignment across our indexed vacancies! To maintain your competitive edge, make sure your resume highlights modern tech frameworks prominently.";
        }
      } else if (query.includes('applied') || query.includes('apply')) {
        aiText = `You have applied for ${appliedJobs.length} positions in this session. Under the Free plan, you can submit up to 5 applications daily. Premium members enjoy unlimited dispatch channels.`;
      } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        aiText = "Hello! I am your interactive AI Career Coach. Ask me 'What are my top job matches?', 'How can I optimize my skills?', or 'Tell me about the premium upgrade'!";
      }

      setChatbotMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
      setChatbotLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans select-none antialiased selection:bg-indigo-150 selection:text-indigo-905">
      
      {/* 1. DESKTOP SIDEBAR NAV PANEL */}
      <aside className={`hidden md:flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen z-30 justify-between font-sans`}>
        <div className="p-5 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Brand/Logo Area */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'} pb-4 border-b border-slate-100`}>
            <div className="w-9 h-9 rounded-xl bg-[#2563eb] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="animate-fade-in">
                <h1 className="text-sm font-black text-slate-855 tracking-tight leading-none">
                  Career<span className="text-[#2563eb] font-bold">Copilot</span>
                </h1>
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400 mt-1 block tracking-wider">AI Platform</span>
              </div>
            )}
          </div>

          {/* Active Database Health Check indicators */}
          {!isSidebarCollapsed ? (
            <div className="flex flex-col gap-1.5 bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10.5px] font-mono leading-none">
              {isLiveSupabase ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  CLOUD SYNCED
                </span>
              ) : (
                <span className="text-slate-550 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                  PORTAL ACTIVE
                </span>
              )}
              <span className="text-[9px] text-[#2563eb] font-extrabold mt-1.5 uppercase bg-blue-50 border border-blue-100 px-1.5 py-1 rounded inline-block text-center">
                {userPlan} Tier Limit
              </span>
            </div>
          ) : (
            <div className="flex justify-center" title={`${userPlan} Tier`}>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>
          )}

          {/* Nav Items List */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-widest block px-2 mb-2">Workspace Portals</span>
            )}
            
            {/* Render 9 Seeker Menu Items when activePortal is 'seeker' */}
            {activePortal === 'seeker' ? (
              [
                { id: 'tracker', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'match', label: 'AI Jobs', icon: Briefcase },
                { id: 'resume', label: 'Resume', icon: FileText },
                { id: 'ats', label: 'ATS', icon: SlidersHorizontal },
                { id: 'career_path', label: 'Career Path', icon: TrendingUp },
                { id: 'skills', label: 'Skills', icon: Award },
                { id: 'letters', label: 'Cover Letter', icon: Mail },
                { id: 'interview', label: 'Interview', icon: MessageSquare },
                { id: 'coach', label: 'AI Chat', icon: Bot },
              ].map(item => {
                const isSelected = seekerSubTab === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSeekerSubTab(item.id as any)}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-1 py-3' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })
            ) : (
              /* Non-seeker generic active item buttons */
              <button
                onClick={() => setActivePortal('seeker')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-1 py-3' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-505 hover:text-slate-800 hover:bg-slate-50`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400" />
                {!isSidebarCollapsed && <span>Return to Seeker Portal</span>}
              </button>
            )}
          </div>
          
          {/* Switch Portal Section if Role permits */}
          {(user.role === 'employer' || user.role === 'admin') && !isSidebarCollapsed && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-widest block px-2 mb-1.5">Workspace Channels</span>
              <button
                onClick={() => setActivePortal(activePortal === 'seeker' ? 'employer' : 'seeker')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-500 hover:text-slate-800 hover:bg-slate-50`}
              >
                <Compass className="w-4 h-4 text-slate-400 animate-spin-slow" />
                <span>{activePortal === 'seeker' ? 'Employer Console' : 'Seeker Console'}</span>
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => setActivePortal('admin')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePortal === 'admin' ? 'bg-[#2563eb] text-white' : 'text-slate-550 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  <Settings className="w-4 h-4 text-slate-400 animate-spin-slow" />
                  <span>Super Admin Panel</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* User profile card and logout button at the bottom of the sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3.5 font-sans">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 px-1">
              <div className="w-8.5 h-8.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold text-xs select-none uppercase border border-slate-200">
                {user.email ? user.email.charAt(0) : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10.5px] font-bold text-slate-800 block truncate leading-none">
                  {user.email || "upretigaurav22@gmail.com"}
                </span>
                <span className="text-[9px] text-slate-405 font-semibold block truncate mt-1">
                  Verified Candidate
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold text-xs border border-slate-202 uppercase" title={user.email || "upretigaurav22@gmail.com"}>
                {user.email ? user.email.charAt(0) : "U"}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {/* Collapsible toggle button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-3xs"
            >
              {isSidebarCollapsed ? (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </>
              ) : (
                <>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>Collapse Menu</span>
                </>
              )}
            </button>

            <button
              onClick={onLogout}
              className={`w-full flex items-center justify-center ${isSidebarCollapsed ? 'p-2' : 'gap-2 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'} text-[11px] font-bold rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100`}
              title="Sign Out Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              {!isSidebarCollapsed && <span>Sign Out Session</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE TOP HEADER NAVIGATION */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0f172a] text-slate-200 px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <div className="w-8.5 h-8.5 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs select-none">
            BC
          </div>
          <div>
            <h1 className="text-xs font-black text-white leading-none">BrainyCareer</h1>
            <span className="text-[8px] font-mono font-bold text-slate-400 mt-0.5 block uppercase">{activePortal} Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications feed Trigger on Mobile */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition-all cursor-pointer relative"
            >
              <Bell className="w-4 h-4 text-slate-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={onLogout}
            className="p-2 bg-slate-800 rounded-lg hover:bg-rose-950 hover:text-rose-300 text-slate-300 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT OVERLAY MENU DRAWER */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 md:hidden flex animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside 
            className="w-64 bg-[#0f172a] text-slate-200 h-full p-5 flex flex-col justify-between font-sans border-r border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">BC</div>
                  <span className="font-black text-white text-sm">BrainyCareer</span>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 hover:bg-slate-850 rounded-lg cursor-pointer"
                >
                  <CloseIcon className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-widest block px-2 mb-1.5">Portals</span>

                {(user.role === 'seeker' || !user.role || user.role === 'admin') && (
                  <button
                    onClick={() => { setActivePortal('seeker'); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                      activePortal === 'seeker' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Job Seeker Portal</span>
                  </button>
                )}

                {(user.role === 'employer' || user.role === 'admin') && (
                  <button
                    onClick={() => { setActivePortal('employer'); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                      activePortal === 'employer' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Employer Console</span>
                  </button>
                )}

                {user.role === 'admin' && (
                  <button
                    onClick={() => { setActivePortal('admin'); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                      activePortal === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Super Admin Panel</span>
                  </button>
                )}

                <button
                  onClick={() => { setActivePortal('pricing'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                    activePortal === 'pricing' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Premium Upgrade</span>
                </button>

                {activePortal === 'seeker' && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-1">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-widest block px-2 mb-1.5">Seeker Navigation</span>
                    {[
                      { id: 'tracker', label: 'Dashboard', icon: LayoutDashboard },
                      { id: 'match', label: 'AI Jobs', icon: Briefcase },
                      { id: 'resume', label: 'Resume', icon: FileText },
                      { id: 'ats', label: 'ATS', icon: SlidersHorizontal },
                      { id: 'career_path', label: 'Career Path', icon: TrendingUp },
                      { id: 'skills', label: 'Skills', icon: Award },
                      { id: 'letters', label: 'Cover Letter', icon: Mail },
                      { id: 'interview', label: 'Interview', icon: MessageSquare },
                      { id: 'coach', label: 'AI Chat', icon: Bot },
                    ].map(item => {
                      const isSelected = seekerSubTab === item.id;
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setSeekerSubTab(item.id as any); setMobileSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                            isSelected ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
              <div className="flex items-center gap-2.5 px-1 text-slate-300">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-extrabold uppercase select-none">{user.email ? user.email.charAt(0) : "U"}</div>
                <span className="truncate max-w-[140px] font-bold text-slate-200 text-[11px]">{user.email || "upretigaurav22@gmail.com"}</span>
              </div>
              <button
                onClick={() => { setMobileSidebarOpen(false); onLogout(); }}
                className="w-full py-2 bg-slate-800 text-rose-300 hover:bg-rose-950 text-center font-bold rounded-xl text-[11px]"
              >
                Sign Out Session
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        
        {/* Simple desktop header for alerts trigger, setting drawer buttons */}
        <header className="hidden md:flex bg-white border-b border-slate-250 p-4 px-6 justify-end items-center gap-4 shrink-0 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3.5">
            
            {/* Sync health status */}
            <div className="text-[10.5px] font-mono bg-slate-50 border border-slate-200 py-1 px-2 rounded-lg text-slate-500 font-bold">
              {isLiveSupabase ? (
                <span className="text-emerald-600">✓ Sync Live</span>
              ) : (
                <span>● Active Cache</span>
              )}
            </div>

            {/* Theme Switcher Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowThemePopover(!showThemePopover);
                  setShowNotificationsPopover(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer bg-white shadow-3xs text-xs font-bold text-slate-700"
                title="Change Portal Theme"
              >
                <Palette className="w-4 h-4 text-indigo-600" />
                <span className="capitalize text-[11px] hidden lg:inline font-mono">
                  {currentTheme === 'pearl' && 'Titanium Pearl'}
                  {currentTheme === 'midnight' && 'Midnight Obsidian'}
                  {currentTheme === 'emerald' && 'Executive Emerald'}
                  {currentTheme === 'gold' && 'Champagne Gold'}
                </span>
              </button>

              {showThemePopover && (
                <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 text-xs animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-600" /> Portal Themes
                    </span>
                    <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">4 Presets</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    {[
                      { id: 'pearl', label: 'Titanium Pearl', desc: 'Ultra-clean Light & Royal Indigo', color: 'bg-indigo-600' },
                      { id: 'midnight', label: 'Midnight Obsidian', desc: 'Sleek Dark Mode & Glass Highlights', color: 'bg-slate-900' },
                      { id: 'emerald', label: 'Executive Emerald', desc: 'Forest Green & Pearl Slate', color: 'bg-emerald-600' },
                      { id: 'gold', label: 'Champagne Gold', desc: 'Luxury Ivory & Warm Gold', color: 'bg-amber-600' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setCurrentTheme(t.id as any);
                          setShowThemePopover(false);
                          triggerToast("Theme Updated!", `Switched portal theme to ${t.label}.`);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                          currentTheme === t.id
                            ? 'bg-indigo-50/70 border-indigo-400/50 font-bold'
                            : 'border-transparent hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3.5 h-3.5 rounded-full ${t.color} shrink-0 border border-white shadow-3xs`} />
                          <div>
                            <span className="block text-[11px] font-extrabold text-slate-800 leading-tight">{t.label}</span>
                            <span className="block text-[9px] text-slate-400 font-medium">{t.desc}</span>
                          </div>
                        </div>
                        {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications panel toggle button */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer relative bg-white shadow-3xs"
                title="Notifications feed center"
              >
                <Bell className="w-4 h-4 text-slate-600 font-bold" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-blue-600 text-white text-[9.5px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationsPopover && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs animate-fade-in">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Real-time Event Logs</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => handleMarkNotificationsAsRead()}
                        className="text-blue-600 hover:text-blue-800 text-[10px] font-extrabold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-semibold text-[11px]">
                        No notifications logs found. Interactive activities populate here.
                      </div>
                    ) : (
                      [...notifications].reverse().map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkNotificationsAsRead([n.id])}
                          className={`p-3 transition-all cursor-pointer hover:bg-slate-50/80 flex gap-2.5 items-start ${!n.read ? 'bg-blue-50/15' : ''}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-blue-600 animate-pulse' : 'bg-transparent'}`} />
                          <div className="space-y-0.5 w-full">
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-extrabold text-slate-900 leading-snug">{n.title}</span>
                              <span className="text-[8px] text-slate-400 font-mono shrink-0">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-505 leading-normal text-[10.5px] font-semibold">{n.message}</p>
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
                    className="w-full text-center py-2.5 border-t border-slate-100 font-extrabold text-blue-600 hover:bg-slate-50 text-[10px] uppercase tracking-wider block cursor-pointer bg-slate-50/50"
                  >
                    Adjust Channels Preferences
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSettingsDrawer(true)}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer bg-white shadow-3xs"
              title="Communications configuration"
            >
              <Settings className="w-4 h-4 text-slate-655" />
            </button>

          </div>
        </header>

        {/* Global application inner contents portal container */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          <div className="space-y-6">
            
            {/* Virtual Browser Push Permission Banner */}
            {activePortal === 'seeker' && pushPermissionStatus === 'default' && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-5 border border-indigo-500 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
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
                      triggerToast("Aura Push Enabled!", "Aura Push Alerts are activated. You will now receive visual slide-in push alerts for employer activities.");
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
                applicationsDetails={applicationsDetails || []}
                clickedJobs={clickedJobs}
                sentEmails={sentEmails}
                supabaseEnabled={supabaseEnabled}
                isLiveSupabase={isLiveSupabase}
                onRefreshTelemetry={loadJobsDatabase}
                onUploadResume={handleResumeUpload}
                uploadingResume={uploadingResume}
                onShowToast={triggerToast}
                currentPlan={userPlan}
                onNavigatePricing={() => setActivePortal('pricing')}
                seekerTab={seekerSubTab}
                setSeekerTab={setSeekerSubTab}
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
                onShowToast={triggerToast}
                onNavigatePricing={() => setActivePortal('pricing')}
              />
            )}

            {activePortal === 'admin' && (
              <AdminPortal />
            )}

            {activePortal === 'pricing' && (
              <PricingTiers 
                currentPlan={userPlan}
                token={token}
                onSelectPlan={handleUpdateUserPlan}
                role={user.role}
              />
            )}
          </div>
        </div>

      </div>

      {/* 4. PERSISTENT SIDE DRAWER FOR EMAIL, SMS, WHATSAPP SETTINGS */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex justify-end z-50 animate-fade-in" onClick={() => setShowSettingsDrawer(false)}>
          <div 
            className="bg-[#0b101d] border-l border-white/10 w-full max-w-sm p-6 flex flex-col justify-between h-full font-sans text-xs"
            onClick={e => e.stopPropagation()}
          >
            
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
                  triggerToast("Preferences Saved", "Real-time notifications preferences updated successfully.");
                }}
                className="w-full bg-cyan-400 text-slate-950 font-black py-2.5 rounded-xl cursor-pointer"
              >
                Save Notification Channels
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. FLOATING COMPLIANT CAREER COPILOT AI CHATBOT SYSTEM */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none font-sans">
        
        {/* Chatbot Interface Card Panel overlay */}
        {chatbotOpen && (
          <div className="pointer-events-auto w-85 max-w-sm h-110 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs animate-slide-up">
            {/* Header */}
            <div className="bg-[#0f172a] text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white animate-spin" />
                </div>
                <div>
                  <h4 className="font-black text-xs">Aura Career Copilot</h4>
                  <span className="text-[8.5px] font-mono text-blue-400 font-bold block">Interactive AI Guidance</span>
                </div>
              </div>

              <button 
                onClick={() => setChatbotOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>

            {/* Conversation Log Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {chatbotMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed font-sans font-semibold text-[11px] border shadow-3xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white border-blue-650 rounded-tr-none'
                      : 'bg-white text-slate-850 border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatbotLoading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-slate-400 font-mono text-[10px] inline-flex items-center gap-1.5 font-bold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span>Analyzing profile indices...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick interactive coaching tags */}
            <div className="bg-white border-t border-slate-100 p-2 overflow-x-auto whitespace-nowrap flex gap-1 shrink-0 scrollbar-none">
              <button
                onClick={() => {
                  setChatbotInput("Tell me my best job matches");
                  setTimeout(() => handleSendChatbotMessage(), 100);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-[10px] border border-slate-200 cursor-pointer"
              >
                🔍 List Matches
              </button>
              <button
                onClick={() => {
                  setChatbotInput("What are the premium plan benefits?");
                  setTimeout(() => handleSendChatbotMessage(), 100);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-[10px] border border-slate-200 cursor-pointer"
              >
                ⭐ Plan Perks
              </button>
              <button
                onClick={() => {
                  setChatbotInput("What are my missing skills?");
                  setTimeout(() => handleSendChatbotMessage(), 100);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-[10px] border border-slate-200 cursor-pointer"
              >
                ⚠️ Missing Skills Gaps
              </button>
            </div>

            {/* Input area Form */}
            <form 
              onSubmit={handleSendChatbotMessage}
              className="p-2 border-t border-slate-200 bg-white flex gap-2 shrink-0"
            >
              <input
                type="text"
                value={chatbotInput}
                onChange={e => setChatbotInput(e.target.value)}
                placeholder="Ask Career Copilot anything..."
                className="flex-1 bg-slate-100 text-slate-805 border border-slate-200 rounded-xl px-3.5 py-2 text-[11px] focus:outline-none focus:border-blue-400 font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#0f172a] hover:bg-blue-600 text-white rounded-xl text-[10.5px] font-black cursor-pointer transition-all shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="pointer-events-auto p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center group relative border border-blue-500"
          title="Interactive Career Copilot Coach"
        >
          <MessageSquare className="w-5.5 h-5.5 text-white animate-pulse" />
          <span className="absolute right-14 bg-[#0f172a] text-white border border-slate-700 p-1 px-2 rounded-lg text-[9px] font-bold block whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all mr-1 duration-200 shadow-md">
            AI Career Copilot
          </span>
        </button>

      </div>

      {/* Floating Browser Push Notification Toast Stack */}
      <div className="fixed bottom-6 right-24 z-50 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
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
