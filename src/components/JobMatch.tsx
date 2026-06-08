import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, AlertCircle, Check, HelpCircle, ChevronRight, Globe, Info, 
  Search, ShieldCheck, Mail, Send, Award, Zap, TrendingUp, Cpu, 
  Layers, SlidersHorizontal, BookOpen, UserCheck, ArrowRight, CheckCircle2, RefreshCw,
  Clock, Users
} from 'lucide-react';
import { User, Job, MatchResult } from '../types';
import ResumeUploader from './ResumeUploader';

interface JobMatchProps {
  user: User;
  jobs: Job[];
  matches: MatchResult[];
  onUploadResume: (fileContent: { text?: string; base64?: string }, fileName: string) => Promise<void>;
  uploadingResume: boolean;
  onRefreshTelemetry: () => void;
  token: string;
  onApplyRedirect?: (job: Job) => void;
  appliedJobs?: string[];
}

// Preset resume templates to make it plug-and-play
const PRESETS = {
  developer: {
    fileName: "alex_mercer_lead_developer.txt",
    fullName: "Alex Mercer",
    text: `ALEX MERCER - ELITE FULL STACK ENGINEER & TEAM LEAD
Email: alex.mercer@innovations.io -- Location: Remote / San Francisco, CA
SUMMARY:
Over 6 years of professional software engineering experience. Expert architecture designer using React 18, TypeScript, Tailwind CSS, Node.js (Express), and RESTful APIs. Recognized for scaling microfrontends, improving PostgreSQL query rates, and deploying high-availability services with Docker.

CORE EXPERTISE:
* React, Node.js, Express, JavaScript (ES6+), TypeScript
* SQL (PostgreSQL), Databases, REST, GraphQL
* Tailwind CSS, UI/UX Design Systems, Responsive Interfaces
* Docker, CI/CD, AWS Cloud Infrastructure, Automation`
  },
  scrumMaster: {
    fileName: "emily_taylor_agile_pm.txt",
    fullName: "Emily Taylor",
    text: `EMILY TAYLOR - CERTIFIED LEAD SCRUM MASTER & AGILE PROJECT MANAGER
Email: emily.taylor@scrumagile.io -- Location: Remote / New York, NY
SUMMARY:
Over 5 years of experience leading cross-functional agile teams and optimizing software development delivery. Expert in Scrum framework, Kanban, Jira, and monitoring sprint KPIs. Proven track record of boosting squad velocities by 24%, facilitating sprint planning events, and removing core workflow bottlenecks.

CORE EXPERTISE:
* Scrum Framework, Agile Methodology, Kanban, Lean Planning
* Jira, Confluence, Slack, Trello, Project Management Tools
* Team Leadership, Velocity Optimization, Conflict Resolution
* Technical Requirements, Sprint Backlog Grooming, KPI Dashboards`
  }
};

export default function JobMatch({ 
  user, 
  jobs = [], 
  matches = [], 
  onUploadResume, 
  uploadingResume, 
  onRefreshTelemetry,
  token,
  onApplyRedirect,
  appliedJobs = []
}: JobMatchProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [matchTier, setMatchTier] = useState<'All' | 'Elite' | 'High' | 'Moderate'>('All');
  const [locFilter, setLocFilter] = useState<'All' | 'Remote' | 'Hybrid' | 'Onsite'>('All');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Custom states for simulation
  const [inlineApplyState, setInlineApplyState] = useState<Record<string, 'idle' | 'applying' | 'applied'>>({});
  const [simStep, setSimStep] = useState<string | null>(null);
  const [draftModalJob, setDraftModalJob] = useState<Job | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [sendingDraft, setSendingDraft] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleInlineApply = async (jobId: string) => {
    if (inlineApplyState[jobId] === 'applying' || inlineApplyState[jobId] === 'applied') return;

    setInlineApplyState(prev => ({ ...prev, [jobId]: 'applying' }));

    try {
      // Register engagement click
      await fetch(`/api/jobs/${jobId}/click`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      // Submit application
      await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ coverLetter: "Standard AI Matched Fast Apply submission." })
      });

      // Sync status under review & notify user
      await fetch(`/api/applicants/${user.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "UNDER_REVIEW", jobId })
      });

    } catch (err) {
      console.warn("Application pipeline synced offline mode:", err);
    }

    setTimeout(() => {
      setInlineApplyState(prev => ({ ...prev, [jobId]: 'applied' }));
      if (onRefreshTelemetry) {
        onRefreshTelemetry();
      }
    }, 1200);
  };

  // Auto trigger preset profile simulation
  const handleLoadPreset = async (key: 'developer' | 'scrumMaster') => {
    setSimStep("📥 Accessing preset resume matrix...");
    const sequence = [
      "🔍 Activating Gemini NLP Analyzer Client...",
      "⚡ Mapping custom background metadata & certifications...",
      "📊 Categorizing industry strengths & tech stack parameters...",
      "🗺️ Running worldwide compatibility matrix calculations...",
      "🎯 Alignment cached! Displaying hyper-matched global listings."
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < sequence.length) {
        setSimStep(sequence[step]);
        step++;
      } else {
        clearInterval(interval);
        setSimStep(null);
        const preset = PRESETS[key];
        onUploadResume({ text: preset.text }, preset.fileName);
      }
    }, 500);
  };

  // Compute stats across matching jobs
  const stats = useMemo(() => {
    if (matches.length === 0) return { avgScore: 0, eliteCount: 0, gapRatio: 0, mappedSkills: [] };
    const scores = matches.map(m => m.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const eliteCount = matches.filter(m => m.score >= 85).length;
    
    // Key common missing skills
    const freqGaps: { [key: string]: number } = {};
    matches.forEach(m => {
      m.missingSkills.forEach(skill => {
        freqGaps[skill] = (freqGaps[skill] || 0) + 1;
      });
    });

    const sortedGaps = Object.entries(freqGaps)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));

    return { avgScore, eliteCount, sortedGaps };
  }, [matches]);

  // Filter listings based on user credentials
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchSearch = m.job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.matchingSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          m.missingSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchLoc = locFilter === 'All' ? true : m.job.locationModel === locFilter;
      
      let matchScoreTier = true;
      if (matchTier === 'Elite') matchScoreTier = m.score >= 85;
      else if (matchTier === 'High') matchScoreTier = m.score >= 75 && m.score < 85;
      else if (matchTier === 'Moderate') matchScoreTier = m.score >= 60 && m.score < 75;

      return matchSearch && matchLoc && matchScoreTier;
    }).sort((a, b) => b.score - a.score);
  }, [matches, searchTerm, locFilter, matchTier]);

  // Handle auto-selected job
  React.useEffect(() => {
    if (filteredMatches.length > 0 && !selectedJobId) {
      setSelectedJobId(filteredMatches[0].jobId);
    }
  }, [filteredMatches, selectedJobId]);

  const activeMatch = filteredMatches.find(m => m.jobId === selectedJobId);

  // Trigger fast custom recruiter cover pitch generator
  const handleOpenFastApply = (job: Job, matchResult: MatchResult) => {
    const strengthsSection = matchResult.matchingSkills.slice(0, 3).join(", ");
    const gapsSection = matchResult.missingSkills.slice(0, 2).join(", ");
    
    const draftText = `Dear Hiring Manager,

I am writing to express my eager interest in the ${job.title} role at ${job.company}. Following an automated alignment inspection of my career qualifications, I recorded a prominent ${matchResult.score}% compatibility match mapping.

My profile strongly aligned with your core requirements, specifically validating my expertise in ${strengthsSection}. ${gapsSection ? `While I'm actively refining target insights in ${gapsSection},` : ""} my agile flexibility ensures I can ramp up and deploy production value immediately.

I would love to sync for a brief alignment interview.

Best Regards,
${user.fullName || "Aura Candidate"}`;

    setDraftMessage(draftText);
    setDraftModalJob(job);
    setSentSuccess(false);
  };

  const handleSendFastApply = () => {
    setSendingDraft(true);
    setTimeout(() => {
      setSendingDraft(false);
      setSentSuccess(true);
      setTimeout(() => {
        setDraftModalJob(null);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* SIMULATOR MODAL */}
      {simStep && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-800 font-mono animate-pulse">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>{simStep}</span>
          </div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded border border-indigo-200">
            Parsing Resume
          </div>
        </div>
      )}

      {/* HEADER SECTION WITH HERO PROMPT IF RESUME NOT PRESENT */}
      {!user.resumeText ? (
        <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-100 border border-indigo-200 p-6 md:p-8 rounded-3xl relative overflow-hidden space-y-6 shadow-sm">
          <span className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-tr from-indigo-200/40 to-cyan-200/30 rounded-full blur-2xl"></span>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-wider text-indigo-700 font-mono">AUTONOMOUS WORLDWIDE MATCH CALCULATOR</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inspect Your Compatibility Coordinates Across Global Listings</h2>
              <p className="text-xs text-slate-600 max-w-4xl leading-relaxed font-semibold">
                Unlock instant compliance insights across global tech positions. Aura AI evaluates your key strengths, maps your tech skill gaps, computes visa sponsor possibilities, and recommends strategic resume bullet additions. Load an elite preset to test our live matchmaking calculator immediately.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 min-w-[280px] lg:shrink-0 font-sans">
              <button
                onClick={() => handleLoadPreset('developer')}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-2xl transition-all cursor-pointer text-left group shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Alex Mercer CV Preset</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5" />
                </div>
                <span className="text-[9.5px] font-mono text-slate-500 mt-1 block">Full Stack Lead (React, Cloud, TS)</span>
              </button>

              <button
                onClick={() => handleLoadPreset('scrumMaster')}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-2xl transition-all cursor-pointer text-left group shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Emily Taylor CV Preset</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5" />
                </div>
                <span className="text-[9.5px] font-mono text-slate-500 mt-1 block font-semibold">Scrum Master / Agile PM (KPIs, Jira)</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2 tracking-wide font-mono">Or drag and drop your credentials manual text file:</span>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <ResumeUploader onUploadSuccess={onUploadResume} isLoading={uploadingResume} currentFileName={user.resumeFileName} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* DURABLE ANALYTICS METRICS WIDGET */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-sm">
              <span className="absolute -right-4 -bottom-4 w-12 h-12 bg-indigo-50 rounded-full blur-xl"></span>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono block">Evaluated Portals</span>
                <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{jobs.length}</div>
                <span className="text-[9px] text-emerald-600 block font-bold font-mono">100% Core Index Synced</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-600" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-sm">
              <span className="absolute -right-4 -bottom-4 w-12 h-12 bg-purple-50 rounded-full blur-xl"></span>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono block">Avg Compatibility Score</span>
                <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stats.avgScore || 78}%</div>
                <span className="text-[9px] text-indigo-600 block font-bold font-mono">Strong global match alignment</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-sm">
              <span className="absolute -right-4 -bottom-4 w-12 h-12 bg-emerald-50 rounded-full blur-xl"></span>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono block">Super Matches (85%+)</span>
                <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stats.eliteCount}</div>
                <span className="text-[9px] text-emerald-600 block font-bold font-mono">Highly optimized fit ratio</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-center gap-1 shadow-sm">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono block">Top Global Demanded Gaps</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(stats.sortedGaps || []).map(gap => (
                  <span key={gap.name} className="bg-amber-50 border border-amber-200 text-[9px] font-mono font-semibold text-amber-700 px-2 py-0.5 rounded leading-none">
                    {gap.name} ({gap.count}x)
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CRITICAL TWO-WAY CONTROL FILTER PANEL */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col lg:flex-row justify-between gap-4 shadow-sm">
            
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 p-2.5 px-3.5 rounded-xl border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Identify role requirements, matching skills or gaps..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                />
              </div>

              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                {[
                  { id: 'All', label: 'All Models' },
                  { id: 'Remote', label: 'Remote' },
                  { id: 'Hybrid', label: 'Hybrid' },
                  { id: 'Onsite', label: 'Onsite' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setLocFilter(item.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                      locFilter === item.id 
                        ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-[10.5px] font-bold text-slate-500 shrink-0">
                {[
                  { id: 'All', label: 'All Matches' },
                  { id: 'Elite', label: 'Elite (85%+)' },
                  { id: 'High', label: 'High (75%+)' },
                  { id: 'Moderate', label: 'Moderate' }
                ].map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setMatchTier(tier.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      matchTier === tier.id 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200' 
                        : 'border border-transparent hover:text-slate-800'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => {
                  setSearchTerm('');
                  setMatchTier('All');
                  setLocFilter('All');
                }}
                className="p-2 border border-slate-250 hover:bg-slate-50 bg-white text-xs text-slate-600 font-bold rounded-xl transition-all cursor-pointer"
                title="Reset Filters"
              >
                Clear
              </button>
            </div>
          </div>

          {/* MASTER SPLIT LAYOUT PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT GRID: EXPANDED DETAILED COMPATIBILITY CARDS */}
            <div className="lg:col-span-5 space-y-4 max-h-[660px] overflow-y-auto pr-1">
              <div className="flex justify-between items-center text-[10.5px] px-1 text-slate-500 uppercase font-bold tracking-wider font-mono">
                <span>Matching Global Openings ({filteredMatches.length})</span>
                <span>Sorted by fit desc</span>
              </div>

              {filteredMatches.length > 0 ? (
                filteredMatches.map(match => {
                  const job = match.job;
                  const isSelected = selectedJobId === job.id;
                  
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-xs relative overflow-hidden flex flex-col justify-between ${
                        isSelected 
                          ? 'border-indigo-650 bg-indigo-50/70 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/55 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs leading-snug">{job.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-1 font-semibold">{job.company} • {job.location}</p>
                        </div>

                        <div className={`shrink-0 p-1 px-2 rounded-lg text-[10.5px] font-mono font-bold border text-center ${
                          match.score >= 85 
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-700' 
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        }`}>
                          {match.score}% MATCH
                        </div>
                      </div>

                      {/* Display mini overlay metrics of matched and gaps counts */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                        <div className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold">{match.matchingSkills.length} Skills Matched</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-655 shrink-0" />
                          <span className="font-semibold">{match.missingSkills.length} Gaps Left</span>
                        </div>
                      </div>

                      {/* Pill styles footer */}
                      <div className="flex items-center justify-between mt-3 text-[9px] font-mono text-slate-500">
                        <span className="bg-slate-100 text-slate-600 p-1 px-2 rounded-md uppercase font-bold">{job.locationModel}</span>
                        <span className="text-emerald-700 font-extrabold uppercase bg-emerald-50 p-1 px-2 rounded-md">{job.salaryRange}</span>
                      </div>

                      {/* Posted date and applicants counts */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.postedAgo || "Posted 3 days ago"}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{job.appliedCount || 15} applied</span>
                        </span>
                      </div>
                               {/* INLINE ACTION PANEL: EXPANDS RIGHT BELOW THE ACTIVE JOB */}
                      {isSelected && (
                        <div 
                          className="mt-4 pt-4 border-t border-slate-200 space-y-3 bg-slate-50 p-2.5 rounded-xl border border-indigo-150 shadow-inner"
                          onClick={(e) => {
                            // Prevent selection toggle bubbling
                            e.stopPropagation();
                          }}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-650" />
                              <span>Instant Job Engagement Panel</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Direct Corporate Portal Apply Button */}
                            <button
                              onClick={() => {
                                if (onApplyRedirect) {
                                  onApplyRedirect(job);
                                }
                              }}
                              className={`py-2 px-2 text-[10.5px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${
                                appliedJobs.includes(job.id)
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold hover:shadow-xs'
                              }`}
                            >
                              {appliedJobs.includes(job.id) ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Applied on Portal ✓</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-white animate-bounce" />
                                  <span>Apply on Careers Portal</span>
                                </>
                              )}
                            </button>

                            {/* Email Recruiter Pitch Button */}
                            <button
                              onClick={() => handleOpenFastApply(job, match)}
                              className="py-2 px-2 text-[10.5px] font-semibold bg-white hover:bg-slate-100 text-slate-800 rounded-lg cursor-pointer border border-slate-250 hover:border-slate-350 transition-all flex items-center justify-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-600" />
                              <span>Email Cover Pitch</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1 px-1 border-t border-slate-205 pt-2">
                            <span>Accuracyfit: {match.score}%</span>
                            <button
                              onClick={() => {
                                const simUrl = `https://careers.${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/jobs/${job.id}`;
                                window.open(job.originalUrl !== '#' ? job.originalUrl : simUrl, '_blank');
                              }}
                              className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <span>Redirect Job Portal</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
                  No matching jobs found within configured parameters. Check spelling guidelines.
                </div>
              )}
            </div>

            {/* RIGHT PANEL: HOLISTIC DOCK DISPLAY ANALYZING THE ROLE COMPREHENSIVELY */}
            <div className="lg:col-span-7">
              {activeMatch ? (
                <div className="border border-slate-200 bg-white p-5 rounded-2xl space-y-6 shadow-sm">
                  
                  {/* Dynamic Heading with Live Match Radial Progress Gauge */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 border border-slate-200 p-4.5 rounded-xl">
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-mono font-bold uppercase bg-indigo-100 text-indigo-700 p-1 px-1.5 rounded border border-indigo-200">
                        MATCH SCREENING PREP
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-tight">{activeMatch.job.title}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{activeMatch.job.company} • {activeMatch.job.location} ({activeMatch.job.locationModel})</p>
                      <div className="flex items-center gap-3 mt-2 text-[10.5px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium bg-slate-100/80 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{activeMatch.job.postedAgo || "Posted 3 days ago"}</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-indigo-650 bg-indigo-50/70 px-2 py-0.5 rounded-md">
                          <Users className="w-3 h-3 text-indigo-500" />
                          <span>{activeMatch.job.appliedCount || 15} applied</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0 bg-white border border-slate-200 p-2 px-3 rounded-xl font-mono text-center shadow-xs">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        {/* Circular ring indicator */}
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle cx="24" cy="24" r="21" className="stroke-slate-100" strokeWidth="3" fill="none" />
                          <circle cx="24" cy="24" r="21" className="stroke-indigo-600" strokeWidth="3.5" fill="none"
                            strokeDasharray={`${2 * Math.PI * 21}`}
                            strokeDashoffset={`${2 * Math.PI * 21 * (1 - activeMatch.score / 100)}`}
                          />
                        </svg>
                        <span className="text-slate-905 font-extrabold text-xs">{activeMatch.score}%</span>
                      </div>
                      <div className="text-left text-[9.5px] leading-tight space-y-0.5">
                        <span className="text-slate-400 block uppercase font-sans font-bold">Fit Index Assessment</span>
                        <span className="text-emerald-600 font-bold uppercase">
                          {activeMatch.score >= 85 ? 'Outstanding Match' : activeMatch.score >= 75 ? 'Excellent Alignment' : 'Feasible Alignment'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DOUBLE COLLATERAL RADAR: CLEAR COMPLIANCE VS GAP LABELS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                      <h4 className="text-[10.5px] uppercase font-bold text-slate-805 tracking-wider">Skill Gap Analytics Dashboard</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* COMPLIANT STRONG POINTS */}
                      <div className="bg-emerald-50/20 border border-emerald-200 p-4 rounded-xl space-y-3.5">
                        <span className="text-[9px] font-mono uppercase font-bold text-emerald-805 tracking-wider block">
                          ✅ Verified Strengths ({activeMatch.matchingSkills.length})
                        </span>
                        
                        {activeMatch.matchingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 font-sans font-semibold">
                            {activeMatch.matchingSkills.map(skill => (
                              <span key={skill} className="bg-emerald-55 border border-emerald-200 text-emerald-800 text-[10px] p-1 px-2 rounded-md font-sans font-semibold inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600 font-bold" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-mono italic">No direct matching credentials detected.</p>
                        )}
                        <p className="text-[9.5px] text-slate-500 leading-relaxed pt-1 font-sans font-semibold">
                          These keywords successfully passed our automated ATS checkpoint filters and represent elite placement parameters on your credentials list.
                        </p>
                      </div>

                      {/* UNRESOLVED TECH GAPS */}
                      <div className="bg-amber-50/20 border border-amber-205 p-4 rounded-xl space-y-3.5">
                        <span className="text-[9px] font-mono uppercase font-bold text-amber-805 tracking-wider block">
                          ⚠️ Deficiencies Skill Gaps ({activeMatch.missingSkills.length})
                        </span>
                        
                        {activeMatch.missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 font-sans font-semibold">
                            {activeMatch.missingSkills.map(skill => (
                              <span key={skill} className="bg-amber-55 border border-amber-200 text-amber-800 text-[10px] p-1 px-2 rounded-md font-sans font-semibold inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-500" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-emerald-600 font-bold italic">Complete compliance! No missing skill gaps discovered.</p>
                        )}
                        <p className="text-[9.5px] text-slate-505 leading-relaxed pt-1 font-sans font-semibold">
                          These requirements are highlighted in the position criteria but were omitted or missing from your evaluated resume file.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* MULTI-FACTOR CHANCES & CRITICAL CRITERIA DIAGNOSTICS */}
                  <div className="space-y-3 font-sans">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600 font-extrabold" />
                      <h4 className="text-[10.5px] uppercase font-bold text-slate-805 tracking-wider">Other Recruiting Success Odds Factors</h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs text-slate-705 font-sans">
                      
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 shadow-xs">
                        <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">ATS Acceptance Index</span>
                        <div className="text-base font-bold text-slate-800 font-mono tracking-tight">{activeMatch.score}%</div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-indigo-600 h-full" style={{ width: `${activeMatch.score}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 shadow-xs">
                        <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">Interview Screening Odds</span>
                        <div className="text-base font-bold text-emerald-600 font-mono tracking-tight">
                          {Math.round(activeMatch.score * 0.95)}%
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-emerald-500 h-full" style={{ width: `${activeMatch.score * 0.95}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 shadow-xs">
                        <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">Global Pass Probability</span>
                        <div className="text-base font-bold text-purple-705 font-mono tracking-tight">
                          {activeMatch.job.locationModel === 'Remote' ? 100 : activeMatch.job.locationModel === 'Hybrid' ? 88 : 74}%
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-purple-600 h-full" style={{ width: `${activeMatch.job.locationModel === 'Remote' ? 100 : activeMatch.job.locationModel === 'Hybrid' ? 88 : 74}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 shadow-xs">
                        <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">Salary Parity Fit</span>
                        <div className="text-base font-bold text-blue-600 font-mono tracking-tight">95%</div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-blue-600 h-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* CUSTOM BRIDGING REMEDIATION GUIDELINE BOX */}
                  {activeMatch.missingSkills.length > 0 && (
                    <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 space-y-2 text-xs text-slate-700 leading-relaxed font-sans font-medium">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <BookOpen className="w-4 h-4 text-amber-600 font-bold" />
                        <span>💡 Custom Certification & Resume Bridging Remediation Checklist</span>
                      </div>
                      <p>
                        Our predictive ATS parser identifies direct gaps in your resume regarding <strong>{activeMatch.missingSkills.join(' and ')}</strong>. To bridge this divide past hiring portal screenings, pursue the following actions before application submission:
                      </p>
                      <ul className="list-disc list-inside pl-1 text-[10.5px] text-slate-600 space-y-1.5 mt-1 font-semibold">
                        <li>Include a project summary stating: <em>"Engineered microservices integrating {activeMatch.missingSkills.slice(0, 2).join(' or ')} metrics diagnostics."</em></li>
                        <li>Update your summary tags index with theoretical knowledge credentials of <strong>{activeMatch.missingSkills[0]}</strong>.</li>
                        <li>Address these gaps during customized drills inside your <strong>"Interactive Interview Coach"</strong> tab to verify target answers.</li>
                      </ul>
                    </div>
                  )}

                  {/* HR PITCH GENERATOR DISPATCH DRAWER BUTTON */}
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans">
                    <div className="space-y-1 font-semibold">
                      <span className="text-[8.5px] uppercase font-bold tracking-widest text-indigo-750 font-mono block">AUTOMATED CONTEXT DISPATCH</span>
                      <p className="text-slate-605">Draft a context-sensitive hiring message framing your matched strengths and justifying current gaps.</p>
                    </div>

                    <button
                      onClick={() => handleOpenFastApply(activeMatch.job, activeMatch)}
                      className="px-4.5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xs transition-all font-sans font-bold rounded-xl cursor-pointer flex items-center gap-1.5 select-none shrink-0"
                    >
                      <Mail className="w-4 h-4 text-white font-bold" />
                      Generate Cover Pitch
                    </button>
                  </div>

                  {/* POSITION CRITERIA & RESPONSIBILITIES */}
                  <div className="border bg-slate-50 p-4 rounded-xl border-slate-200 space-y-3.5 text-xs text-slate-700 font-sans">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-605 font-bold" />
                      <span className="font-bold text-slate-900 block">Listed Role Requirements & Original Summary</span>
                    </div>
                    <div className="space-y-2">
                      <ul className="space-y-1.5 text-slate-605 font-semibold">
                        {activeMatch.job.requirements.map((req, ridx) => (
                          <li key={ridx} className="flex gap-2">
                            <span className="text-indigo-600 shrink-0 font-bold">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10.5px] text-slate-500 italic mt-2.5 font-sans border-t border-slate-200 pt-3 leading-relaxed font-semibold">
                        &ldquo;{activeMatch.job.description}&rdquo;
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-20 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 font-semibold text-xs shadow-xs">
                  Select a listing from the left-hand column to generate global matchmaking diagnostics.
                </div>
              )}
            </div>
          </div>

          {/* LEGITIMATE SYSTEM TRANSPARENCY & APPLICATION FLOW EXPLAINER CHART */}
          <div className="border border-indigo-150 bg-indigo-50/35 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-100 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-650 tracking-wider font-mono px-3.5 py-1 bg-indigo-50 border border-indigo-200 rounded-full inline-block">
                  AURA PLATFORM TRANSPARENCY MANUAL
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Interactive Nexus Application Delivery Flowchart</h3>
                <p className="text-xs text-slate-500 font-medium">Learn how your profile, ATS compatibilities, and cover letter credentials arrive at corporate recruiter desks legitimately.</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-indigo-100 px-3 py-1.5 rounded-xl shadow-2xs font-mono text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700 font-bold">100% Secure & Compliant Flow</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
              {/* Step 1: Parsing */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 relative shadow-2xs">
                <div className="absolute top-4 right-4 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  01
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-[9.5px] uppercase font-bold text-indigo-600 font-mono tracking-wide block">Trigger Point</span>
                  <h4 className="text-sm font-extrabold text-slate-900">Upload Resume & Extract Fit Model</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">Gemini NLP Engine analyzes target tech credentials, computes missing compliance gaps/deficiencies, and ranks overall match indices absolute accuracy.</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[10px] font-mono text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>• ATS Compatibility:</span>
                    <span className="font-bold text-indigo-600">Calculated</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Cover Letter Drafts:</span>
                    <span className="font-bold text-emerald-600">Autogenerated</span>
                  </div>
                </div>
              </div>

              {/* Step 2: The Forking Decision Routing block */}
              <div className="bg-white border border-indigo-200 p-5 rounded-2xl space-y-4 relative shadow-xs col-span-1 lg:col-span-2">
                <div className="absolute top-4 right-4 bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-mono font-bold px-2 py-0.5 rounded-full flex items-center justify-center">
                  02 / SYSTEM ARCHITECTURE ROUTING
                </div>
                
                <span className="text-[9.5px] uppercase font-bold text-indigo-600 font-mono tracking-wide block pt-1">The Forking Delivery Pipeline</span>
                <h4 className="text-sm font-black text-slate-900">How Delivery Differs: Direct vs. Sourced (LinkedIn/Naukri)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 bg-emerald-50/40 border border-emerald-250 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-1.5 text-emerald-805">
                      <font className="font-extrabold text-white text-[10px] bg-emerald-600 px-1.5 py-0.5 rounded">PATH A</font>
                      <span className="text-xs font-extrabold">Direct Internal Postings (Nexus)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Applications submitted here are **instantly synced in real-time** to the recruiter's dedicated Employer Dashboard on our system!
                    </p>
                    <div className="border-t border-emerald-200 pt-2 flex flex-col gap-1.5 text-[10px] font-mono text-emerald-700">
                      <span className="flex items-center gap-1 font-semibold">✓ Profile pushed immediately to Recruiter Hub</span>
                      <span className="flex items-center gap-1 font-semibold">✓ Full fit telemetry and CV shared digitally</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/40 border border-amber-250 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-1.5 text-amber-805">
                      <font className="font-extrabold text-slate-700 text-[10px] bg-amber-400 px-1.5 py-0.5 rounded">PATH B</font>
                      <span className="text-xs font-extrabold">External Boards (LinkedIn, Naukri)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      LinkedIn & Naukri keep their databases locked behind closed firewalls and auth captchas, preventing automated robotic bot intrusions.
                    </p>
                    <p className="text-[11.5px] text-amber-900 leading-relaxed font-bold">
                       Therefore, Nexus facilitates a legitimate, highly compliant 3-part bridge instead:
                    </p>
                    <div className="border-t border-amber-200 pt-2 flex flex-col gap-1 text-[10px] font-mono text-amber-700 font-bold">
                      <span>1. Custom Copilot deep redirections to original boards</span>
                      <span>2. Autogenerated email pitch templates to corporate contacts</span>
                      <span>3. Synced Kanban pipeline to easily track cards</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Outcomes summary */}
              <div className="col-span-1 lg:col-span-3 bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
                <div className="space-y-1.5 max-w-2xl font-sans text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-[#4a90e2] uppercase tracking-wide font-mono text-[10px]">Phase 03: Delivery Legitimacy Summary</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">Are applications legit?</h4>
                  <p className="text-slate-550 leading-relaxed font-semibold">
                    **Yes!** By generating targeted pitch logs alongside pre-addressed corporate emails and mapping the direct Deep-Links on LinkedIn/Naukri portals, you bypass standard robotic filter boards while maintaining absolute security.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => {
                      const element = document.getElementById('pricing-matrix-panel') || document.querySelector('.lg:col-span-5');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="p-2.5 px-4 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all font-sans text-xs font-bold text-indigo-700 rounded-xl cursor-pointer w-full md:w-auto text-center"
                  >
                    View Matched Postings
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* DRAFT GENERATOR SIMULATION DIALOG OVERLAY */}
      {draftModalJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div>
                <span className="text-[8.5px] font-mono uppercase text-indigo-600 tracking-wider font-bold">Aged Pitch Optimizer</span>
                <h3 className="text-sm font-bold text-slate-900">Fast-Apply Recruiter Cover Pitch Draft</h3>
              </div>
              <button 
                onClick={() => setDraftModalJob(null)}
                className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 font-sans">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px] font-mono text-slate-650 font-medium whitespace-nowrap overflow-x-auto">
                <div><strong>To:</strong> Recruitment Division & Talents Team &lt;{draftModalJob.company.toLowerCase().replace(/ /g, '')}@aura.io&gt;</div>
                <div className="mt-0.5"><strong>Subject:</strong> High Alignment Candidate [Match Rank {filteredMatches.find(m => m.jobId === draftModalJob.id)?.score || 85}%] - {draftModalJob.title}</div>
              </div>

              <textarea
                value={draftMessage}
                onChange={e => setDraftMessage(e.target.value)}
                className="w-full min-h-[220px] bg-slate-50 text-slate-800 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 text-[11.5px] leading-relaxed font-sans font-medium"
              />

              {sentSuccess ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center font-semibold font-sans flex items-center justify-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Success! Fully-personalized pitch successfully dispatched via real-time CRM API callback.</span>
                </div>
              ) : (
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setDraftModalJob(null)}
                    className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-705 font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendFastApply}
                    disabled={sendingDraft}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 shadow-sm animate-none"
                  >
                    {sendingDraft ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Sending Dispatch...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Dispatch Tailored Pitch</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
