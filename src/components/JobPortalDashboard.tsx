import React, { useState, useEffect } from 'react';
import { User, Preferences, Job, MatchResult } from '../types';
import PreferencesForm from './PreferencesForm';
import ResumeUploader from './ResumeUploader';
import SkillRadarChart from './SkillRadarChart';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, Search, MapPin, Building, Calendar, DollarSign, 
  Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight, 
  LogOut, Clipboard, Check, Edit3, TrendingUp, Cpu, Info, SlidersHorizontal, Settings,
  Globe, RefreshCw, ExternalLink, Mail, X
} from 'lucide-react';

interface JobPortalDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export default function JobPortalDashboard({ user, token, onLogout, onUserUpdate }: JobPortalDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationModelFilter, setLocationModelFilter] = useState<'Remote' | 'Hybrid' | 'Onsite' | 'All'>('All');
  const [recentlyPostedOnly, setRecentlyPostedOnly] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  
  // App view state
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'activity'>('profile');
  const [currentView, setCurrentView] = useState<'matchmaking' | 'trajectory'>('matchmaking');

  // Direct Apply and platform links
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [appliedJobsDetails, setAppliedJobsDetails] = useState<any[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [showDirectApplyToast, setShowDirectApplyToast] = useState<string | null>(null);
  
  // Loaders
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [updatingPrefs, setUpdatingPrefs] = useState(false);
  
  // Cover Letter state
  const [selectedJobForLetter, setSelectedJobForLetter] = useState<Job | null>(null);
  const [customLetterInstructions, setCustomLetterInstructions] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [generatedLetterText, setGeneratedLetterText] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Salary estimation states
  const [salaryEstimates, setSalaryEstimates] = useState<Record<string, any>>({});
  const [fetchingSalary, setFetchingSalary] = useState(false);
  const [salaryError, setSalaryError] = useState<string | null>(null);

  // Supabase Sync & Telemetry state tracking
  const [clickedJobs, setClickedJobs] = useState<string[]>([]);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [supabaseEnabled, setSupabaseEnabled] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [supabaseStatusCheck, setSupabaseStatusCheck] = useState<any>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [strictMatchFilter, setStrictMatchFilter] = useState(false);

  // Direct HR Email Dialog state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailHrRecipient, setEmailHrRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSendSuccess, setEmailSendSuccess] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<string | null>(null);

  // Simulated External Portal state variables
  const [externalPortalModalOpen, setExternalPortalModalOpen] = useState(false);
  const [simulatedJobForPortal, setSimulatedJobForPortal] = useState<Job | null>(null);
  const [portalApplySuccess, setPortalApplySuccess] = useState(false);
  const [portalApplying, setPortalApplying] = useState(false);
  const [simulatedCoverLetter, setSimulatedCoverLetter] = useState('');

  // Brand color/banner mappings helper
  const getBrandDetails = (source?: string) => {
    const src = (source || 'LinkedIn').toLowerCase();
    if (src.includes('linkedin')) {
      return {
        name: 'LinkedIn',
        primary: 'bg-[#0077b5] text-white',
        hover: 'hover:bg-[#005582]',
        text: 'text-[#0077b5]',
        iconBg: 'bg-[#0077b5]/10',
        borderColor: 'border-[#0077b5]/20',
        pillText: 'LinkedIn Easy Apply',
        banner: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=600&auto=format&fit=crop'
      };
    } else if (src.includes('naukri')) {
      return {
        name: 'Naukri',
        primary: 'bg-[#091e42] text-white',
        hover: 'hover:bg-[#051126]',
        text: 'text-[#4a90e2]',
        iconBg: 'bg-[#4a90e2]/10',
        borderColor: 'border-[#4a90e2]/20',
        pillText: 'Naukri Fast Apply',
        banner: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop'
      };
    } else if (src.includes('monster')) {
      return {
        name: 'Monster',
        primary: 'bg-[#5f259f] text-white',
        hover: 'hover:bg-[#481c7a]',
        text: 'text-[#5f259f]',
        iconBg: 'bg-[#5f259f]/10',
        borderColor: 'border-[#5f259f]/20',
        pillText: 'Monster Quick Apply',
        banner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop'
      };
    } else if (src.includes('hirist')) {
      return {
        name: 'Hirist',
        primary: 'bg-[#00a896] text-white',
        hover: 'hover:bg-[#028074]',
        text: 'text-[#00a896]',
        iconBg: 'bg-[#00a896]/10',
        borderColor: 'border-[#00a896]/20',
        pillText: 'Hirist Tech Apply',
        banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop'
      };
    } else if (src.includes('timesjobs') || src.includes('times')) {
      return {
        name: 'TimesJobs',
        primary: 'bg-[#b31919] text-white',
        hover: 'hover:bg-[#851111]',
        text: 'text-[#b31919]',
        iconBg: 'bg-[#b31919]/10',
        borderColor: 'border-[#b31919]/20',
        pillText: 'TimesJobs Quick Apply',
        banner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop'
      };
    } else {
      return {
        name: source || 'Source Portal',
        primary: 'bg-cyan-500 text-slate-950',
        hover: 'hover:bg-cyan-400',
        text: 'text-cyan-400',
        iconBg: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        pillText: 'Platform Express Apply',
        banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop'
      };
    }
  };

  useEffect(() => {
    if (externalPortalModalOpen && simulatedJobForPortal) {
      const existingLetter = (selectedJobForLetter?.id === simulatedJobForPortal.id && generatedLetterText) ? generatedLetterText : "";
      setSimulatedCoverLetter(existingLetter);
      setPortalApplySuccess(false);
      setPortalApplying(false);
    }
  }, [externalPortalModalOpen, simulatedJobForPortal, selectedJobForLetter?.id, generatedLetterText]);

  // Load telemetry states
  const fetchTelemetryActivities = async () => {
    try {
      const res = await fetch('/api/user/activities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppliedJobs(data.applied || []);
        setAppliedJobsDetails(data.appliedDetails || []);
        setClickedJobs(data.clicked || []);
        setSentEmails(data.emails || []);
        setSupabaseEnabled(data.supabaseEnabled || false);
        setIsLiveSupabase(data.isLiveSupabase || false);
      }
    } catch (e) {
      console.error('Failed to load user interaction sync list', e);
    }
  };

  const checkSupabaseDetails = async () => {
    setIsCheckingSupabase(true);
    try {
      const res = await fetch('/api/supabase/check-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatusCheck(data);
      }
    } catch (e) {
      console.error('Failed to audit Supabase database connections', e);
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  // Load jobs and match ratings
  const fetchJobsAndMatches = async () => {
    setLoadingJobs(true);
    try {
      // Fetch normal jobs with full filters
      const queryParams = new URLSearchParams();
      if (locationModelFilter !== 'All') queryParams.append('locationModel', locationModelFilter);
      if (searchTerm) queryParams.append('search', searchTerm);
      if (recentlyPostedOnly) queryParams.append('recentlyPosted', 'true');
      if (countryFilter !== 'All') queryParams.append('country', countryFilter);
      if (sourceFilter !== 'All') queryParams.append('source', sourceFilter);

      const jobsRes = await fetch(`/api/jobs?${queryParams.toString()}`);
      const jobsData = await jobsRes.json();
      let jobList: Job[] = jobsData.jobs || [];

      // If user has uploaded resume, fetch analyzed AI matches
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

      // Sort original listings strictly descending by compatibility score when resume is present!
      if (user.resumeText && matchesList.length > 0) {
        jobList = [...jobList].sort((a, b) => {
          const scoreA = matchesList.find(m => m.jobId === a.id)?.score || 0;
          const scoreB = matchesList.find(m => m.jobId === b.id)?.score || 0;
          return scoreB - scoreA;
        });
      }

      setJobs(jobList);
      await fetchTelemetryActivities(); // Sync activities status at the same time!
    } catch (err: any) {
      console.error('Error loading jobs database:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Fetch unique available filters on startup or login
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch('/api/jobs/metadata');
        if (res.ok) {
          const data = await res.json();
          setAvailableCountries(data.countries || []);
          setAvailableSources(data.sources || []);
        }
      } catch (e) {
        console.error("Failed to load country/source metadata lists", e);
      }
    };
    fetchMeta();
  }, [token]);

  useEffect(() => {
    fetchJobsAndMatches();
  }, [user.resumeText, user.preferences, locationModelFilter, recentlyPostedOnly, countryFilter, sourceFilter, strictMatchFilter, token]);

  // Memoized sorted and filtered processed jobs list to ensure "everything is strictly relevant"
  const processedJobs = React.useMemo(() => {
    let list = [...jobs];
    
    // Sort logic: If user has uploaded resume, sort strictly by match score descending to present the best fits first!
    if (user.resumeText && matches.length > 0) {
      list.sort((a, b) => {
        const scoreA = matches.find(m => m.jobId === a.id)?.score || 0;
        const scoreB = matches.find(m => m.jobId === b.id)?.score || 0;
        return scoreB - scoreA;
      });
    }

    // Strict filter logic: If strictMatchFilter is active, ONLY display jobs where similarity score >= 60%!
    if (strictMatchFilter && user.resumeText) {
      list = list.filter(j => {
        const score = matches.find(m => m.jobId === j.id)?.score || 0;
        return score >= 60;
      });
    }

    return list;
  }, [jobs, matches, strictMatchFilter, user.resumeText]);

  // Securely log click event telemetry on user selection (persists to Supabase if config is live)
  const handleJobSelect = async (job: Job) => {
    const matchMetric = getMatchMetric(job.id);
    if (matchMetric) {
      setSelectedMatch(matchMetric);
    } else {
      setSelectedMatch({
        jobId: job.id,
        job,
        score: 0,
        reasons: ["Resume analysis needed to construct matched indicators.", "Fill preference dashboard on left panel."],
        matchingSkills: [],
        missingSkills: job.requirements
      });
    }

    try {
      const res = await fetch(`/api/jobs/${job.id}/click`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Silently reload Activities log to reflect the Viewed badge status
        fetchTelemetryActivities();
      }
    } catch (e) {
      console.error('Failed to dispatch click telemetry log:', e);
    }
  };

  const handleFetchSalaryEstimate = async (jobId: string, force = false) => {
    if (!force && salaryEstimates[jobId]) return;
    setFetchingSalary(true);
    setSalaryError(null);
    try {
      const res = await fetch('/api/salary-estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to acquire salary comparison indexes.');
      setSalaryEstimates(prev => ({ ...prev, [jobId]: data }));
    } catch (err: any) {
      console.error('Salary benchmark fetch error:', err);
      setSalaryError(err.message || 'Error occurred retrieving salary benchmarks.');
    } finally {
      setFetchingSalary(false);
    }
  };

  useEffect(() => {
    if (selectedMatch?.jobId) {
      handleFetchSalaryEstimate(selectedMatch.jobId);
    }
  }, [selectedMatch?.jobId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobsAndMatches();
  };

  const handlePreferencesSave = async (newPrefs: Preferences) => {
    setUpdatingPrefs(true);
    setErrorText(null);
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPrefs)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user preferences.');
      
      onUserUpdate(data.user);
      setActiveTab('profile'); // Switch back to summary
    } catch (err: any) {
      setErrorText(err.message || 'Preferences update error');
    } finally {
      setUpdatingPrefs(false);
    }
  };

  const handleResumeUpload = async (fileContent: { text?: string; base64?: string }, fileName: string) => {
    setUploadingResume(true);
    setErrorText(null);
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
      setStrictMatchFilter(true);
    } catch (err: any) {
      setErrorText(err.message || 'Resume upload failed. Try ensuring the Gemini API key is configured correctly.');
    } finally {
      setUploadingResume(false);
    }
  };

  const triggerGenerateCoverLetter = async () => {
    if (!selectedJobForLetter) return;
    setGeneratingLetter(true);
    setGeneratedLetterText('');
    setErrorText(null);
    try {
      const res = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: selectedJobForLetter.id,
          customInstructions: customLetterInstructions
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to draft AI letter.');

      setGeneratedLetterText(data.coverLetter);
    } catch (err: any) {
      setErrorText(err.message || 'Letter generation failed.');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetterText);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  // Safe helper to find the matching metrics for a job
  const getMatchMetric = (jobId: string): MatchResult | undefined => {
    return matches.find(m => m.jobId === jobId);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] relative flex flex-col overflow-x-hidden text-slate-100 font-sans pb-10">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/15 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
            <Building className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NexGen AI Jobs
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">Candidate Session</p>
            <p className="text-sm font-semibold text-white">{user.fullName}</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-cyan-500/50 p-0.5 bg-slate-800 flex items-center justify-center text-xs text-cyan-400 font-bold uppercase">
            {user.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <button
            id="nav-logout-btn"
            onClick={onLogout}
            title="Log out from portal"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Dynamic View Toggler for Global Navigation */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-2xl p-1 flex gap-2 w-full">
          <button
            id="view-matchmaking-btn"
            onClick={() => setCurrentView('matchmaking')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              currentView === 'matchmaking'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Job Vacancy Matchmaking Hub ({jobs.length} Active Listings)
          </button>
          
          <button
            id="view-trajectory-btn"
            onClick={() => setCurrentView('trajectory')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              currentView === 'trajectory'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white border border-cyan-400/30'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            AI Career Roadmap & Resume Optimizer
          </button>
        </div>
      </div>

      {/* Main Error Alert */}
      {errorText && (
        <div className="relative z-20 max-w-7xl mx-auto mt-4 px-6 w-full">
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl p-4 flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="text-xs font-semibold flex-1">{errorText}</div>
            <button
              onClick={() => setErrorText(null)}
              className="text-xs font-extrabold hover:text-white px-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Success Application Toast Conforming to Spec */}
      {showDirectApplyToast && (
        <div className="relative z-20 max-w-7xl mx-auto mt-4 px-6 w-full">
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl p-4 flex gap-3 items-center shadow-lg animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs font-semibold flex-1">
              Direct Application Transmitted! Your ATS-profile package & customized letter for <strong className="text-white">"{showDirectApplyToast}"</strong> was securely Synced and Dispatched. Status: <span className="font-extrabold text-emerald-300">PENDING AUDIT</span>.
            </div>
            <button
              onClick={() => setShowDirectApplyToast(null)}
              className="text-xs font-bold hover:text-white px-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      {currentView === 'matchmaking' ? (
        <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
        
        {/* Left Column (span 3): Resume score dial & preferences summary */}
        <section className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Profile & ATS Score Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Resume AI Analysis</h2>
              <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-full">
                ATS Engine
              </span>
            </div>

            {user.analysis ? (
              <div className="flex flex-col items-center">
                {/* SVG Radial Meter */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="54" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 54}`} 
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - user.analysis.score / 100)}`} 
                      className="text-cyan-400 transition-all duration-1000" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4.5xl font-extrabold leading-none tracking-tight text-white">{user.analysis.score}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-1">Impact Score</span>
                  </div>
                </div>

                <p className="mt-4 text-center text-xs text-slate-300 px-2 line-clamp-2 italic">
                  &ldquo;{user.analysis.executiveSummary}&rdquo;
                </p>

                {/* Tabs to switch edit profile, targets, or see telemetry history log */}
                <div className="mt-6 w-full grid grid-cols-3 gap-1 bg-slate-950/40 p-1 rounded-xl border border-white/5 font-sans">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-1.5 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer truncate ${activeTab === 'profile' ? 'bg-white/10 text-white font-extrabold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Skills & Gaps
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`py-1.5 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer truncate ${activeTab === 'preferences' ? 'bg-white/10 text-white font-extrabold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Edit Targets
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('activity');
                      fetchTelemetryActivities();
                      checkSupabaseDetails();
                    }}
                    className={`py-1.5 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer truncate ${activeTab === 'activity' ? 'bg-white/10 text-white font-extrabold text-[#22d3ee]' : 'text-slate-400 hover:text-white'}`}
                  >
                    History Log
                  </button>
                </div>

                {/* Tab content inside sidebar */}
                <div className="mt-5 w-full text-left space-y-4">
                  {activeTab === 'profile' ? (
                    <>
                      {/* Identified Gaps */}
                      {user.analysis.skillGaps && user.analysis.skillGaps.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Identified skill Gaps</p>
                          <div className="flex flex-wrap gap-1">
                            {user.analysis.skillGaps.map((gap, idx) => (
                              <span key={idx} className="bg-rose-500/10 text-rose-300 text-[9px] font-bold px-2 py-0.5 rounded border border-rose-500/20">
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* keyStrengths */}
                      {user.analysis.keyStrengths && user.analysis.keyStrengths.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Key Resume Strengths</p>
                          <ul className="space-y-1">
                            {user.analysis.keyStrengths.map((str, idx) => (
                              <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1">
                                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                                <span className="leading-tight">{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* parsedSkills */}
                      {user.analysis.parsedSkills && user.analysis.parsedSkills.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Parsed Technologies</p>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                            {user.analysis.parsedSkills.map((sk, idx) => (
                              <span key={idx} className="bg-white/5 text-slate-300 text-[9px] px-2 py-0.5 rounded">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* suggestedImprovements */}
                      {user.analysis.suggestedImprovements && user.analysis.suggestedImprovements.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Suggested Improvements</p>
                          <div className="bg-indigo-950/20 rounded-xl p-3 border border-indigo-500/10 text-[11px] text-slate-300 italic">
                            {user.analysis.suggestedImprovements[0]}
                          </div>
                        </div>
                      )}
                    </>
                  ) : activeTab === 'preferences' ? (
                    <PreferencesForm 
                      initialPreferences={user.preferences} 
                      onSave={handlePreferencesSave} 
                      isLoading={updatingPrefs} 
                    />
                  ) : (
                    // Display Activity & Supabase Sync history log
                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                      {/* Database Connection Tracker */}
                      <div className="bg-slate-950/40 border border-white/5 p-3 rounded-2xl flex flex-col gap-2 font-sans">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-slate-400 uppercase">Supabase Status</span>
                          {supabaseEnabled ? (
                            isLiveSupabase ? (
                              <span className="text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live Sync Connected
                              </span>
                            ) : (
                              <span className="text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Tables Missing / Soft Mode
                              </span>
                            )
                          ) : (
                            <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              Local db.json
                            </span>
                          )}
                        </div>
                        
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          {supabaseEnabled && isLiveSupabase 
                            ? "Authenticating & mirroring credentials continuously. Your profiles, clicks, and dispatched application metrics are secure in Supabase."
                            : supabaseEnabled 
                              ? "Supabase API client is online but target collections cannot be queried. Run the DB schema definition scripts below."
                              : "Operating in safe-mode offline database. To bind multiple profiles & preserve logs persistently, add Supabase secrets."}
                        </p>

                        {/* Live Table Auditing Check */}
                        {supabaseEnabled && (
                          <div className="mt-1 pt-2 border-t border-white/5 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Cloud Schema Integrity</span>
                              <button
                                onClick={checkSupabaseDetails}
                                disabled={isCheckingSupabase}
                                className="text-[9px] text-cyan-400 hover:text-cyan-300 underline font-semibold focus:outline-none cursor-pointer"
                              >
                                {isCheckingSupabase ? "Auditing Cloud..." : "Audit Tables Now"}
                              </button>
                            </div>

                            {supabaseStatusCheck ? (
                              <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                                <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className={supabaseStatusCheck.tables?.users ? "text-emerald-400 font-bold" : "text-rose-450 font-bold"}>
                                      {supabaseStatusCheck.tables?.users ? "✓" : "✗"}
                                    </span>
                                    <span className="text-slate-300 font-mono">users</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={supabaseStatusCheck.tables?.job_applications ? "text-emerald-400 font-bold" : "text-rose-450 font-bold"}>
                                      {supabaseStatusCheck.tables?.job_applications ? "✓" : "✗"}
                                    </span>
                                    <span className="text-slate-300 font-mono">job_applications</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={supabaseStatusCheck.tables?.job_clicks ? "text-emerald-400 font-bold" : "text-rose-450 font-bold"}>
                                      {supabaseStatusCheck.tables?.job_clicks ? "✓" : "✗"}
                                    </span>
                                    <span className="text-slate-300 font-mono">job_clicks</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={supabaseStatusCheck.tables?.job_emails ? "text-emerald-400 font-bold" : "text-rose-450 font-bold"}>
                                      {supabaseStatusCheck.tables?.job_emails ? "✓" : "✗"}
                                    </span>
                                    <span className="text-slate-300 font-mono">job_emails</span>
                                  </div>
                                </div>
                                {Object.values(supabaseStatusCheck.tables || {}).some(v => !v) && (
                                  <p className="text-[8.5px] text-amber-300/90 leading-normal pt-1.5 border-t border-white/5 select-text font-medium">
                                    Notice: Missing tables found. Copy the SQL definitions below, paste them into your Supabase SQL Editor and execute them.
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-[8.5px] text-slate-500 italic">Verify remote table sync channels are active.</p>
                            )}
                          </div>
                        )}

                        <details className="text-[9px] text-cyan-400 font-semibold cursor-pointer select-none">
                          <summary className="hover:underline focus:outline-none">Get Supabase SQL Tables Blueprint</summary>
                          <pre className="mt-2 bg-[#020617] text-slate-300 p-2.5 rounded-xl border border-white/5 overflow-x-auto text-[8px] leading-relaxed select-text font-mono max-h-40">
{`-- Run inside your Supabase SQL editor:

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  profile_completed BOOLEAN DEFAULT false,
  preferences JSONB,
  resume_text TEXT,
  resume_file_name TEXT,
  analysis JSONB
);

CREATE TABLE IF NOT EXISTS job_clicks (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  job_id TEXT,
  job_title TEXT,
  company TEXT,
  source TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS job_applications (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  job_id TEXT,
  job_title TEXT,
  company TEXT,
  source TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  cover_letter TEXT,
  status TEXT DEFAULT 'PENDING_AUDIT'
);

CREATE TABLE IF NOT EXISTS job_emails (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  job_id TEXT,
  job_title TEXT,
  company TEXT,
  hr_email TEXT,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Crucial: Disable Row Level Security (RLS) to permit direct REST inserts under the anon key during testing:
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_clicks DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_emails DISABLE ROW LEVEL SECURITY;`}
                          </pre>
                        </details>
                      </div>

                      {/* Emailed HR Contacts History */}
                      <div className="space-y-2 font-sans">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Sent HR Emails ({sentEmails.length})</p>
                        {sentEmails.length === 0 ? (
                          <p className="text-[10px] text-slate-500 italic">No direct HR emails sent yet.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {sentEmails.map((mail, idx) => (
                              <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-2 text-left space-y-1 text-[11px]">
                                <div className="flex justify-between items-center text-[9px]">
                                  <span className="font-bold text-cyan-400 uppercase truncate max-w-[65%]">{mail.company}</span>
                                  <span className="text-slate-500">{new Date(mail.sentAt).toLocaleDateString()}</span>
                                </div>
                                <p className="font-semibold text-slate-200 text-[10px] truncate">{mail.jobTitle}</p>
                                <p className="text-slate-400 text-[9.5px] truncate font-mono">To: {mail.hrEmail}</p>
                                <details className="text-[8.5px] text-cyan-400 cursor-pointer select-none">
                                  <summary className="hover:underline focus:outline-none">Show message details</summary>
                                  <div className="mt-1 bg-slate-950/80 p-2 rounded-lg border border-white/5 text-[9px] text-slate-300 leading-normal max-h-24 overflow-y-auto whitespace-pre-wrap select-text selection:bg-cyan-500/20">
                                    <p className="font-bold border-b border-white/5 pb-1 mb-1">Subject: {mail.subject}</p>
                                    <p>{mail.body}</p>
                                  </div>
                                </details>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Applied jobs tracker list - Structured Detailed View */}
                      <div className="space-y-3 pt-3 border-t border-white/5 font-sans">
                        <div className="flex justify-between items-center pb-1">
                          <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Applications Sent ({appliedJobsDetails.length})</p>
                          <span className="text-[9px] text-slate-500 font-medium">Full Status Logs</span>
                        </div>
                        {appliedJobsDetails.length === 0 ? (
                          <div className="text-center py-4 bg-slate-950/20 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-500 italic leading-relaxed">No job applications submitted yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {appliedJobsDetails.map((app, idx) => {
                              const job = jobs.find(j => j.id === app.jobId);
                              const formattedDate = new Date(app.appliedAt).toLocaleString();
                              return (
                                <div key={idx} className="bg-slate-950/40 border border-white/5 rounded-2xl p-3 text-left space-y-2 text-[11px] hover:border-cyan-400/30 transition-all">
                                  <div className="flex justify-between items-start gap-1">
                                    <div>
                                      <h5 className="font-extrabold text-white text-[11px] leading-snug">{app.jobTitle}</h5>
                                      <p className="text-slate-400 text-[10px] font-semibold">{app.company} &bull; <span className="text-[9px] font-mono text-cyan-400 font-bold">{app.source}</span></p>
                                    </div>
                                    <span className="text-[8px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-extrabold shrink-0 uppercase tracking-wide">
                                      {app.status || "PENDING"}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 text-[9px] pt-1.5 border-t border-white/5">
                                    <span className="text-slate-500 font-mono">{formattedDate}</span>
                                    {job && (
                                      <button
                                        onClick={() => handleJobSelect(job)}
                                        className="text-cyan-400 hover:text-cyan-300 font-semibold uppercase tracking-wider text-[8px] hover:underline cursor-pointer bg-white/5 px-2 py-0.5 rounded transition-all"
                                      >
                                        Locate Listing &rarr;
                                      </button>
                                    )}
                                  </div>

                                  {app.coverLetter ? (
                                    <details className="text-[9px] text-cyan-400 font-semibold cursor-pointer select-none">
                                      <summary className="hover:underline focus:outline-none">Show Tailored Cover Pitch</summary>
                                      <div className="mt-1.5 bg-[#020617] p-2.5 rounded-xl border border-white/5 text-[9.5px] text-slate-300 leading-normal max-h-24 overflow-y-auto whitespace-pre-wrap select-text selection:bg-cyan-500/20 font-sans cursor-text font-normal">
                                        {app.coverLetter}
                                      </div>
                                    </details>
                                  ) : (
                                    <p className="text-[8.5px] text-slate-500 italic">No custom cover pitch submitted.</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center py-6 text-center">
                <div className="p-3 bg-white/5 rounded-full border border-white/10 mb-3 animate-pulse">
                  <Cpu className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Locked: ATS Resume Fit</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-normal">
                  Upload your text resume inside the companion controller below to calculate match score percentages against active job boards.
                </p>
              </div>
            )}
          </div>

          {/* Resume Upload Panel */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col">
            <ResumeUploader 
              onUploadSuccess={handleResumeUpload} 
              isLoading={uploadingResume} 
              currentFileName={user.resumeFileName} 
            />
          </div>

          {/* Succeeding Industry Trends Panel */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Succeeding Industry Trends
            </h4>
            <div className="space-y-4 font-sans">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300 font-semibold text-[11px]">Generative AI Specialist</span>
                  <span className="text-emerald-400 font-bold text-[11px]">+28.3%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full w-[85%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300 font-semibold text-[11px]">Distributed Architecture</span>
                  <span className="text-emerald-400 font-bold text-[11px]">+16.1%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[65%]"></div>
                </div>
              </div>
              <div className="pt-1 text-[9.5px] text-slate-500 italic leading-snug">
                &ldquo;Calculated based on real-time metadata indexing patterns of hiring agencies globally.&rdquo;
              </div>
            </div>
          </div>

        </section>

        {/* Middle Column (span 8): Live matching feed cards and expanded inline center apply panels */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                AI Matchmaking Engine
              </h1>
              <div className="flex gap-1">
                <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-full border border-cyan-500/20 uppercase">
                  Live indexing
                </span>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  id="job-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none placeholder:text-slate-650"
                  placeholder="Query roles, technologies or locations..."
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Country and Source select controls */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/20 p-2 rounded-2xl border border-white/5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Country Scope
                </label>
                <select
                  id="country-filter-select"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="bg-[#0f172a] border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="All">All Countries (Global)</option>
                  {availableCountries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" /> Platform Source
                </label>
                <select
                  id="source-filter-select"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-[#0f172a] border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="All">All Portals (LinkedIn, Naukri, Hirist...)</option>
                  {availableSources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 text-[11px]">
              <button 
                id="filter-all-btn"
                onClick={() => setLocationModelFilter('All')}
                className={`px-3 py-1 rounded-full border transition-all shrink-0 cursor-pointer ${locationModelFilter==='All'?'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-bold':'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                Any Model
              </button>
              <button 
                id="filter-remote-btn"
                onClick={() => setLocationModelFilter('Remote')}
                className={`px-3 py-1 rounded-full border transition-all shrink-0 cursor-pointer ${locationModelFilter==='Remote'?'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-bold':'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                Remote Only
              </button>
              <button 
                id="filter-hybrid-btn"
                onClick={() => setLocationModelFilter('Hybrid')}
                className={`px-3 py-1 rounded-full border transition-all shrink-0 cursor-pointer ${locationModelFilter==='Hybrid'?'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-bold':'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                Hybrid
              </button>
              <button 
                id="filter-onsite-btn"
                onClick={() => setLocationModelFilter('Onsite')}
                className={`px-3 py-1 rounded-full border transition-all shrink-0 cursor-pointer ${locationModelFilter==='Onsite'?'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-bold':'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                On-site
              </button>
              
              <div className="ml-auto flex items-center pr-1.5 gap-3">
                {user.resumeText && (
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors text-slate-400">
                    <input
                      type="checkbox"
                      checked={strictMatchFilter}
                      onChange={(e) => setStrictMatchFilter(e.target.checked)}
                      className="rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="text-cyan-400 font-bold text-[10.5px]">Strict Match</span>
                  </label>
                )}
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors text-slate-400">
                  <input
                    type="checkbox"
                    checked={recentlyPostedOnly}
                    onChange={(e) => setRecentlyPostedOnly(e.target.checked)}
                    className="rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-0 w-3 h-3 cursor-pointer"
                  />
                  <span>Recent</span>
                </label>
              </div>
            </div>
            
          </div>

          {/* Live Cards Scroll container */}
          <div className="space-y-3.5 max-h-[700px] overflow-y-auto pr-1">
            {loadingJobs ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs text-slate-500 font-bold">Querying available listings databases...</span>
              </div>
            ) : processedJobs.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
                <p className="text-xs text-slate-400">No vacancies matched current search filters.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setLocationModelFilter('All'); setRecentlyPostedOnly(false); setStrictMatchFilter(false); }}
                  className="mt-3 text-cyan-400 text-xs font-semibold hover:underline cursor-pointer"
                >
                  Clear search terms
                </button>
              </div>
            ) : (
              <>
                {/* AI Best Fit Recommendation Featured Block */}
                {user.resumeText && processedJobs.length > 0 && (
                  (() => {
                    const bestJob = processedJobs[0];
                    const bestMatch = matches.find(m => m.jobId === bestJob.id);
                    if (!bestMatch || bestMatch.score < 70) return null; // Only recommend if score is high

                    const isCurrentlySelected = selectedMatch?.jobId === bestJob.id;

                    return (
                      <div 
                        onClick={() => handleJobSelect(bestJob)}
                        className={`relative overflow-hidden rounded-3xl p-5 border cursor-pointer transition-all mb-4 ${
                          isCurrentlySelected 
                            ? 'bg-gradient-to-br from-cyan-950/45 to-indigo-950/45 border-cyan-400 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-400/30' 
                            : 'bg-gradient-to-br from-cyan-950/25 to-indigo-950/15 border-cyan-500/30 hover:border-cyan-400/80 shadow-md hover:shadow-lg hover:bg-white/5'
                        }`}
                      >
                        {/* Featured Sticker */}
                        <div className="absolute top-0 right-0 px-2.5 py-1 bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 text-[9px] font-black uppercase tracking-widest rounded-bl-xl select-none flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} />
                          Best AI Match ({bestMatch.score}%)
                        </div>

                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-cyan-300 text-lg border border-cyan-500/20 shadow-lg shrink-0 select-none uppercase">
                            {bestJob.logo}
                          </div>

                          <div className="flex-grow min-w-0 pr-12">
                            <span className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase block mb-0.5">
                              Recommended Career Destination
                            </span>
                            <h4 className="font-extrabold text-sm text-white hover:text-cyan-300 transition-colors truncate">
                              {bestJob.title}
                            </h4>
                            <p className="text-xs text-slate-400 truncate mb-1">
                              {bestJob.company} • <span className="text-slate-400 font-bold">{bestJob.location} ({bestJob.locationModel})</span>
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mb-2">
                              {bestMatch.matchingSkills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="text-[9px] bg-cyan-950/80 border border-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md font-mono font-bold">
                                  ✓ {skill}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-2">
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                Aligned on <span className="text-emerald-400 font-bold">{bestMatch.matchingSkills.length}</span> key profile requirements
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-cyan-400 font-bold italic">Apply to best fit first</span>
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Sublist heading */}
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-2.5 pl-1 select-none flex items-center justify-between">
                  <span>Available Match Vacancies ({processedJobs.length})</span>
                  {user.resumeText && <span className="text-cyan-400 lowercase normal-case font-normal text-right">Sorted by compatibility rating</span>}
                </div>

                {processedJobs.map((job) => {
                const matchMetric = getMatchMetric(job.id);
                const hasScore = matchMetric !== undefined;
                const score = hasScore ? matchMetric.score : 0;
                
                // Color mapping for score badges
                let scoreColorClass = "text-amber-400 bg-amber-400/10 border border-amber-400/20";
                if (score >= 85) {
                  scoreColorClass = "text-cyan-400 bg-cyan-400/10 border border-cyan-400/20";
                } else if (score < 70 && score > 0) {
                  scoreColorClass = "text-slate-400 bg-slate-400/10 border border-white/5";
                }

                const isCurrentlySelected = selectedMatch?.jobId === job.id;

                return (
                  <div
                    key={job.id}
                    onClick={() => handleJobSelect(job)}
                    className={`group border rounded-3xl p-5 flex flex-col gap-4.5 transition-all cursor-pointer ${
                      isCurrentlySelected 
                        ? 'bg-slate-900/80 border-cyan-400 shadow-xl shadow-cyan-950/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Upper Row Header info */}
                    <div className="flex gap-4.5">
                      <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-white text-lg tracking-wider border border-white/5 select-none uppercase shadow-inner shrink-0 leading-none">
                        {job.logo}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-extrabold text-sm text-white group-hover:text-cyan-300 transition-colors flex flex-wrap items-center gap-1.5 truncate">
                              <span className="truncate">{job.title}</span>
                              {appliedJobs.includes(job.id) && (
                                <span className="shrink-0 bg-emerald-500/15 text-emerald-300 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wide">
                                  Applied
                                </span>
                              )}
                              {clickedJobs.includes(job.id) && (
                                <span className="shrink-0 bg-slate-500/15 text-slate-400 text-[8.5px] font-semibold px-1.5 py-0.5 rounded border border-white/5 uppercase">
                                  Viewed
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5 flex flex-wrap items-center gap-1">
                              <span className="font-bold text-slate-300">{job.company}</span>
                              <span>&bull;</span>
                              <span className="italic">{job.location} ({job.locationModel})</span>
                              {job.country && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-[10.5px] text-cyan-400 font-extrabold uppercase">{job.country}</span>
                                </>
                              )}
                              {job.source && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-[9.5px] text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">{job.source}</span>
                                </>
                              )}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            {user.resumeText ? (
                              hasScore ? (
                                <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full ${scoreColorClass}`}>
                                  {score}% MATCH
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-400 italic">calibrating tech index...</span>
                              )
                            ) : (
                              <span 
                                title="Please upload resume to check score"
                                className="text-[9px] font-medium text-slate-500 bg-slate-950/40 border border-white/5 px-2 py-0.5 rounded"
                              >
                                Match Locked
                              </span>
                            )}
                            <p className="text-[10px] text-slate-500 mt-1 font-mono">{job.salaryRange}</p>
                          </div>
                        </div>

                        {/* Collapsed view only displays truncated detail block */}
                        {!isCurrentlySelected && (
                          <>
                            <p className="text-slate-400 text-[11px] leading-relaxed mt-2.5 line-clamp-2">
                              {job.description}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-1">
                              {job.tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="px-2 py-0.5 bg-white/5 group-hover:bg-cyan-500/5 hover:text-cyan-300 rounded text-[9px] text-slate-450 font-medium transition-colors">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded inline Apply & calibration block */}
                    {isCurrentlySelected && (
                      <div 
                        className="border-t border-white/5 pt-4.5 space-y-5" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Company vacancy context summary */}
                        <div className="space-y-1.5">
                          <h4 className="text-[10.5px] uppercase tracking-wider font-extrabold text-cyan-400 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-cyan-400" /> Full Position Description
                          </h4>
                          <p className="text-[11.5px] leading-relaxed text-slate-300 bg-slate-950/30 p-3.5 rounded-2xl border border-white/5 whitespace-pre-wrap select-text">
                            {job.description}
                          </p>
                        </div>

                        {/* Duties and responsibilities */}
                        {job.responsibilities && job.responsibilities.length > 0 && (
                          <div className="space-y-1.5">
                            <h4 className="text-[10.5px] uppercase tracking-wider font-extrabold text-cyan-400 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Core Duties & Responsibilities
                            </h4>
                            <ul className="text-[11px] text-slate-300 space-y-1.5 font-sans">
                              {job.responsibilities.map((resp, i) => (
                                <li key={i} className="flex gap-2 items-start bg-slate-950/25 px-3 py-2 rounded-xl border border-white/5">
                                  <span className="text-emerald-450 font-bold text-xs select-none mt-0.5">✓</span>
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tech Stack elements */}
                        <div className="space-y-1.5">
                          <h4 className="text-[10.5px] uppercase tracking-wider font-extrabold text-cyan-400 flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" /> Requested Technical Profile
                          </h4>
                          <div className="flex flex-wrap gap-1.5 bg-slate-950/20 p-2.5 rounded-2xl border border-white/5">
                            {job.requirements.map((req, i) => {
                              const isMatching = user.analysis?.parsedSkills?.some(
                                s => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase())
                              );
                              return (
                                <span 
                                  key={i} 
                                  className={`text-[9.5px] px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1 ${
                                    isMatching 
                                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                                      : 'bg-white/5 text-slate-400 border border-white/5'
                                  }`}
                                >
                                  {isMatching ? '✓' : '•'} {req}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Advanced ATS rating segment with radar visualization */}
                        <div className="bg-gradient-to-r from-cyan-950/25 to-indigo-950/25 p-5 rounded-3xl border border-cyan-500/20 space-y-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-cyan-300">AI ATS Deep Alignment Analytics</h4>
                          </div>

                          {user.resumeText ? (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                              {/* Left parameters metrics */}
                              <div className="col-span-1 md:col-span-5 space-y-3.5 flex flex-col justify-between">
                                <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5 space-y-2">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400 font-medium">Calibrated ATS Score</span>
                                    <span className="text-cyan-400 font-bold font-mono">{score}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-cyan-400 rounded-full transition-all duration-1000" 
                                      style={{ width: `${score}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2.5 text-[10px] flex-1 mt-2.5">
                                  <div>
                                    <span className="text-emerald-400 font-bold block mb-1">✓ Matching Requirements ({selectedMatch?.matchingSkills?.length || 0})</span>
                                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                                      {selectedMatch?.matchingSkills?.map(s => (
                                        <span key={s} className="bg-emerald-400/5 text-emerald-300 px-1.5 py-0.5 rounded text-[9.5px] border border-emerald-500/10 font-medium">
                                          {s}
                                        </span>
                                      ))}
                                      {(!selectedMatch?.matchingSkills || selectedMatch.matchingSkills.length === 0) && (
                                        <span className="text-slate-500 italic text-[9.5px]">No matches detected.</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-1">
                                    <span className="text-rose-400 font-bold block mb-1">✗ Gaps to Bridge ({selectedMatch?.missingSkills?.length || 0})</span>
                                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                                      {selectedMatch?.missingSkills?.map(s => (
                                        <span key={s} className="bg-rose-400/5 text-rose-300 px-1.5 py-0.5 rounded text-[9.5px] border border-rose-500/10 font-medium font-mono">
                                          {s}
                                        </span>
                                      ))}
                                      {(!selectedMatch?.missingSkills || selectedMatch.missingSkills.length === 0) && (
                                        <span className="text-slate-550 italic text-[9.5px]">Excellent score coverage achieved!</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right graphics section */}
                              <div className="col-span-1 md:col-span-7 space-y-3.5 flex flex-col justify-between">
                                <div className="bg-slate-950/30 p-2.5 rounded-2xl border border-white/5 overflow-hidden flex justify-center items-center">
                                  <SkillRadarChart 
                                    requirements={job.requirements}
                                    matchingSkills={selectedMatch?.matchingSkills || []}
                                    missingSkills={selectedMatch?.missingSkills || []}
                                    jobTitle={job.title}
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-450 block">Core Compatibility Logic Reasoning</span>
                                  <ul className="space-y-1 text-[10.5px] text-slate-355 leading-relaxed list-none">
                                    {selectedMatch?.reasons?.map((reason, idx) => (
                                      <li key={idx} className="flex gap-2 items-start">
                                        <span className="text-cyan-400 font-mono font-bold leading-none select-none mt-1">&bull;</span>
                                        <span>{reason}</span>
                                      </li>
                                    ))}
                                    {(!selectedMatch?.reasons || selectedMatch.reasons.length === 0) && (
                                      <li className="text-slate-550 italic">Evaluating credentials matching indices...</li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-950/40 p-4 rounded-3xl border border-white/5 text-center text-xs text-slate-450 leading-relaxed">
                              Configure and upload your credentials document on the Left Companion Sidebar to run deep structural compatibility mapping.
                            </div>
                          )}
                        </div>

                        {/* Real-time market averages segment */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Live Regional Compensation Benchmarks
                            </span>
                            {salaryEstimates[job.id] && (
                              <span className="text-[9px] font-mono font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full uppercase border border-emerald-500/20">
                                Simulated confidence: {salaryEstimates[job.id].confidenceScore}%
                              </span>
                            )}
                          </div>

                          {fetchingSalary ? (
                            <div className="flex items-center gap-2 py-2 text-slate-500 text-[10.5px]">
                              <svg className="animate-spin h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Contacting region compensation matrices indexes...</span>
                            </div>
                          ) : salaryError ? (
                            <div className="flex justify-between items-center text-[10.5px]">
                              <span className="text-slate-500">Failed to load system estimates fallback.</span>
                              <button 
                                onClick={() => handleFetchSalaryEstimate(job.id, true)}
                                className="text-cyan-400 hover:underline hover:text-cyan-300 text-[10px] font-bold cursor-pointer"
                              >
                                Retry search parameters
                              </button>
                            </div>
                          ) : salaryEstimates[job.id] ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between">
                                <div className="flex justify-between text-[10px] mb-2 text-slate-400">
                                  <span className="font-semibold text-slate-400">Regional Comparison:</span>
                                  <span className="text-[#34d399] font-bold uppercase">{salaryEstimates[job.id].comparisonStatus}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full flex overflow-hidden">
                                  <div className="h-full bg-rose-500/10 w-1/3 border-r border-slate-950"></div>
                                  <div className="h-full bg-cyan-500/10 w-1/3 border-r border-slate-950"></div>
                                  <div className="h-full bg-emerald-500/10 w-1/3"></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2 leading-tight">
                                  <span>Low<br />{salaryEstimates[job.id].currency}{salaryEstimates[job.id].marketLow?.toLocaleString()}</span>
                                  <span className="text-cyan-400 font-bold text-center">Average<br />{salaryEstimates[job.id].currency}{salaryEstimates[job.id].marketAverage?.toLocaleString()}</span>
                                  <span className="text-right">High<br />{salaryEstimates[job.id].currency}{salaryEstimates[job.id].marketHigh?.toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="text-[10.5px] text-slate-355 leading-relaxed flex flex-col justify-center">
                                <p className="italic text-slate-450 mb-1">Telemetry Grounding Analysis:</p>
                                <p>{salaryEstimates[job.id].marketInsights}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-left py-1">
                              <button
                                onClick={() => handleFetchSalaryEstimate(job.id, true)}
                                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-cyan-400 text-[10.5px] font-bold border border-white/5 rounded-xl transition-all shadow cursor-pointer text-center"
                              >
                                Unlock Regional Salary Index Rating
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Customized tailored statement drafts */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-purple-400" /> Tailored Cover Letter Draft Generator
                            </span>
                            {generatedLetterText && selectedJobForLetter?.id === job.id && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(generatedLetterText);
                                  setCopyStatus(true);
                                  setTimeout(() => setCopyStatus(false), 2050);
                                }}
                                className="text-[9.5px] text-cyan-400 font-bold bg-cyan-500/5 hover:bg-cyan-550/10 px-2 py-0.5 rounded border border-cyan-400/15 cursor-pointer"
                              >
                                {copyStatus ? '✓ Copied text' : 'Copy letter body'}
                              </button>
                            )}
                          </div>

                          {selectedJobForLetter?.id === job.id ? (
                            <div className="space-y-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase font-bold text-slate-505">Provide directives (e.g. emphasize system migration)</label>
                                <textarea
                                  value={customLetterInstructions}
                                  onChange={(e) => setCustomLetterInstructions(e.target.value)}
                                  rows={2}
                                  className="bg-slate-950/60 p-2.5 border border-white/10 rounded-xl text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-655 resize-none w-full leading-normal"
                                  placeholder="e.g. prioritize microservices, keep tone professional but warm..."
                                />
                              </div>

                              <div className="flex gap-2.5">
                                <button
                                  onClick={() => setSelectedJobForLetter(null)}
                                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10.5px] font-bold text-slate-400 cursor-pointer"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={triggerGenerateCoverLetter}
                                  disabled={generatingLetter}
                                  className="flex-1.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl text-[10.5px] flex items-center justify-center gap-1.5 disabled:opacity-40 shadow cursor-pointer"
                                >
                                  {generatingLetter ? (
                                    <>
                                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                      </svg>
                                      <span>Calibrating draft...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 text-purple-202 animate-pulse" />
                                      Generate Pitch Letter
                                    </>
                                  )}
                                </button>
                              </div>

                              {generatedLetterText && (
                                <div className="mt-3 bg-slate-950/60 p-3 rounded-2xl border border-white/5 max-h-48 overflow-y-auto text-[10.5px] text-slate-355 leading-relaxed font-sans select-text whitespace-pre-wrap selection:bg-cyan-500/20">
                                  {generatedLetterText}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedJobForLetter(job);
                                  setGeneratedLetterText('');
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-purple-300 hover:text-purple-200 font-bold text-[10.5px] border border-white/5 rounded-xl transition-all cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-purple-400" />
                                Draft Tailored Cover Letter using AI
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Interactive handshakes and apply triggers */}
                        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row gap-2.5">
                          {/* Live Simulator Link */}
                          <button
                            type="button"
                            onClick={() => {
                              setSimulatedJobForPortal(job);
                              setExternalPortalModalOpen(true);
                            }}
                            className="flex-1 py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                            Apply on {job.source || 'Listing Portal'} (Live Simulator)
                          </button>

                          {/* Direct email hr manager */}
                          <button
                            onClick={() => {
                              setEmailHrRecipient(job.hrEmail || `careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`);
                              setEmailSubject(`Application: ${job.title} - ${user.fullName}`);
                              setEmailBody(generatedLetterText && selectedJobForLetter?.id === job.id ? generatedLetterText : `Dear Hiring Team,\n\nI am incredibly excited to submit my tailored profile and credentials for the ${job.title} vacancy at ${job.company}.\n\nBased on my uploaded resume details, I possess strong alignment with your requested requirements: ${(job.requirements.slice(0, 3)).join(", ")}.\n\nWarm regards,\n${user.fullName}\n${user.email}`);
                              setEmailSendSuccess(false);
                              setEmailModalOpen(true);
                            }}
                            className="flex-1 py-2 px-3 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/25 text-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5 text-purple-400" />
                            Email HR Poster Direct
                          </button>

                          {/* Direct database sync sync */}
                          {appliedJobs.includes(job.id) ? (
                            <div className="flex-1 py-1.5 px-3 bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 select-none text-center leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Dispatched to Pipeline
                            </div>
                          ) : (
                            <button
                              disabled={applyingJobId !== null}
                              onClick={async () => {
                                setApplyingJobId(job.id);
                                setErrorText(null);
                                try {
                                  const coverLetter = (selectedJobForLetter?.id === job.id && generatedLetterText) ? generatedLetterText : "";
                                  const res = await fetch(`/api/jobs/${job.id}/apply`, {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      "Authorization": `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ coverLetter })
                                  });
                                  const result = await res.json();
                                  if (!res.ok) throw new Error(result.error || "Failed to make local application.");
                                  
                                  setAppliedJobs(prev => [...prev, job.id]);
                                  setShowDirectApplyToast(job.title);
                                  setTimeout(() => setShowDirectApplyToast(null), 4000);
                                  fetchTelemetryActivities();
                                } catch (err: any) {
                                  console.error("Direct Apply error:", err);
                                  setErrorText(err.message || "Failed to register apply.");
                                } finally {
                                  setApplyingJobId(null);
                                }
                              }}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                applyingJobId === job.id
                                  ? 'bg-white/5 text-slate-400 animate-pulse'
                                  : 'bg-cyan-400 text-slate-900 hover:bg-cyan-300'
                              }`}
                            >
                              {applyingJobId === job.id ? (
                                <>
                                  <svg className="animate-spin h-3.5 w-3.5 text-cyan-455" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span>Syncing profile...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Direct AI Apply
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
              </>
            )}
          </div>
        </section>

      </main>
      ) : (
        <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 pb-20">
          <CareerTrajectoryPanel user={user} />
        </main>
      )}

      {/* Footer Status Bar conforming to design HTML spec */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 px-8 py-2 bg-slate-950/80 backdrop-blur-md border-t border-white/5 flex flex-wrap justify-between items-center text-[10px] text-slate-500 max-w-7xl mx-auto w-full">
        <div className="flex gap-4">
          <span>COGNITIVE MATCH ENGINE: <span className="text-emerald-500 font-bold">OPTIMAL</span></span>
          <span className="hidden md:inline">SYSTEM: AUTONOMOUS MATRIX CALIBRATOR ACTIVE</span>
        </div>
        <div className="flex gap-4">
          <span className="hidden sm:inline">DATA SECURE &bull; SANDBOX ENVIRONMENT</span>
          <span>&copy; 2026 NEXGEN AI PORTAL CORP</span>
        </div>
      </footer>

      {/* Direct HR Email Dispatcher Popup Overlay Dialog Modal */}
      <AnimatePresence>
        {emailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col font-sans"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 bg-slate-950/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Direct HR Email Dispatcher</h3>
                    <p className="text-[9.5px] text-slate-500 font-medium">Bypass ATS & communicate directly with the hiring team</p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {emailSendSuccess ? (
                  <div className="text-center py-6 bg-slate-950/40 rounded-2xl border border-emerald-500/10 p-5 space-y-3.5">
                    <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Email Dispatched Successfully!</h4>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                        Your personalized candidate profile pitch and letter subject have been securely transmitted to <span className="text-cyan-400 font-mono font-bold">{emailHrRecipient}</span> and log records have been synced safely.
                      </p>
                    </div>
                    <button
                      onClick={() => setEmailModalOpen(false)}
                      className="px-5 py-1.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors shadow-lg cursor-pointer"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sender Email (From) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Sender Email (From)</label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full bg-slate-950/40 px-3.5 py-2 border border-white/10 rounded-xl text-xs text-slate-400 focus:outline-none font-mono cursor-not-allowed select-none"
                      />
                    </div>

                    {/* Recipient HR Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Recipient HR Email address</label>
                      <input
                        type="email"
                        value={emailHrRecipient}
                        onChange={(e) => setEmailHrRecipient(e.target.value)}
                        className="w-full bg-slate-950/80 px-3.5 py-2 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all font-mono"
                        placeholder="hr@company.com"
                      />
                    </div>

                    {/* Email Subject */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Subject Line</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full bg-slate-950/80 px-3.5 py-2 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                        placeholder="Application: Position Name"
                      />
                    </div>

                    {/* Email Body */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Email Pitch Message Body</label>
                        <span className="text-[9px] text-slate-500 italic">Pre-filled with customized cover letter</span>
                      </div>
                      <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        rows={8}
                        className="w-full bg-slate-950/80 p-3.5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-all font-sans leading-relaxed resize-none max-h-48 overflow-y-auto select-text selection:bg-cyan-500/20"
                        placeholder="Write your cover pitch body..."
                      />
                    </div>

                    {/* Error indicator */}
                    {errorText && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{errorText}</span>
                      </div>
                    )}

                    {/* Actions footer */}
                    <div className="pt-3 border-t border-white/5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEmailModalOpen(false)}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold border border-white/5 transition-all text-center cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={sendingEmail || !emailHrRecipient}
                        onClick={async () => {
                          setSendingEmail(true);
                          setErrorText(null);
                          try {
                            const res = await fetch(`/api/jobs/${selectedMatch?.jobId}/email`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                hrEmail: emailHrRecipient,
                                subject: emailSubject,
                                body: emailBody
                              })
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || 'Failed to submit HR communication packet.');
                            
                            setEmailSendSuccess(true);
                            fetchTelemetryActivities(); // Sync history tabs list!
                          } catch (err: any) {
                            console.error('HR Email Dispatch Error:', err);
                            setErrorText(err.message || 'Transmission failed.');
                          } finally {
                            setSendingEmail(false);
                          }
                        }}
                        className="flex-1 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 transition-all cursor-pointer"
                      >
                        {sendingEmail ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Transmitting...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Dispatch Pitch Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Full Career Trajectory Progression & Resume Update Diagnostic Checklist Panel Component
interface CareerTrajectoryPanelProps {
  user: any;
}

function CareerTrajectoryPanel({ user }: CareerTrajectoryPanelProps) {
  // If the user hasn't analyzed a resume yet, prompt them gently!
  if (!user.analysis) {
    return (
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-12 backdrop-blur-md">
        <div className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/20">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-white">Unlock Your AI Career Trajectory Roadmap</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Please upload your resume in the Matchmaking tab first! Once evaluated, our ATS analyzer will generate custom lateral roles recommendations, strategic year-by-year milestone paths, and direct interactive action checklists.
        </p>
      </div>
    );
  }

  const analysis = user.analysis;
  const careerPath = analysis.careerPath || {
    currentState: "Individual contributor with strong technical foundations.",
    transitionRoles: ["Staff Engineer", "Technical Solutions Architect", "Engineering Team Lead"],
    strategicPlan: [
      "Year 1: Scale distributed memory architectures and master multi-threaded runtime loops.",
      "Year 2: Acquire cloud automation certificates and lead high-availability deployments.",
      "Year 3: Mentor junior developers and take ownership of product lifecycle architectures."
    ]
  };

  // State for interactive checkboxes to satisfy "suggest the updates for resumes"
  const [completedItems, setCompletedItems] = React.useState<Record<string, boolean>>({});

  const toggleItem = (item: string) => {
    setCompletedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="space-y-6">
      {/* Overview Intro Banner */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-indigo-900/30 border border-white/10 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400 animate-pulse" />
          AI Seniority Diagnostic & Progression Roadmap
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Based on the structural parsing of your scanned profile, our recruitment intelligence model has outlined the optimal transition roles, target seniority milestones, and high-impact actions to optimize your resume impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Seniority Diagnostic & Target Job Roles */}
        <div className="space-y-6">
          {/* Seniority State Card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Seniority Diagnostic & Status
            </h3>
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Diagnostic Title:</span>
                <span className="text-cyan-400 font-extrabold font-mono text-[11px] uppercase">
                  {user.preferences?.desiredRole || "Technical Professional"}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/5 font-sans">
                {careerPath.currentState}
              </p>
            </div>

            {/* List Target Transitions Roles */}
            <div className="space-y-2">
              <h4 className="text-[11px] uppercase text-slate-400 font-bold tracking-wider">Optimal Lateral & Upward Target Roles</h4>
              <div className="grid grid-cols-1 gap-2">
                {(analysis.recommendedRoles || careerPath.transitionRoles).map((role: string, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all select-none">
                    <span className="text-xs text-slate-200 font-semibold">{role}</span>
                    <span className="text-[9px] uppercase font-bold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      High Placement
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Strengths & Gaps summary from Scanned Resume */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Extracted Profile Strengths
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keyStrengths.map((s: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-emerald-400/5 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-semibold">
                  ✓ {s}
                </span>
              ))}
            </div>

            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2 pt-2">
              <Info className="w-4 h-4 text-rose-400" />
              Identified Technology Gaps
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {analysis.skillGaps.map((g: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-rose-400/5 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-semibold">
                  ✗ {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Career Plan & Resume Revamp Action List */}
        <div className="space-y-6">
          {/* Strategic Chronological Timeline 3-Year Plan */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Strategic Path Trajectory Plan
            </h3>
            <div className="border-l border-white/10 ml-2.5 pl-4 space-y-4 pt-1">
              {careerPath.strategicPlan.map((step: string, idx: number) => (
                <div key={idx} className="relative select-none">
                  <div className="absolute left-[-21.5px] top-1.5 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] border border-slate-950"></div>
                  <h4 className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Milestone Year {idx + 1}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1 font-sans">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Resume Optimization Checklists */}
          <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs uppercase tracking-widest text-white font-bold flex items-center gap-2 mb-2">
              <Edit3 className="w-4 h-4 text-cyan-400" />
              ATS Resume Update Suggestions Checklist
            </h3>
            <p className="text-[10.5px] text-slate-400 leading-normal pb-3 border-b border-white/5">
              Mark off updates as you incorporate them into your master document. This list targets specific optimization gaps noted by AI analysis:
            </p>
            <div className="space-y-2.5">
              {analysis.suggestedImprovements.map((improvement: string, index: number) => {
                const isChecked = !!completedItems[improvement];
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleItem(improvement)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isChecked 
                        ? 'bg-cyan-500/10 border-cyan-500/20 opacity-75' 
                        : 'bg-white/5 border-white/10 hover:border-white/15'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-cyan-400 border-cyan-400 text-slate-950' 
                          : 'border-white/20 hover:border-cyan-400'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <p className={`text-xs text-left ${isChecked ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {improvement}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
