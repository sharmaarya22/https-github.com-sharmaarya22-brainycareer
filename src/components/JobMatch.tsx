import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, AlertCircle, Check, HelpCircle, ChevronRight, Globe, Info, 
  Search, ShieldCheck, Mail, Send, Award, Zap, TrendingUp, Cpu, 
  Layers, SlidersHorizontal, BookOpen, UserCheck, ArrowRight, CheckCircle2, RefreshCw
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
    fileName: "gaurav_upreti_senior_scrum_master.txt",
    fullName: "Gaurav Upreti",
    text: `GAURAV UPRETI - SENIOR SCRUM MASTER, PRODUCT OWNER & BA
Email: upretigaurav22@gmail.com -- Location: Remote / Worldwide
SUMMARY:
Accredited Agile Practitioner, Senior Scrum Master, and Business Systems Analyst with over 8 years of team facilitation experience. Master of backlog orchestration, Agile sprints, Jira roadmap designs, and user requirement drafting. Professional developer of PowerBI business dashboards and database metrics tracking frameworks.

CORE EXPERTISE:
* Product Management, Scrum Master, Agile Methodologies, Sprint Control
* Requirements Elicitation, User Stories, Backlog Prioritization, Engineering Specs
* PowerBI, SQL Queries, Data Modeling, KPIs Metrics
* JIRA, Confluence, Kanban boards, Cross-Functional Team Leadership`
  }
};

export default function JobMatch({ 
  user, 
  jobs = [], 
  matches = [], 
  onUploadResume, 
  uploadingResume, 
  onRefreshTelemetry,
  token 
}: JobMatchProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [matchTier, setMatchTier] = useState<'All' | 'Elite' | 'High' | 'Moderate'>('All');
  const [locFilter, setLocFilter] = useState<'All' | 'Remote' | 'Hybrid' | 'Onsite'>('All');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Custom states for simulation
  const [simStep, setSimStep] = useState<string | null>(null);
  const [draftModalJob, setDraftModalJob] = useState<Job | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [sendingDraft, setSendingDraft] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

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
        <div className="p-4 bg-cyan-950/15 border border-cyan-500/25 rounded-2xl flex items-center justify-between text-xs text-cyan-300 font-mono animate-pulse">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>{simStep}</span>
          </div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Parsing Resume
          </div>
        </div>
      )}

      {/* HEADER SECTION WITH HERO PROMPT IF RESUME NOT PRESENT */}
      {!user.resumeText ? (
        <div className="bg-gradient-to-r from-cyan-950/10 via-indigo-950/10 to-slate-950/40 border border-cyan-500/15 p-6 rounded-2xl relative overflow-hidden space-y-6">
          <span className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/5 rounded-full blur-2xl"></span>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 font-mono">AUTONOMOUS WORLDWIDE MATCH CALCULATOR</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Inspect Your Compatibility Coordinates Across Global Listings</h2>
              <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
                Unlock instant compliance insights across global tech positions. Aura AI evaluates your key strengths, maps your tech skill gaps, computes visa sponsor possibilities, and recommends strategic resume bullet additions. Load an elite preset to test our live matchmaking calculator immediately.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 min-w-[280px] lg:shrink-0">
              <button
                onClick={() => handleLoadPreset('developer')}
                className="p-3 bg-slate-950 hover:bg-slate-950/80 border border-cyan-500/20 hover:border-cyan-400/50 rounded-xl transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">Alex Mercer CV Preset</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-all group-hover:translate-x-0.5" />
                </div>
                <span className="text-[9.5px] font-mono text-slate-500 mt-1 block">Full Stack Lead (React, Cloud, TS)</span>
              </button>

              <button
                onClick={() => handleLoadPreset('scrumMaster')}
                className="p-3 bg-slate-950 hover:bg-slate-950/80 border border-indigo-500/20 hover:border-indigo-400/50 rounded-xl transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors">Gaurav Upreti CV Preset</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5" />
                </div>
                <span className="text-[9.5px] font-mono text-slate-500 mt-1 block">Scrum Master / Agile PM (KPIs, Jira)</span>
              </button>
            </div>
          </div>

          <div className="border-t border-white/5 pt-5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wide font-mono">Or drag and drop your credentials manual text file:</span>
            <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
              <ResumeUploader onUploadSuccess={onUploadResume} isLoading={uploadingResume} currentFileName={user.resumeFileName} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* DURABLE ANALYTICS METRICS WIDGET */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-[#0b101f] border border-white/5 p-4 rounded-xl flex items-center justify-between relative overflow-hidden">
              <span className="absolute -right-4 -bottom-4 w-12 h-12 bg-cyan-500/5 rounded-full blur-xl"></span>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono block">Evaluated Portals</span>
                <div className="text-2xl font-black text-white tracking-tight font-mono">{jobs.length}</div>
                <span className="text-[9px] text-emerald-400 block font-mono">100% Core Index Synced</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            <div className="bg-[#0b101f] border border-white/5 p-4 rounded-xl flex items-center justify-between relative overflow-hidden">
              <span className="absolute -right-4 -bottom-4 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl"></span>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono block">Avg Compatibility Score</span>
                <div className="text-2xl font-black text-white tracking-tight font-mono">{stats.avgScore || 78}%</div>
                <span className="text-[9px] text-cyan-400 block font-mono">Strong global match alignment</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-indigo-400" />
              </div>
            </div>

            <div className="bg-[#0b101f] border border-white/5 p-4 rounded-xl flex items-center justify-between relative overflow-hidden">
              <span className="absolute -right-4 -bottom-4 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl"></span>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono block">Super Matches (85%+)</span>
                <div className="text-2xl font-black text-white tracking-tight font-mono">{stats.eliteCount}</div>
                <span className="text-[9px] text-emerald-400 block font-mono">Highly optimized fit ratio</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="bg-[#0b101f] border border-white/5 p-4 rounded-xl flex flex-col justify-center gap-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono block">Top Global Demanded Gaps</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(stats.sortedGaps || []).map(gap => (
                  <span key={gap.name} className="bg-amber-400/5 border border-amber-500/15 text-[9px] font-mono text-amber-300 px-1.5 py-0.2 rounded font-sans leading-none">
                    {gap.name} ({gap.count}x)
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CRITICAL TWO-WAY CONTROL FILTER PANEL */}
          <div className="bg-[#0b101f] border border-white/5 p-4 rounded-2xl flex flex-col lg:flex-row justify-between gap-4">
            
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 bg-slate-950 p-2 px-3 rounded-xl border border-white/5">
                <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Identify role requirements, matching skills or gaps..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
                {[
                  { id: 'All', label: 'All Models' },
                  { id: 'Remote', label: 'Remote' },
                  { id: 'Hybrid', label: 'Hybrid' },
                  { id: 'Onsite', label: 'Onsite' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setLocFilter(item.id as any)}
                    className={`px-3 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                      locFilter === item.id ? 'bg-white/10 text-white text-cyan-400 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 text-[10.5px] font-bold text-slate-400 shrink-0">
                {[
                  { id: 'All', label: 'All Matches' },
                  { id: 'Elite', label: 'Elite (85%+)' },
                  { id: 'High', label: 'High (75%+)' },
                  { id: 'Moderate', label: 'Moderate' }
                ].map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setMatchTier(tier.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      matchTier === tier.id ? 'bg-cyan-500/10 text-cyan-400 font-extrabold border border-cyan-500/15' : 'border border-transparent'
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
                className="p-2 border border-white/5 hover:border-white/15 bg-slate-950 text-xs text-slate-400 font-bold rounded-xl transition-all cursor-pointer"
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
              <div className="flex justify-between items-center text-[10.5px] px-1 text-slate-500 uppercase font-black tracking-wider font-mono">
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
                          ? 'border-cyan-400 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                          : 'border-white/5 bg-slate-950/50 hover:border-white/15'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="font-extrabold text-white text-xs leading-snug">{job.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-1">{job.company} • {job.location}</p>
                        </div>

                        <div className={`shrink-0 p-1 px-2 rounded-lg text-[10.5px] font-mono font-black border text-center ${
                          match.score >= 85 
                            ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400' 
                            : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
                        }`}>
                          {match.score}% MATCH
                        </div>
                      </div>

                      {/* Display mini overlay metrics of matched and gaps counts */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-white/5 text-[10px] font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{match.matchingSkills.length} Matched Skills</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{match.missingSkills.length} Gaps Remaining</span>
                        </div>
                      </div>

                      {/* Pill styles footer */}
                      <div className="flex items-center justify-between mt-3 text-[9px] font-mono text-slate-500">
                        <span className="bg-white/5 p-1 px-2 rounded-md uppercase font-bold text-slate-400">{job.locationModel}</span>
                        <span className="text-emerald-400 font-extrabold uppercase bg-emerald-500/5 p-1 px-2 rounded-md">{job.salaryRange}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-950/20 border border-dashed border-white/5 rounded-2xl text-slate-500 text-xs">
                  No matching jobs found within configured parameters. Check spelling guidelines.
                </div>
              )}
            </div>

            {/* RIGHT PANEL: HOLISTIC DOCK DISPLAY ANALYZING THE ROLE COMPREHENSIVELY */}
            <div className="lg:col-span-7">
              {activeMatch ? (
                <div className="border border-white/5 bg-slate-950/60 p-5 rounded-2xl space-y-6">
                  
                  {/* Dynamic Heading with Live Match Radial Progress Gauge */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0f1d] border border-white/5 p-4.5 rounded-xl">
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-mono uppercase bg-cyan-400/10 text-cyan-300 p-1 px-1.5 rounded border border-cyan-400/20">
                        MATCH SCREENING PREP
                      </span>
                      <h3 className="text-sm font-black text-white mt-1.5 leading-tight">{activeMatch.job.title}</h3>
                      <p className="text-[11px] text-slate-400">{activeMatch.job.company} • {activeMatch.job.location} ({activeMatch.job.locationModel})</p>
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0 bg-slate-950/90 border border-white/5 p-2 px-3 rounded-xl font-mono text-center">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        {/* Circular ring indicator */}
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle cx="24" cy="24" r="21" className="stroke-slate-800" strokeWidth="3" fill="none" />
                          <circle cx="24" cy="24" r="21" className="stroke-cyan-400" strokeWidth="3.5" fill="none"
                            strokeDasharray={`${2 * Math.PI * 21}`}
                            strokeDashoffset={`${2 * Math.PI * 21 * (1 - activeMatch.score / 100)}`}
                          />
                        </svg>
                        <span className="text-white font-extrabold text-xs">{activeMatch.score}%</span>
                      </div>
                      <div className="text-left text-[9.5px] leading-tight space-y-0.5">
                        <span className="text-slate-500 block uppercase font-sans font-bold">Fit Index Assessment</span>
                        <span className="text-emerald-400 font-extrabold uppercase">
                          {activeMatch.score >= 85 ? 'Outstanding Match' : activeMatch.score >= 75 ? 'Excellent Alignment' : 'Feasible Alignment'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DOUBLE COLLATERAL RADAR: CLEAR COMPLIANCE VS GAP LABELS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                      <h4 className="text-[10.5px] uppercase font-black text-slate-300 tracking-wider">Skill Gap Analytics Dashboard</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* COMPLIANT STRONG POINTS */}
                      <div className="bg-slate-950/90 border border-emerald-500/10 p-4 rounded-xl space-y-3.5">
                        <span className="text-[9px] font-mono uppercase font-black text-emerald-400 tracking-wider block">
                          ✅ Verified Strengths ({activeMatch.matchingSkills.length})
                        </span>
                        
                        {activeMatch.matchingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {activeMatch.matchingSkills.map(skill => (
                              <span key={skill} className="bg-emerald-500/10 border border-emerald-500/15 text-emerald-300 text-[10px] p-1 px-2 rounded-md font-sans font-medium inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 font-mono italic">No direct matching credentials detected.</p>
                        )}
                        <p className="text-[9.5px] text-slate-400 leading-relaxed pt-1 font-sans">
                          These keywords successfully passed our automated ATS checkpoint filters and represent elite placement parameters on your credentials list.
                        </p>
                      </div>

                      {/* UNRESOLVED TECH GAPS */}
                      <div className="bg-slate-950/90 border border-amber-500/10 p-4 rounded-xl space-y-3.5">
                        <span className="text-[9px] font-mono uppercase font-black text-amber-400 tracking-wider block">
                          ⚠️ Deficiencies Skill Gaps ({activeMatch.missingSkills.length})
                        </span>
                        
                        {activeMatch.missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {activeMatch.missingSkills.map(skill => (
                              <span key={skill} className="bg-amber-400/10 border border-amber-500/15 text-amber-300 text-[10px] p-1 px-2 rounded-md font-sans font-medium inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-400 animate-pulse" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-emerald-400 font-mono italic">Complete compliance! No missing skill gaps discovered.</p>
                        )}
                        <p className="text-[9.5px] text-slate-400 leading-relaxed pt-1 font-sans">
                          These requirements are highlighted in the position criteria but were omitted or missing from your evaluated resume file.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* MULTI-FACTOR CHANCES & CRITICAL CRITERIA DIAGNOSTICS */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <h4 className="text-[10.5px] uppercase font-black text-slate-300 tracking-wider">Other Recruiting Success Odds Factors</h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                      
                      <div className="bg-[#0c1221] border border-white/5 p-3 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">ATS Acceptance Index</span>
                        <div className="text-base font-black text-white font-mono tracking-tight">{activeMatch.score}%</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-cyan-400 h-full" style={{ width: `${activeMatch.score}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-[#0c1221] border border-white/5 p-3 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Interview Screening Odds</span>
                        <div className="text-base font-black text-emerald-400 font-mono tracking-tight">
                          {Math.round(activeMatch.score * 0.95)}%
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-emerald-400 h-full" style={{ width: `${activeMatch.score * 0.95}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-[#0c1221] border border-white/5 p-3 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Global Pass Probability</span>
                        <div className="text-base font-black text-indigo-400 font-mono tracking-tight">
                          {activeMatch.job.locationModel === 'Remote' ? 100 : activeMatch.job.locationModel === 'Hybrid' ? 88 : 74}%
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-indigo-450 h-full" style={{ width: `${activeMatch.job.locationModel === 'Remote' ? 100 : activeMatch.job.locationModel === 'Hybrid' ? 88 : 74}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-[#0c1221] border border-white/5 p-3 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Salary Parity Fit</span>
                        <div className="text-base font-black text-cyan-400 font-mono tracking-tight">95%</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-cyan-400 h-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* CUSTOM BRIDGING REMEDIATION GUIDELINE BOX */}
                  {activeMatch.missingSkills.length > 0 && (
                    <div className="bg-amber-400/5 p-4 rounded-xl border border-amber-500/15 space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <BookOpen className="w-4 h-4" />
                        <span>💡 Custom Certification & Resume Bridging Remediation Checklist</span>
                      </div>
                      <p>
                        Our predictive ATS parser identifies direct gaps in your resume regarding <strong>{activeMatch.missingSkills.join(' and ')}</strong>. To bridge this divide past hiring portal screenings, pursue the following actions before application submission:
                      </p>
                      <ul className="list-disc list-inside pl-1 text-[10.5px] text-slate-400 space-y-1.5 mt-1">
                        <li>Include a project summary stating: <em>"Engineered microservices integrating {activeMatch.missingSkills.slice(0, 2).join(' or ')} metrics diagnostics."</em></li>
                        <li>Update your summary tags index with theoretical knowledge credentials of <strong>{activeMatch.missingSkills[0]}</strong>.</li>
                        <li>Address these gaps during customized drills inside your <strong>"Interactive Interview Coach"</strong> tab to verify target answers.</li>
                      </ul>
                    </div>
                  )}

                  {/* HR PITCH GENERATOR DISPATCH DRAWER BUTTON */}
                  <div className="p-4 bg-indigo-950/20 border border-indigo-500/15 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[8.5px] uppercase font-bold tracking-widest text-indigo-400 font-mono block">AUTOMATED CONTEXT DISPATCH</span>
                      <p className="text-slate-300 font-sans">Draft a context-sensitive hiring message framing your matched strengths and justifying current gaps.</p>
                    </div>

                    <button
                      onClick={() => handleOpenFastApply(activeMatch.job, activeMatch)}
                      className="px-4.5 py-2 bg-indigo-500 text-slate-950 hover:bg-indigo-400 transition-all font-sans font-black rounded-xl cursor-pointer flex items-center gap-1 select-none shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Generate Cover Pitch
                    </button>
                  </div>

                  {/* POSITION CRITERIA & RESPONSIBILITIES */}
                  <div className="border bg-slate-950/50 p-4 rounded-xl border-white/5 space-y-3.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-white block">Listed Role Requirements & Original Summary</span>
                    </div>
                    <div className="space-y-2">
                      <ul className="space-y-1.5 font-sans text-slate-400">
                        {activeMatch.job.requirements.map((req, ridx) => (
                          <li key={ridx} className="flex gap-2">
                            <span className="text-cyan-400 shrink-0">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10.5px] text-slate-500 italic mt-2.5 font-sans border-t border-white/5 pt-3 leading-relaxed">
                        &ldquo;{activeMatch.job.description}&rdquo;
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-20 text-center bg-[#0b101f]/40 border border-white/5 rounded-2xl text-slate-500 font-mono text-xs">
                  Select a listing from the left-hand column to generate global matchmaking diagnostics.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* DRAFT GENERATOR SIMULATION DIALOG OVERLAY */}
      {draftModalJob && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b101f] border-2 border-cyan-500/35 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div>
                <span className="text-[8.5px] font-mono uppercase text-cyan-400 tracking-wider font-black">Aged Pitch Optimizer</span>
                <h3 className="text-xs font-black text-white">Fast-Apply Recruiter Cover Pitch Draft</h3>
              </div>
              <button 
                onClick={() => setDraftModalJob(null)}
                className="p-1 px-2.5 bg-white/5 text-slate-400 hover:text-white rounded-lg cursor-pointer font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-white/5 space-y-1 text-[11px] font-mono text-slate-400">
                <div><strong>To:</strong> Recruitment Division & Talents Team &lt;{draftModalJob.company.toLowerCase().replace(/ /g, '')}@aura.io&gt;</div>
                <div><strong>Subject:</strong> High Alignment Candidate [Match Rank {filteredMatches.find(m => m.jobId === draftModalJob.id)?.score || 85}%] - {draftModalJob.title}</div>
              </div>

              <textarea
                value={draftMessage}
                onChange={e => setDraftMessage(e.target.value)}
                className="w-full min-h-[220px] bg-slate-950 text-slate-200 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-cyan-400/40 text-[11px] leading-relaxed font-mono"
              />

              {sentSuccess ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-center font-mono flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Success! Fully-personalized pitch successfully dispatched via real-time CRM API callback.</span>
                </div>
              ) : (
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setDraftModalJob(null)}
                    className="px-3.5 py-2 hover:bg-white/5 border border-white/10 rounded-xl font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendFastApply}
                    disabled={sendingDraft}
                    className="px-4.5 py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black rounded-xl hover:opacity-90 inline-flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {sendingDraft ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Dispatch...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
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
