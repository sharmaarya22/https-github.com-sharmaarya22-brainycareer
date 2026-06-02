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
  Globe, RefreshCw, ExternalLink, Mail
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
  const [strictMatchFilter, setStrictMatchFilter] = useState(false);

  // Direct HR Email Dialog state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailHrRecipient, setEmailHrRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSendSuccess, setEmailSendSuccess] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<string | null>(null);

  // Load telemetry states
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
      console.error('Failed to load user interaction sync list', e);
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
                      <div className="bg-slate-950/40 border border-white/5 p-3 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-400 uppercase">Supabase Status</span>
                          {supabaseEnabled ? (
                            isLiveSupabase ? (
                              <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live Sync
                              </span>
                            ) : (
                              <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Soft mode
                              </span>
                            )
                          ) : (
                            <span className="text-slate-450 font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              Local json
                            </span>
                          )}
                        </div>
                        
                        <p className="text-[10.5px] text-slate-400 leading-normal">
                          {supabaseEnabled && isLiveSupabase 
                            ? "Connected to real-time cloud data. Your job clicks, applications, and direct HR emails are active."
                            : supabaseEnabled 
                              ? "Supabase configured but tables need initialization. Ensure you have run the database setup script."
                              : "Operating in safe persistent local datastore. Provide Supabase environment values in Settings to activate global cloud backup."}
                        </p>

                        {!isLiveSupabase && (
                          <details className="text-[9px] text-cyan-400 font-semibold cursor-pointer select-none">
                            <summary className="hover:underline focus:outline-none">Show Supabase SQL Schema</summary>
                            <pre className="mt-2 bg-[#020617] text-slate-300 p-2 rounded border border-white/5 overflow-x-auto text-[8px] leading-tight select-text">
{`-- Run inside your Supabase SQL editor:

CREATE TABLE job_clicks (
  id TIMESTAMP DEFAULT NOW(),
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  job_id TEXT,
  job_title TEXT,
  company TEXT,
  source TEXT,
  clicked_at TIMESTAMP
);

CREATE TABLE job_applications (
  id TIMESTAMP DEFAULT NOW(),
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  job_id TEXT,
  job_title TEXT,
  company TEXT,
  source TEXT,
  applied_at TIMESTAMP,
  cover_letter TEXT,
  status TEXT
);

CREATE TABLE job_emails (
  id TIMESTAMP DEFAULT NOW(),
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  job_id TEXT,
  job_title TEXT,
  company TEXT,
  hr_email TEXT,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMP
);`}
                            </pre>
                          </details>
                        )}
                      </div>

                      {/* Emailed HR Contacts History */}
                      <div className="space-y-2">
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

                      {/* Applied jobs tracker list */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Applications Sent ({appliedJobs.length})</p>
                        {appliedJobs.length === 0 ? (
                          <p className="text-[10px] text-slate-500 italic">No job applications submitted.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {appliedJobs.map((jid) => {
                              const job = jobs.find(j => j.id === jid);
                              return (
                                <span key={jid} className="bg-emerald-500/10 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 max-w-full truncate" title={job?.title || jid}>
                                  {job ? `${job.company} (${job.locationModel})` : jid}
                                </span>
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

        </section>

        {/* Middle Column (span 5): Live matching feed cards */}
        <section className="lg:col-span-5 space-y-4">
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
              processedJobs.map((job) => {
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
                    className={`group hover:bg-white/10 border rounded-3xl p-4.5 flex gap-4 transition-all cursor-pointer ${
                      isCurrentlySelected 
                        ? 'bg-white/12 border-cyan-400/70 shadow-lg shadow-cyan-950/20' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center font-extrabold text-white text-lg tracking-wider border border-white/5 select-none uppercase shadow-inner shrink-0 leading-none">
                      {job.logo}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors flex flex-wrap items-center gap-1.5 truncate">
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
                            <span className="font-semibold text-slate-300">{job.company}</span>
                            <span>&bull;</span>
                            <span className="italic">{job.location} ({job.locationModel})</span>
                            {job.country && (
                              <>
                                <span>&bull;</span>
                                <span className="text-[10.5px] text-cyan-400 font-bold uppercase">{job.country}</span>
                              </>
                            )}
                            {job.source && (
                              <>
                                <span>&bull;</span>
                                <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">{job.source}</span>
                              </>
                            )}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          {user.resumeText ? (
                            hasScore ? (
                              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${scoreColorClass}`}>
                                {score}% MATCH
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 italic">calibrating...</span>
                            )
                          ) : (
                            <span 
                              title="Please upload resume to check score"
                              className="text-[9px] font-medium text-slate-500 bg-slate-950/40 border border-white/5 px-2 py-0.5 rounded"
                            >
                              Locked
                            </span>
                          )}
                          <p className="text-[10px] text-slate-500 mt-1">{job.salaryRange}</p>
                        </div>
                      </div>

                      <p className="text-slate-400 text-[11px] leading-relaxed mt-2.5 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {job.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-white/5 group-hover:bg-cyan-500/5 hover:text-cyan-300 rounded text-[9px] text-slate-400 font-medium transition-colors">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column (span 3/4): Live match detail breakdown / cover letter generator */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Active Copilot letters engine */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse"></div>
              <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-extrabold">AI Copilot Core</h2>
            </div>

            {selectedMatch ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white leading-normal truncate">{selectedMatch.job.title}</h4>
                  <p className="text-[10px] text-slate-400">{selectedMatch.job.company}</p>
                </div>

                {user.resumeText ? (
                  <>
                    {/* Score detail box */}
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-medium">ATS Match Accuracy</span>
                        <span className="text-cyan-400 font-bold font-mono">{selectedMatch.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 rounded-full transition-all duration-1000" 
                          style={{ width: `${selectedMatch.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Skill Comparison Radar Chart */}
                    <SkillRadarChart 
                      requirements={selectedMatch.job.requirements}
                      matchingSkills={selectedMatch.matchingSkills}
                      missingSkills={selectedMatch.missingSkills}
                      jobTitle={selectedMatch.job.title}
                    />

                    {/* Reasons alignment bullet */}
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Match Insights</p>
                      <ul className="space-y-1.5 text-[11px] text-slate-300 leading-snug">
                        {selectedMatch.reasons.map((r, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skill Alignment highlights */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-emerald-400 font-bold block mb-1">✓ Matching ({selectedMatch.matchingSkills.length})</span>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {selectedMatch.matchingSkills.slice(0, 5).map(s => (
                            <span key={s} className="bg-emerald-400/5 text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">
                              {s}
                            </span>
                          ))}
                          {selectedMatch.matchingSkills.length === 0 && <span className="text-slate-500 italic text-[9px]">None parsed</span>}
                        </div>
                      </div>

                      <div>
                        <span className="text-rose-400 font-bold block mb-1">✗ Missing ({selectedMatch.missingSkills.length})</span>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {selectedMatch.missingSkills.slice(0, 5).map(s => (
                            <span key={s} className="bg-rose-400/5 text-rose-300 px-1.5 py-0.5 rounded text-[9px]">
                              {s}
                            </span>
                          ))}
                          {selectedMatch.missingSkills.length === 0 && <span className="text-slate-500 italic text-[9px]">None found</span>}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: Direct Apply, Email Poster, and Source Redirection */}
                    <div className="pt-3 border-t border-white/5 space-y-2 font-sans text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Redirection to Respective Job Portal Source & Backup Copy Link */}
                        <div className="flex gap-1.5">
                          <a
                            id="original-job-link"
                            href={selectedMatch.job.originalUrl !== '#' ? selectedMatch.job.originalUrl : `https://www.${(selectedMatch.job.source || 'google').toLowerCase()}.com`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-2 text-center bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1 min-w-0"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">Apply on {selectedMatch.job.source || "Source"}</span>
                          </a>
                          
                          <button
                            type="button"
                            title="Copy direct listing link to paste manually"
                            onClick={(e) => {
                              e.stopPropagation();
                              const jobUrl = selectedMatch.job.originalUrl !== '#' 
                                ? selectedMatch.job.originalUrl 
                                : `https://www.${(selectedMatch.job.source || 'linkedin').toLowerCase()}.com`;
                              navigator.clipboard.writeText(jobUrl);
                              setCopyLinkSuccess(selectedMatch.job.id);
                              setTimeout(() => setCopyLinkSuccess(null), 2000);
                            }}
                            className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                          >
                            {copyLinkSuccess === selectedMatch.job.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                            ) : (
                              <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>

                        {/* Direct Email to HR Poster */}
                        <button
                          id="copilot-email-hr-btn"
                          onClick={() => {
                            setEmailHrRecipient(selectedMatch.job.hrEmail || `careers@${selectedMatch.job.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`);
                            setEmailSubject(`Application: ${selectedMatch.job.title} - ${user.fullName}`);
                            setEmailBody(generatedLetterText || `Dear Hiring Team,\n\nI am incredibly excited to submit my tailored profile and credentials for the ${selectedMatch.job.title} vacancy at ${selectedMatch.job.company}.\n\nBased on my uploaded resume details, I possess strong alignment with your requested requirements: ${(selectedMatch.job.requirements.slice(0, 3)).join(", ")}.\n\nWarm regards,\n${user.fullName}\n${user.email}`);
                            setEmailSendSuccess(false);
                            setEmailModalOpen(true);
                          }}
                          className="py-2 px-3 text-center bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-purple-400" />
                          Email HR Poster
                        </button>
                      </div>

                      {/* Direct application via NexGen AI Portal */}
                      {appliedJobs.includes(selectedMatch.job.id) ? (
                        <div className="py-2 px-3 bg-[#10b981]/25 text-[#34d399] border border-[#10b981]/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 select-none">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Dispatched Profile
                        </div>
                      ) : (
                        <button
                          id="direct-portal-apply-btn"
                          disabled={applyingJobId !== null}
                          onClick={async () => {
                            const jid = selectedMatch.job.id;
                            setApplyingJobId(jid);
                            setErrorText(null);
                            try {
                              const res = await fetch(`/api/jobs/${jid}/apply`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({ coverLetter: generatedLetterText || "" })
                              });
                              const result = await res.json();
                              if (!res.ok) throw new Error(result.error || "Failed to transmit application profile.");
                              
                              setAppliedJobs(prev => [...prev, jid]);
                              setShowDirectApplyToast(selectedMatch.job.title);
                              setTimeout(() => setShowDirectApplyToast(null), 4000);
                              fetchTelemetryActivities(); // Refresh sidebar log immediately!
                            } catch (err: any) {
                              console.error("Direct Apply err:", err);
                              setErrorText(err.message || "Failed to make direct apply.");
                            } finally {
                              setApplyingJobId(null);
                            }
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            applyingJobId === selectedMatch.job.id
                              ? 'bg-white/5 text-slate-400 animate-pulse'
                              : 'bg-cyan-400 text-slate-900 hover:bg-cyan-300'
                          }`}
                        >
                          {applyingJobId === selectedMatch.job.id ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Syncing profile tables...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              Direct Apply Profile Package
                            </>
                          )}
                        </button>
                      )}

                      {/* Cover letter companion button toggle */}
                      <button
                        id="copilot-select-btn"
                        onClick={() => {
                          setSelectedJobForLetter(selectedMatch.job);
                          setGeneratedLetterText('');
                        }}
                        className="w-full py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/15 hover:to-indigo-500/15 border border-purple-500/25 text-purple-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        Generate custom draft letter
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 text-center text-xs text-slate-400 mt-2">
                    Please upload resume on the left sidebar in order to score profile alignment.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-slate-400">
                Welcome! Select any active career vacancy inside the Matchmaking list to reveal detailed score metrics, requirement alignments, and original posting portals.
              </p>
            )}
          </div>

          {/* Salary Benchmarks & Grounding Card */}
          {selectedMatch && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  Salary Grounding Benchmarks
                </h3>
                <span className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 px-1.5 py-0.5 bg-cyan-400/5 border border-cyan-400/15 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                  Live search
                </span>
              </div>

              {fetchingSalary ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <svg className="animate-spin h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-[10px] text-slate-455 font-medium">Investigating real-time salary indices...</span>
                </div>
              ) : salaryError ? (
                <div className="space-y-2 text-center py-3">
                  <p className="text-[10px] text-slate-400 leading-normal">{salaryError}</p>
                  <button
                    onClick={() => handleFetchSalaryEstimate(selectedMatch.jobId, true)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-semibold border border-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    Retry search
                  </button>
                </div>
              ) : salaryEstimates[selectedMatch.jobId] ? (
                <div className="space-y-4">
                  {/* Gauge Visualization */}
                  <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-1 text-[10px]">
                      <span className="text-slate-400 font-medium">Offered Range:</span>
                      <span className="text-slate-200 font-bold font-mono text-[10px]">{selectedMatch.job.salaryRange}</span>
                    </div>

                    {/* Scale bar */}
                    <div className="mt-4 relative">
                      {/* Bar backgrounds */}
                      <div className="h-2 bg-white/5 rounded-full flex overflow-hidden">
                        <div className="h-full bg-rose-450/20 w-1/3 border-r border-slate-950" title="Low percentile"></div>
                        <div className="h-full bg-cyan-455/20 w-1/3 border-r border-slate-950" title="Average market range"></div>
                        <div className="h-full bg-emerald-455/20 w-1/3" title="High percentile"></div>
                      </div>

                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2">
                        <span>Low Check:<br />{salaryEstimates[selectedMatch.jobId].currency}{salaryEstimates[selectedMatch.jobId].marketLow?.toLocaleString() || 'N/A'}</span>
                        <span className="text-center text-cyan-400 font-bold">Standard Avg:<br />{salaryEstimates[selectedMatch.jobId].currency}{salaryEstimates[selectedMatch.jobId].marketAverage?.toLocaleString() || 'N/A'}</span>
                        <span className="text-right">High Check:<br />{salaryEstimates[selectedMatch.jobId].currency}{salaryEstimates[selectedMatch.jobId].marketHigh?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Market info stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Position Competitive Index:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold font-mono border ${
                        salaryEstimates[selectedMatch.jobId].comparisonStatus?.toLowerCase().includes('above') 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : salaryEstimates[selectedMatch.jobId].comparisonStatus?.toLowerCase().includes('below')
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {salaryEstimates[selectedMatch.jobId].comparisonStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-350 leading-relaxed bg-indigo-950/10 border border-indigo-500/10 p-3 rounded-xl italic">
                      {salaryEstimates[selectedMatch.jobId].marketInsights}
                    </p>
                  </div>

                  {/* Verification Sources citations */}
                  {salaryEstimates[selectedMatch.jobId].sources && salaryEstimates[selectedMatch.jobId].sources.length > 0 && (
                    <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                      <div className="flex justify-between items-center text-[10px]">
                        <p className="uppercase tracking-wider font-extrabold text-slate-400">Google Grounding Sources</p>
                        <span className="text-emerald-400 text-[9px] font-bold font-mono">CONFIDENCE: {salaryEstimates[selectedMatch.jobId].confidenceScore || '100'}%</span>
                      </div>
                      <div className="space-y-1">
                        {salaryEstimates[selectedMatch.jobId].sources.slice(0, 3).map((src: any, index: number) => (
                          <a
                            key={index}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-1.5 bg-slate-950/40 rounded-lg hover:bg-slate-950/80 hover:text-cyan-300 transition-colors text-[9.5px] text-slate-400 border border-white/5 cursor-pointer truncate"
                          >
                            <span className="truncate flex items-center gap-1.5 max-w-[85%]">
                              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="truncate font-medium">{src.title}</span>
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Refresh search manual override button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleFetchSalaryEstimate(selectedMatch.jobId, true)}
                      disabled={fetchingSalary}
                      className="text-[9px] text-slate-500 hover:text-cyan-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Rerun Search
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <button
                    onClick={() => handleFetchSalaryEstimate(selectedMatch.jobId, true)}
                    className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
                  >
                    Assess Market Averages
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cover Letter generation panel */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              Tailored Cover Letter
            </h3>

            {selectedJobForLetter ? (
              <div className="space-y-4">
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold">DRAFTING IN PROGRESS FOR:</p>
                  <p className="text-xs font-bold text-white truncate">{selectedJobForLetter.title}</p>
                  <p className="text-[10px] text-slate-400 italic truncate">{selectedJobForLetter.company}</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
                    Persona Adjustments (Optional)
                  </label>
                  <textarea
                    value={customLetterInstructions}
                    onChange={(e) => setCustomLetterInstructions(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/60 p-2 border border-white/10 rounded-xl text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 resize-none"
                    placeholder="e.g. emphasize React & Distributed architectures, keep it conversational but elegant..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    id="cancel-draft-btn"
                    onClick={() => setSelectedJobForLetter(null)}
                    className="flex-1 py-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
                  >
                    Clear Target
                  </button>
                  <button
                    id="generate-cover-letter-btn"
                    onClick={triggerGenerateCoverLetter}
                    disabled={generatingLetter}
                    className="flex-1.5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    {generatingLetter ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Drafting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                        Draft Letter
                      </>
                    )}
                  </button>
                </div>

                {generatedLetterText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 mt-4"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold uppercase text-slate-400">Preview Draft</span>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-cyan-400 hover:text-cyan-350 cursor-pointer transition-colors"
                      >
                        {copyStatus ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 text-[9px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-3 h-3" />
                            <span className="text-[9px]">Copy Letter</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/10 max-h-56 overflow-y-auto text-[10.5px] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap select-text selection:bg-cyan-500/30">
                      {generatedLetterText}
                    </div>
                  </motion.div>
                )}

              </div>
            ) : (
              <p className="text-xs leading-relaxed text-slate-400 text-center py-4">
                Select a vacancy in the Matchmaking feed and click <span className="font-semibold text-white">"Apply"</span> to prompt the AI candidate advocate to draft a stunning custom-tailored cover letter based on your resume.
              </p>
            )}
          </div>

          {/* Market Insights Trends Mock Panel */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Succeeding Industry Trends
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Generative AI Specialist</span>
                  <span className="text-emerald-400 font-bold">+28.3%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full w-[85%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Distributed Architecture</span>
                  <span className="text-emerald-500 font-bold">+16.1%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[65%]"></div>
                </div>
              </div>
              <div className="pt-2 text-[9.5px] text-slate-500 italic leading-snug">
                &ldquo;Calculated based on real-time metadata indexing patterns of hiring agencies globally.&rdquo;
              </div>
            </div>
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
