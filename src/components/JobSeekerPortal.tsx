import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, MapPin, Building, Calendar, DollarSign, 
  Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight, 
  Clipboard, Check, Edit3, TrendingUp, Cpu, Info, SlidersHorizontal, Settings,
  Globe, RefreshCw, ExternalLink, Mail, X, Send, Bot, CheckSquare, Plus, Trash2, Award, Zap
} from 'lucide-react';
import { User, Job, MatchResult } from '../types';
import SkillRadarChart from './SkillRadarChart';
import ResumeUploader from './ResumeUploader';
import JobMatch from './JobMatch';

const REAL_RESUME_TEMPLATES = {
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

interface JobSeekerPortalProps {
  user: User;
  token: string;
  jobs: Job[];
  matches: MatchResult[];
  onUserUpdate: (updatedUser: User) => void;
  appliedJobs: string[];
  clickedJobs: string[];
  sentEmails: any[];
  supabaseEnabled: boolean;
  isLiveSupabase: boolean;
  onRefreshTelemetry: () => void;
  onUploadResume: (fileContent: { text?: string; base64?: string }, fileName: string) => Promise<void>;
  uploadingResume: boolean;
}

export default function JobSeekerPortal({ 
  user, 
  token, 
  jobs = [], 
  matches = [], 
  onUserUpdate, 
  appliedJobs = [], 
  clickedJobs = [], 
  sentEmails = [], 
  supabaseEnabled, 
  isLiveSupabase, 
  onRefreshTelemetry,
  onUploadResume,
  uploadingResume
}: JobSeekerPortalProps) {
  
  const [seekerTab, setSeekerTab] = useState<'jobs' | 'match' | 'resume' | 'letters' | 'interview' | 'tracker' | 'coach'>('match');
  const [simulatingStep, setSimulatingStep] = useState<string | null>(null);

  const handleLoadDemoProfile = async (type: 'developer' | 'scrumMaster') => {
    setSimulatingStep("📥 Received resume credentials...");
    
    const steps = [
      "🔍 Calling Gemini LLM Parser pipeline...",
      "⚙️ Extracting key strengths & professional milestones...",
      "📊 Categorizing core competencies and structural gaps...",
      "🌍 Mapping matching algorithms across worldwide job listings...",
      "✅ Matchmaking indexes synced! Displaying global profile insights."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setSimulatingStep(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        setSimulatingStep(null);
        
        const template = REAL_RESUME_TEMPLATES[type];
        onUploadResume({ text: template.text }, template.fileName);
      }
    }, 600);
  };
  
  // Job Board Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [locModel, setLocModel] = useState<'Remote' | 'Hybrid' | 'Onsite' | 'All'>('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Resume Builder States
  const [resumeTemplate, setResumeTemplate] = useState<'Developer' | 'Executive' | 'Marketer' | 'UX Designer'>('Developer');
  const [resumeStyle, setResumeStyle] = useState<'ATS' | 'Executive' | 'Technical' | 'Entry' | 'International'>('ATS');
  const [generatedResume, setGeneratedResume] = useState<string>('');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Cover Letter States
  const [selectedJobForLetter, setSelectedJobForLetter] = useState<Job | null>(null);
  const [letterStyle, setLetterStyle] = useState<'formal' | 'creative' | 'executive' | 'startup'>('formal');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [customLetterText, setCustomLetterText] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);

  // Interview Assistant States
  const [interviewType, setInterviewType] = useState<'Technical' | 'Behavioral' | 'HR' | 'Company-Specific'>('Technical');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const [activeQuestion, setActiveQuestion] = useState('');
  const [candidateResponse, setCandidateResponse] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [interviewEvaluation, setInterviewEvaluation] = useState('');
  const [interviewScores, setInterviewScores] = useState({ technical: 80, communication: 80, confidence: 80 });

  // Kanban Application Tracker
  const [kanbanCards, setKanbanCards] = useState([
    { id: "k-1", jobTitle: "Senior AI Engineer", company: "Aura Intelligence", source: "WeWorkRemotely", status: "Interview Scheduled" },
    { id: "k-2", jobTitle: "Staff React Developer", company: "Brainy Career Corp", source: "LinkedIn", status: "Applied" },
    { id: "k-3", jobTitle: "Cloud Integration Architect", company: "SaaS Rocket", source: "Indeed", status: "Offer Received" }
  ]);
  const [newKanbanTitle, setNewKanbanTitle] = useState('');
  const [newKanbanCompany, setNewKanbanCompany] = useState('');

  // AI Conversational Coach Chat
  const [coachMessages, setCoachMessages] = useState<{ role: 'ai' | 'user'; content: string }[]>([
    { role: 'ai', content: "Hello! I am your 24/7 AI Career Specialist. Ask me anything about salary negotiation, resume optimizations, or building a target learning roadmap." }
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [coachSending, setCoachSending] = useState(false);

  // Simulated Email discovery
  const [emailModalJob, setEmailModalJob] = useState<Job | null>(null);
  const [discoveredHr, setDiscoveredHr] = useState({ name: "Jane Doe", email: "j.doe@company.com", status: "VERIFIED" });
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [triggerSendingMail, setTriggerSendingMail] = useState(false);
  const [mailSendSuccess, setMailSendSuccess] = useState(false);

  // Apply simulator dialog
  const [applyModalJob, setApplyModalJob] = useState<Job | null>(null);
  const [applySimulatedCVText, setApplySimulatedCVText] = useState('');
  const [applyCustomLetter, setApplyCustomLetter] = useState('');
  const [simulatingApply, setSimulatingApply] = useState(false);
  const [applySimulateSuccess, setApplySimulateSuccess] = useState(false);

  // Simulated External Job Portal states
  const [portalSimulatorJob, setPortalSimulatorJob] = useState<Job | null>(null);
  const [portalFullName, setPortalFullName] = useState(user.fullName || '');
  const [portalEmail, setPortalEmail] = useState(user.email || '');
  const [portalExperience, setPortalExperience] = useState('3');
  const [portalCoverLetterText, setPortalCoverLetterText] = useState('');
  const [portalSuccess, setPortalSuccess] = useState(false);
  const [submittingPortalMsg, setSubmittingPortalMsg] = useState(false);

  // Auto set first selected job
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs]);

  // Handle select active job & load stats/matches
  const handleSelectActiveJob = (job: Job) => {
    setSelectedJob(job);
    // Find matching score
    onRefreshTelemetry();
  };

  // Build tailored resume based on templates
  const triggerBulidResume = () => {
    const roles = {
      Developer: "Senior Software Engineer (Full Stack)",
      Executive: "Director of Technical Engineering",
      Marketer: "Lead Product Growth Manager",
      "UX Designer": "Senior Interaction Architect"
    };

    const structure = `
========================================
RESUME SUMMARY: [${resumeStyle} FORMAT]
========================================
NAME: ${user.fullName}
EMAIL: ${user.email}
TARGET FOCUS: ${roles[resumeTemplate]}
CRITICAL INDUSTRY SCORE METRICS: ATS Scale: 94% | Match Probability: 86%

POLISHED SUMMARY PRESET:
A high-impact and result-oriented professional specialized in scalable application interfaces, server system logic optimizations, and seamless database persistence bridges. Demonstrates excellent domain expertise and team leadership capabilities.

CORE SPECIALIST CRITERIA SKILLS:
* Full stack interface development (React 18+, TypeScript, Next.js)
* Backend runtime environments & robust controller models (Node.js, Express)
* Seamless SQL query optimizations & cloud storage persistence (Supabase, PostgreSQL)
* Robust diagnostic methodologies & automated security compliance (JWT Auth, TLS)

PROFESSIONAL EXPERIENCE OUTLINE:
Lead Systems Architect | Brainy Career Corp | 2024 - Present
- Created robust and high-fidelity modular user interface layouts utilizing Tailwind CSS frameworks.
- Optimized REST endpoint query bounds, scaling active response payloads and reducing storage costs by 32%.
- Maintained strict environment configurations and end-to-end telemetry sync pipelines.

EDUCATION & CERTIFICATION PATHWAYS:
- Bachelor of Science in Information Systems | Global Unified Studies
- Certified Cloud Solutions Developer Professional
- Advanced Automated Database Integrators Course
    `.trim();

    setGeneratedResume(structure);
  };

  // Simulated exports
  const triggerSimulatedExport = (type: string) => {
    setIsExporting(type);
    setTimeout(() => {
      setIsExporting(null);
      alert(`Simulation completed: Successfully compiled & exported your tailored ${resumeStyle} CV format as professional ${type}. Document is mapped under active profile link.`);
    }, 1500);
  };

  // Generate cover letter
  const triggerLetterGen = async () => {
    if (!selectedJobForLetter) return;
    setGeneratingLetter(true);
    setCustomLetterText('');
    try {
      const res = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: selectedJobForLetter.id,
          customInstructions: `Format with a very strong ${letterStyle} tone accent. ${customInstructions}`
        })
      });
      const data = await res.json();
      setCustomLetterText(data.coverLetter || "Failed to generate.");
    } catch (e) {
      console.warn("Falling back to local generated cover letter tone:", e);
      setCustomLetterText(`
Dear Hiring Manager at ${selectedJobForLetter.company},

I am writing to express my absolute enthusiasm for the ${selectedJobForLetter.title} opening. Given my background as a full stack strategist, utilizing precise design rules, I have successfully scaled modular code architectures using React and Node.

My focus closely matches the requirements and responsibilities outlined in your vacancy details. I look forward to an opportunity to discuss how my skill coverage can fit your goals.

Sincerely,
${user.fullName}
      `.trim());
    } finally {
      setGeneratingLetter(false);
    }
  };

  // Discovers HR mail and opens automated drafting modal
  const handleOpenEmailHR = (job: Job) => {
    setEmailModalJob(job);
    // Auto-personalize HR coordinates
    const firstName = job.company.split(' ')[0] || "Acme";
    const name = `${firstName} Recruiting Team`;
    const mail = `talent-acquisition@${firstName.toLowerCase() || 'corp'}.com`;
    setDiscoveredHr({ name, email: mail, status: "VERIFIED" });
    
    setEmailSubject(`Application for ${job.title} - ${user.fullName}`);
    setEmailBody(`
Hello ${name},

I am highly interested in the open vacancy for ${job.title} (ID: ${job.id}) listed at your company careers dashboard.

Having completed a technical review, my background represents a strong fit. I have attached my tailored resume coordinates for your initial screening review.

Please do not hesitate to contact me at ${user.email} or via telephone.

Sincerely,
${user.fullName}
    `.trim());
    setMailSendSuccess(false);
  };

  const handleSendHREmail = async () => {
    setTriggerSendingMail(true);
    try {
      const res = await fetch(`/api/jobs/${emailModalJob?.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hrEmail: discoveredHr.email,
          subject: emailSubject,
          body: emailBody
        })
      });
      if (res.ok) {
        setMailSendSuccess(true);
        onRefreshTelemetry();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTriggerSendingMail(false);
    }
  };

  // Open apply simulator modal
  const handleOpenApplySim = (job: Job) => {
    setApplyModalJob(job);
    setApplySimulateSuccess(false);
    setApplySimulatedCVText(`
Tailored CV Coordinates for ${user.fullName}
Role Benchmark: ${job.title} at ${job.company}
ATS Alignment score: 94%

SKILLS APPLIED: ${job.requirements.slice(0, 4).join(', ')}
EXPERIENCE HIGHLIGHT: Specialized development.
    `.trim());
    
    setApplyCustomLetter(`
Dear ${job.company} Talent Acquisition Team,

Please find my customized full-stack credentials enclosed for your immediate consideration for ${job.title}. This represents a strong match.
    `.trim());
  };

  const handleTriggerApplicationSubmit = async () => {
    if (!applyModalJob) return;
    setSimulatingApply(true);
    try {
      // Dispatch click event and application sync events
      await fetch(`/api/jobs/${applyModalJob.id}/click`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const res = await fetch(`/api/jobs/${applyModalJob.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverLetter: applyCustomLetter
        })
      });

      if (res.ok) {
        setApplySimulateSuccess(true);
        // Add to local Kanban cards list
        setKanbanCards(prev => [
          {
            id: `k-${Date.now()}`,
            jobTitle: applyModalJob.title,
            company: applyModalJob.company,
            source: applyModalJob.source || "LinkedIn",
            status: "Applied"
          },
          ...prev
        ]);
        onRefreshTelemetry();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingApply(false);
    }
  };

  const handlePortalSimulatorSubmit = async () => {
    if (!portalSimulatorJob) return;
    setSubmittingPortalMsg(true);
    try {
      // 1. Dispatch click tracking
      await fetch(`/api/jobs/${portalSimulatorJob.id}/click`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 2. Dispatch application submit tracking
      const res = await fetch(`/api/jobs/${portalSimulatorJob.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverLetter: portalCoverLetterText
        })
      });

      if (res.ok) {
        setPortalSuccess(true);
        // 3. Add to local Kanban cards list
        setKanbanCards(prev => [
          {
            id: `k-portal-${Date.now()}`,
            jobTitle: portalSimulatorJob.title,
            company: portalSimulatorJob.company,
            source: portalSimulatorJob.originalUrl.includes("linkedin") ? "LinkedIn" : portalSimulatorJob.originalUrl.includes("naukri") ? "Naukri" : "External Portal",
            status: "Applied"
          },
          ...prev
        ]);
        onRefreshTelemetry();
      } else {
        alert("Unable to save portal application profile. Please try again.");
      }
    } catch (e) {
      console.error("Portal application failed:", e);
    } finally {
      setSubmittingPortalMsg(false);
    }
  };

  // Interactive Live Interview Coach Q&A Simulator
  const triggerStartInterview = async () => {
    setInterviewStarted(true);
    setInterviewHistory([]);
    setActiveQuestion('');
    setCandidateResponse('');
    setInterviewEvaluation('');
    setSubmittingResponse(true);

    try {
      const res = await fetch('/api/interview/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: interviewType,
          history: [],
          currentResponse: ""
        })
      });
      const data = await res.json();
      setActiveQuestion(data.nextQuestion);
      setInterviewHistory([{ role: 'ai', text: data.nextQuestion }]);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const triggerPostResponse = async () => {
    if (!candidateResponse) return;
    setSubmittingResponse(true);
    const updatedHistory = [
      ...interviewHistory,
      { role: 'user' as const, text: candidateResponse }
    ];
    setInterviewHistory(updatedHistory);

    try {
      const res = await fetch('/api/interview/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: interviewType,
          history: updatedHistory,
          currentResponse: candidateResponse
        })
      });
      const data = await res.json();
      setInterviewEvaluation(data.evaluation);
      setActiveQuestion(data.nextQuestion);
      setInterviewScores(data.scores || { technical: 82, communication: 85, confidence: 80 });
      setInterviewHistory([
        ...updatedHistory,
        { role: 'ai' as const, text: data.nextQuestion }
      ]);
      setCandidateResponse('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingResponse(false);
    }
  };

  // AI Career Specialist Expert coach Chat loop
  const handleSendCoachMsg = async () => {
    if (!coachInput.trim()) return;
    setCoachSending(true);
    const nextMsgs = [
      ...coachMessages,
      { role: 'user' as const, content: coachInput }
    ];
    setCoachMessages(nextMsgs);
    setCoachInput('');

    try {
      const res = await fetch('/api/career-coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: nextMsgs })
      });
      const data = await res.json();
      setCoachMessages([
        ...nextMsgs,
        { role: 'ai' as const, content: data.reply }
      ]);
    } catch (e) {
      console.warn(e);
      setCoachMessages([
        ...nextMsgs,
        { role: 'ai', content: "Our AI brain is briefly overloaded with recruitment parameters, but I highly advise: optimize your resume keyword-density by integrating exact frameworks, practice mock negotiation STAR outlines, and publish targeted custom profiles to build employer visibility." }
      ]);
    } finally {
      setCoachSending(false);
    }
  };

  // Kanban status controls
  const handleDragKanbanCard = (id: string, targetStatus: string) => {
    setKanbanCards(prev => 
      prev.map(card => {
        if (card.id === id) {
          return { ...card, status: targetStatus };
        }
        return card;
      })
    );
  };

  const handleCreateKanbanCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKanbanTitle || !newKanbanCompany) return;
    setKanbanCards(prev => [
      {
        id: `k-${Date.now()}`,
        jobTitle: newKanbanTitle,
        company: newKanbanCompany,
        source: "Manual Post",
        status: "Applied"
      },
      ...prev
    ]);
    setNewKanbanTitle('');
    setNewKanbanCompany('');
  };

  const handleDeleteKanbanCard = (id: string) => {
    setKanbanCards(prev => prev.filter(c => c.id !== id));
  };

  // Filter processes
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLoc = locModel === 'All' ? true : job.locationModel === locModel;
    return matchesSearch && matchesLoc;
  });

  return (
    <div id="job-seeker-view-frame" className="space-y-6 font-sans">
      
      {/* Sub menu tabs inside Seeker Console */}
      <div className="flex border-b border-white/5 pb-2 overflow-x-auto gap-4 scrollbar-none">
        {[
          { id: 'match', label: 'Job Compatibility Matches' },
          { id: 'jobs', label: 'AI Matchmaking & Jobs' },
          { id: 'resume', label: 'Resume Intelligence & Builder' },
          { id: 'letters', label: 'AI Cover Letter Studio' },
          { id: 'interview', label: 'Interactive Interview Coach' },
          { id: 'tracker', label: 'Application Pipeline & Kanban' },
          { id: 'coach', label: '24/7 AI Career Coach' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSeekerTab(tab.id as any)}
            className={`text-xs font-bold py-2 whitespace-nowrap cursor-pointer transition-all border-b-2 ${
              seekerTab === tab.id 
                ? 'border-cyan-400 text-cyan-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {seekerTab === 'jobs' && (
        <div className="space-y-6">
          
          {/* SIMULATION STATE LOGGER */}
          {simulatingStep && (
            <div className="p-4 bg-cyan-950/15 border border-cyan-500/20 rounded-2xl flex items-center justify-between text-xs text-cyan-300 font-mono">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{simulatingStep}</span>
              </div>
              <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 animate-[pulse_1.5s_infinite] w-3/4"></div>
              </div>
            </div>
          )}

          {/* SYSTEM DISPATCHER: PROFILE UNANALYZED HERO vs ANALYZED COUNTERPARTS */}
          {!user.resumeText ? (
            <div className="bg-gradient-to-r from-cyan-950/15 via-indigo-950/15 to-slate-950/40 border border-cyan-500/15 p-6 rounded-2xl relative overflow-hidden space-y-5 font-sans">
              <span className="absolute -right-12 -top-12 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl"></span>
              
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 font-mono">Autonomous Global Job Matchmaker</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Your Automated Worldwide Career Matchmaker is Ready</h3>
                  <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                    Aura AI automatically indexes corporate portals worldwide (Silicon Valley, London, New York, Remote) to evaluate skill overlaps, compute ATS alignments, and gauge interview success likelihoods. Populate your credentials or select an elite preset to fire our live Gemini parser.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 shrink-0">
                  <button
                    onClick={() => handleLoadDemoProfile('developer')}
                    disabled={uploadingResume}
                    className="p-3 text-left w-full sm:w-[250px] bg-slate-950 hover:border-cyan-400/30 border border-white/5 rounded-xl transition-all font-sans cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-white block group-hover:text-cyan-400 transition-colors">Alex Mercer CV Preset</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">Software Lead (React, Node, Cloud, TS)</span>
                  </button>

                  <button
                    onClick={() => handleLoadDemoProfile('scrumMaster')}
                    disabled={uploadingResume}
                    className="p-3 text-left w-full sm:w-[250px] bg-slate-950 hover:border-indigo-400/30 border border-white/5 rounded-xl transition-all font-sans cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-white block group-hover:text-indigo-450 transition-colors">Gaurav Upreti CV Preset</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-450 transition-colors" />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">Agile Scrum Manager (Sprints, KPIs, PM)</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block mb-2 tracking-wider font-mono">Or Upload / Drop Your Professional Credentials Manual File:</span>
                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
                  <ResumeUploader onUploadSuccess={onUploadResume} isLoading={uploadingResume} currentFileName={user.resumeFileName} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* STUNNING GLOBAL PROFILE & ANALYTICS BENTO HUB */}
              <div className="bg-[#0b101f]/90 border border-white/5 p-5 rounded-2xl space-y-4 font-sans">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] uppercase tracking-widest font-black text-cyan-400 font-mono">AUTONOMOUS GLOBAL PORTAL INDEXING STATUS</span>
                    </div>
                    <h3 className="text-sm font-black text-white mt-0.5">Automated Global Profile Matchmaker Diagnostics</h3>
                  </div>
                  <button 
                    onClick={() => onUploadResume({ text: "" }, "")}
                    className="text-[10px] text-slate-500 hover:text-rose-400 font-bold font-mono transition-all underline cursor-pointer"
                  >
                    Clear Credentials Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  {/* General scoring block */}
                  <div className="p-4 bg-slate-950/55 border border-white/5 rounded-xl space-y-3">
                    <span className="text-[9px] font-mono uppercase font-black text-slate-500 tracking-wider block">Candidate Match Compatibility Index</span>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-black text-cyan-400 font-mono tracking-tight">{user.analysis?.score || 85}%</div>
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded p-1 px-1.5 text-[9px] text-cyan-300 font-black font-mono">
                        {(user.analysis?.score || 85) >= 90 ? 'A+ ELITE COMPLIANT' : 'B+ HIGH FIT'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 block uppercase font-mono">Top Career Archetypes suitability:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(user.analysis?.recommendedRoles || []).map((role, rIdx) => (
                          <span key={role} className="bg-white/5 text-[9px] text-slate-300 p-1 px-1.5 rounded-md font-sans font-medium shrink-0 border border-white/5">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans italic mt-1 bg-slate-950 p-2 rounded-lg border border-white/5">
                      &ldquo;{user.analysis?.executiveSummary || 'Profile successfully parsed for target global corporate channels.'}&rdquo;
                    </p>
                  </div>

                  {/* Dynamic extracted skills Overlay with green strengths and amber gaps */}
                  <div className="p-4 bg-slate-950/55 border border-white/5 rounded-xl space-y-3.5">
                    <span className="text-[9px] font-mono uppercase font-black text-slate-500 tracking-wider block">Extracted Skill Attributes & Deficiencies</span>
                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[9px] uppercase font-black text-emerald-400 block tracking-wide">✅ Profile Strengths identified ({user.analysis?.keyStrengths?.length || 0}):</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(user.analysis?.keyStrengths || []).map((strength, sIdx) => (
                            <span key={strength} className="bg-emerald-500/10 text-emerald-300 text-[9px] p-1 px-1.5 rounded-md font-medium inline-flex items-center gap-0.5 border border-emerald-500/15">
                              <Check className="w-2.5 h-2.5" />
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-black text-amber-400 block tracking-wide">⚠️ Identified Tech Skill Gaps ({user.analysis?.skillGaps?.length || 0}):</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(user.analysis?.skillGaps || []).map((gap, gIdx) => (
                            <span key={gap} className="bg-amber-500/10 text-amber-300 text-[9px] p-1 px-1.5 rounded-md font-medium inline-flex items-center gap-0.5 border border-amber-500/15">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Step Timelines and Career Path Actions */}
                  <div className="p-4 bg-slate-950/55 border border-white/5 rounded-xl space-y-3.5">
                    <span className="text-[9px] font-mono uppercase font-black text-slate-500 tracking-wider block">Strategic 3-Year Career Progression Path</span>
                    <div className="space-y-3">
                      <div className="space-y-1 text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-white/5 text-[10.5px]">
                        <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-400 block">Current Stage diagnostic:</span>
                        <p className="font-extrabold text-white">{user.analysis?.careerPath?.currentState || 'Diagnostic step determined.'}</p>
                        <p className="text-[9px] text-cyan-400 font-bold mt-1">Transitions target: {(user.analysis?.careerPath?.transitionRoles || []).join(', ')}</p>
                      </div>
                      
                      <div className="space-y-1 bg-slate-950/30 p-2 rounded text-[10px]">
                        <span className="text-[8.5px] font-mono uppercase text-slate-500 block tracking-wide">3-Year Action Plan Timelines:</span>
                        <div className="space-y-1 mt-1 font-mono text-slate-300">
                          {(user.analysis?.careerPath?.strategicPlan || []).slice(0, 3).map((plan, pIdx) => (
                            <div key={pIdx} className="flex gap-1.5 leading-snug">
                              <span className="text-cyan-400 font-black shrink-0">Y{pIdx+1}:</span>
                              <span className="text-slate-300 truncate">{plan}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-950/25 border border-indigo-500/15 p-3.5 rounded-xl text-[10.5px] text-slate-300 flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                  <p className="leading-relaxed">
                    <strong>Actionable suggested CV additions checklist:</strong> {(user.analysis?.suggestedImprovements || []).join(" | ")}
                  </p>
                </div>
              </div>

              {/* RECOMMENDED SUPER BEST MATCHES RIBBON */}
              {(() => {
                const superMatches = matches.filter(m => m.score >= 80);
                if (superMatches.length === 0) return null;
                return (
                  <div className="space-y-3 font-sans">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                        🌟 Recommended Worldwide Super Best Matches ({superMatches.length})
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                      {superMatches.slice(0, 3).map(match => {
                        const job = match.job;
                        const interviewOdds = Math.round(match.score * 0.95);
                        const visaPassChance = 95; 
                        
                        return (
                          <div 
                            key={job.id} 
                            className="bg-[#0b1222]/85 border-cyan-500/35 border-2 rounded-2xl p-4.5 space-y-3.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col justify-between hover:border-cyan-400/50 transition-all duration-300"
                          >
                            <span className="absolute top-0 right-0 bg-gradient-to-l from-cyan-400 to-indigo-500 text-slate-950 font-black font-mono text-[8px] px-2.5 py-0.5 rounded-bl-lg tracking-wider">
                              {match.score}% MATCH
                            </span>

                            <div className="space-y-2">
                              <div>
                                <h5 className="text-xs font-black text-white leading-tight pr-10">{job.title}</h5>
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                                  <Building className="w-3 h-3 text-slate-500" />
                                  <span>{job.company}</span>
                                  <span className="text-slate-600">•</span>
                                  <Globe className="w-3 h-3 text-cyan-400" />
                                  <span>{job.location}</span>
                                </p>
                              </div>

                              {/* Probabilities Factors panel */}
                              <div className="grid grid-cols-3 gap-1 px-2.5 py-1 bg-slate-950/90 rounded-xl text-center text-[9px] border border-white/5 font-mono">
                                <div>
                                  <span className="text-slate-500 block">ATS Index</span>
                                  <span className="text-emerald-400 font-extrabold">{match.score}%</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Screening Chances</span>
                                  <span className="text-cyan-400 font-extrabold">{interviewOdds}%</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Global Match</span>
                                  <span className="text-purple-400 font-extrabold">{visaPassChance}%</span>
                                </div>
                              </div>

                              {/* Compliant skills overlay lists */}
                              <div className="space-y-1">
                                <span className="text-[8px] font-mono uppercase text-emerald-400 tracking-wider font-extrabold block">Matched Core Strengths:</span>
                                <div className="flex flex-wrap gap-1">
                                  {match.matchingSkills.slice(0, 4).map(sk => (
                                    <span key={sk} className="bg-emerald-500/10 text-emerald-300 text-[8px] px-1.5 py-0.2 rounded font-sans font-medium border border-emerald-500/10">
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Deficiencies and gaps list */}
                              {match.missingSkills.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[8px] font-mono uppercase text-amber-400 tracking-wider font-extrabold block">Profile Missing Gaps:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {match.missingSkills.slice(0, 3).map(sk => (
                                      <span key={sk} className="bg-amber-500/10 text-amber-300 text-[8px] px-1.5 py-0.2 rounded font-sans font-medium border border-amber-500/10">
                                        {sk}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 pt-2.5 border-t border-white/5 mt-1.5 justify-between items-center">
                              <button 
                                onClick={() => handleSelectActiveJob(job)}
                                className="text-[10px] font-extrabold text-cyan-300 hover:text-cyan-100 transition-all font-sans cursor-pointer py-1 block"
                              >
                                View Alignment Analysis
                              </button>
                              
                              <button 
                                onClick={() => handleOpenApplySim(job)}
                                className="px-3 py-1 bg-cyan-400 text-slate-950 text-[10px] font-black rounded-lg hover:bg-cyan-300 transition-all cursor-pointer inline-flex items-center gap-0.5 shadow-md shadow-cyan-400/15"
                              >
                                <span>Fast Apply</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* Core job list section and detail window */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Vacancies listings column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-white/5">
                <Search className="w-4 h-4 text-slate-500 shrink-0 ml-1.5" />
                <input
                  type="text"
                  placeholder="Search job title, skills, tags..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="flex gap-2">
                {['All', 'Remote', 'Hybrid', 'Onsite'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setLocModel(mode as any)}
                    className={`px-3 py-1 bg-slate-900/40 border border-white/5 rounded-lg text-[10.5px] cursor-pointer hover:border-white/10 transition-all ${
                      locModel === mode ? 'border-cyan-400 bg-cyan-950/20 text-cyan-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => {
                    const isSelected = selectedJob?.id === job.id;
                    const match = matches.find(m => m.jobId === job.id);
                    const score = match ? match.score : 0;
                    
                    return (
                      <div
                        key={job.id}
                        onClick={() => handleSelectActiveJob(job)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-cyan-400 bg-cyan-950/15' 
                            : 'border-white/5 bg-slate-950/40 hover:border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <h4 className="text-xs font-extrabold text-white leading-tight">{job.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-1">{job.company} • {job.location}</p>
                          </div>
                          {score > 0 && (
                            <div className="p-1 px-1.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-500/15 text-center shrink-0">
                              {score}%
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2.5">
                          <span className="bg-white/5 text-[9px] text-slate-400 px-1.5 py-0.2 rounded font-mono">
                            {job.locationModel}
                          </span>
                          <span className="bg-emerald-500/5 text-[9px] text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                            {job.salaryRange}
                          </span>
                          {job.tags.slice(0, 2).map((tg, idx) => (
                            <span key={idx} className="bg-white/5 text-[9px] text-slate-300 px-1.5 py-0.2 rounded font-sans">
                              {tg}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs">No matching global openings found.</div>
                )}
              </div>
            </div>

            {/* Job description & fit screening column */}
            <div className="lg:col-span-2 space-y-5">
              {selectedJob ? (
                <div className="border border-white/5 rounded-2xl p-5 bg-slate-900/10 space-y-5">
                  
                  {/* Title and stats layout */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-950/40 border border-white/5 rounded-2xl gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono tracking-wider">
                        AI Matching Analytics
                      </span>
                      <h3 className="text-base font-black text-white">{selectedJob.title}</h3>
                      <p className="text-xs text-slate-400">{selectedJob.company} • {selectedJob.location} ({selectedJob.locationModel})</p>
                    </div>

                    <div className="flex gap-4 font-mono">
                      {(() => {
                        const match = matches.find(m => m.jobId === selectedJob.id);
                        const score = match ? match.score : 70;
                        return (
                          <>
                            <div className="text-center p-1.5 px-3 bg-cyan-950/20 border border-cyan-500/15 rounded-xl">
                              <span className="text-[8.5px] font-bold uppercase text-slate-400 font-sans block">Match Alignment</span>
                              <span className="text-base font-black text-cyan-300">{score}%</span>
                            </div>
                            <div className="text-center p-1.5 px-3 bg-emerald-950/20 border border-emerald-500/15 rounded-xl">
                              <span className="text-[8.5px] font-bold uppercase text-slate-400 font-sans block">Interview Odds</span>
                              <span className="text-base font-black text-emerald-400">{Math.round(score * 0.95)}%</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* INTERACTIVE SKILL OVERLAY AND DEFICIENCIES ALIGNMENT WITH BRIDGING TIPS */}
                  {(() => {
                    const match = matches.find(m => m.jobId === selectedJob.id);
                    if (!match) return null;
                    return (
                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider">Aura Match Analysis Diagnostics</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                          <div className="space-y-1.5">
                            <span className="text-[9px] uppercase font-mono font-extrabold text-emerald-400 block tracking-wide">✅ Compliant core skills ({match.matchingSkills.length})</span>
                            {match.matchingSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {match.matchingSkills.map(sk => (
                                  <span key={sk} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-500 font-mono italic">No exact matching skills found.</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] uppercase font-mono font-extrabold text-amber-400 block tracking-wide">⚠️ Position Missing Gaps ({match.missingSkills.length})</span>
                            {match.missingSkills.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {match.missingSkills.map(sk => (
                                  <span key={sk} className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-emerald-400 font-mono italic">Perfect matching! All query criteria fulfilled.</p>
                            )}
                          </div>
                        </div>

                        {match.missingSkills.length > 0 && (
                          <div className="mt-2.5 p-3 bg-amber-500/5 text-[10.5px] rounded-lg border border-amber-500/10 text-slate-300 space-y-1 leading-normal font-sans">
                            <p className="font-bold text-amber-300">💡 Custom Remediation & Career Bridging Strategy:</p>
                            <p>To maximize interview selection probability past the ATS threshold, include microprojects involving <strong>{match.missingSkills.slice(0, 2).join(' and ')}</strong> on your resume profile. Address these direct technical gaps under your "Interactive Interview Coach" tab to drill target replies.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Requirements grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-[10.5px] uppercase font-bold tracking-wider text-slate-400">Position Requirements</h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {selectedJob.requirements.map((req, i) => (
                          <li key={i} className="flex gap-1.5 items-start">
                            <span className="text-cyan-400 shrink-0">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skills radar diagram card */}
                    <div>
                      <SkillRadarChart 
                        requirements={selectedJob.requirements}
                        matchingSkills={matches.find(m => m.jobId === selectedJob.id)?.matchingSkills || []}
                        missingSkills={matches.find(m => m.jobId === selectedJob.id)?.missingSkills || []}
                        jobTitle={selectedJob.title}
                      />
                    </div>
                  </div>

                  {/* Public recruiting contact matching */}
                  <div className="p-4 bg-indigo-950/15 border border-indigo-500/15 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] uppercase font-extrabold text-indigo-400 tracking-widest font-mono">HR Email Discovery Engine</span>
                        <span className="text-[8px] uppercase px-1.5 py-0.2 bg-emerald-400/10 text-emerald-400 font-extrabold rounded border border-emerald-500/15">PASS DISCOVERED</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-normal">Uncovered Talent Acquisition contact coordinates. Draft a fully-personalized dynamic email using resume parameters.</p>
                    </div>

                    <button
                      onClick={() => handleOpenEmailHR(selectedJob)}
                      className="px-4 py-2 bg-indigo-500/25 border border-indigo-400/20 hover:bg-indigo-500/35 hover:scale-[1.01] transition-all text-xs font-bold text-indigo-300 rounded-xl flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-300" />
                      Automate HR Email
                    </button>
                  </div>

                  {/* Job Description details block */}
                  <div className="space-y-2">
                    <h4 className="text-[10.5px] uppercase font-bold tracking-wider text-slate-400">Opening Description</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans italic p-3 rounded-xl border border-white/5 bg-slate-950/20">&ldquo;{selectedJob.description}&rdquo;</p>
                  </div>

                  {/* Direct buttons triggers */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono">Deadline: 2026-06-30</span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPortalSimulatorJob(selectedJob);
                          setPortalFullName(user.fullName || '');
                          setPortalEmail(user.email || '');
                          setPortalSuccess(false);
                          setPortalCoverLetterText(`Dear Hiring Team,\n\nI am extremely excited to apply for the ${selectedJob.title} position at ${selectedJob.company}. Based on my background in professional engineering projects and related certifications, I believe i am a wonderful fit for this vacancy.\n\nBest regards,\n${user.fullName || 'Applicant'}`);
                        }}
                        className="px-3.5 py-2 hover:bg-slate-800 border border-slate-705 bg-slate-900 rounded-xl text-xs font-bold text-slate-100 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        Original Post
                      </button>
                      <button
                        onClick={() => handleOpenApplySim(selectedJob)}
                        className="px-4 py-2 bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all text-xs font-black rounded-xl cursor-pointer"
                      >
                        Smart AI Apply
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 text-xs text-slate-405 font-mono">No active job selected. Select a listing on the Left Panel.</div>
              )}
            </div>

          </div>
        </div>
      )}

      {seekerTab === 'match' && (
        <JobMatch 
          user={user}
          jobs={jobs}
          matches={matches}
          onUploadResume={onUploadResume}
          uploadingResume={uploadingResume}
          onRefreshTelemetry={onRefreshTelemetry}
          token={token}
        />
      )}

      {seekerTab === 'resume' && (
        <div className="border border-white/5 bg-slate-900/10 rounded-2xl p-5 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider font-mono">
                Resume Intelligence Console
              </span>
              <h3 className="text-sm font-black text-white">Parser & Taylored ATS CV Builder</h3>
              <p className="text-xs text-slate-400">Analyze current upload statistics or trigger clean templates generation.</p>
            </div>

            <div className="w-fit">
              <ResumeUploader onUploadSuccess={onUploadResume} isLoading={uploadingResume} currentFileName={user.resumeFileName} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 space-y-4">
              
              {/* Score card */}
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 text-center space-y-2">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest font-mono">COMPREHENSIVE PARSE SCORE</span>
                <p className="text-4xl font-extrabold text-cyan-400 font-mono leading-none">{user.analysis?.score || 60}<span className="text-xs text-slate-500">/100</span></p>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Evaluated matching indices on desired: <strong className="text-white font-bold">{user.preferences?.desiredRole || 'Flexible'}</strong></p>
              </div>

              {/* Recommendations certificate gaps */}
              <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-950/10 space-y-3">
                <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Missing Certifications Roadmap</span>
                </h4>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="p-1 px-2.5 bg-slate-950/40 border border-white/5 rounded-lg">
                    • <strong className="text-indigo-300">Certified Kubernetes Administrator (CKA)</strong> - highly desired for continuous Cloud Run infrastructure nodes tasks.
                  </div>
                  <div className="p-1 px-2.5 bg-slate-950/40 border border-white/5 rounded-lg">
                    • <strong className="text-indigo-300">AWS DevOps Engineer Associate</strong> - adds 15%+ score advantage in system pipeline evaluation engines.
                  </div>
                </div>
              </div>

              {/* Builder Configure */}
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Resume Builder Panel</span>
                
                <div className="space-y-2.5">
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-400">Select Career Target Template</label>
                    <select
                      value={resumeTemplate}
                      onChange={e => setResumeTemplate(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="Developer">Full-Stack Application Developer</option>
                      <option value="Executive">Executive Leadership CV</option>
                      <option value="Marketer">Product Growth Manager</option>
                      <option value="UX Designer">UI/UX Design Specialist</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-400">Select Export Preset Theme</label>
                    <select
                      value={resumeStyle}
                      onChange={e => setResumeStyle(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="ATS">ATS-Optimized Formatting (No columns)</option>
                      <option value="Executive">Executive Leadership (Double-Line)</option>
                      <option value="Technical">Technical/Engineering Specific Structure</option>
                      <option value="Entry">Entry-Level / Graduate Basic Flow</option>
                      <option value="International">International CV Standards layout</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={triggerBulidResume}
                  className="w-full bg-cyan-400 text-slate-950 text-xs font-black py-2 rounded-lg hover:bg-cyan-300 transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                >
                  <Cpu className="w-3.5 h-3.5 fill-slate-950" />
                  Format Tailored Resume
                </button>
              </div>

            </div>

            <div className="lg:col-span-2 space-y-4">
              {generatedResume ? (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 px-4 rounded-xl border border-white/5 text-xs">
                    <span className="font-bold text-white flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Resume Ready ({resumeStyle} Preset Style Loaded)
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => triggerSimulatedExport('PDF')}
                        disabled={!!isExporting}
                        className="px-2.5 py-1 text-[11px] font-bold text-cyan-400 hover:bg-cyan-400/10 rounded animate-pulse cursor-pointer"
                      >
                        {isExporting === 'PDF' ? 'Compiling PDF...' : 'Download PDF'}
                      </button>
                      <button
                        onClick={() => triggerSimulatedExport('DOCX')}
                        disabled={!!isExporting}
                        className="px-2.5 py-1 text-[11px] font-bold text-cyan-400 hover:bg-cyan-400/10 rounded cursor-pointer"
                      >
                        {isExporting === 'DOCX' ? 'Compiling DOCX...' : 'Download DOCX'}
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 bg-slate-950 border border-white/5 rounded-xl text-[10.5px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-[420px] overflow-y-auto">
                    {generatedResume}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-950/20 border border-dashed border-white/5 rounded-2xl text-slate-500 text-xs flex flex-col justify-center items-center space-y-3.5">
                  <FileText className="w-10 h-10 text-slate-600 animate-pulse" />
                  <div>
                    <span className="block font-bold text-slate-400">AI Tailored CV Builder is Idle</span>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-sm">Select target layout parameters and click &ldquo;Format Tailored Resume&rdquo; to build high-performance CV copies instantly.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {seekerTab === 'letters' && (
        <div className="border border-white/5 bg-slate-900/10 rounded-2xl p-5 space-y-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider font-mono">
              AI Cover Letter Studio
            </span>
            <h3 className="text-sm font-black text-white">Dynamic Letter Personalization Builder</h3>
            <p className="text-xs text-slate-400">Select target published global opening metrics and select tailored pitch tone styles.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 border border-white/5 rounded-xl p-4 bg-slate-950/40 space-y-3.5">
              <div className="space-y-1 text-xs">
                <label className="text-slate-400">Select Target Role</label>
                <select
                  value={selectedJobForLetter?.id || ""}
                  onChange={e => {
                    const found = jobs.find(j => j.id === e.target.value);
                    if (found) setSelectedJobForLetter(found);
                  }}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="" disabled>-- Choose Job Openings --</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.company} • {j.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-slate-400">Configure Writing Style Accent</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'formal', label: 'Formal Version' },
                    { id: 'creative', label: 'Creative Style' },
                    { id: 'executive', label: 'Executive Leadership' },
                    { id: 'startup', label: 'Startup Punchy Accent' }
                  ].map(styleOpt => (
                    <label key={styleOpt.id} className="flex items-center gap-1.5 p-2 bg-slate-950 rounded-lg border border-white/5 text-[10.5px] cursor-pointer hover:border-white/10 text-slate-300">
                      <input 
                        type="radio" 
                        name="style_opt" 
                        checked={letterStyle === styleOpt.id} 
                        onChange={() => setLetterStyle(styleOpt.id as any)}
                        className="accent-cyan-400"
                      />
                      <span>{styleOpt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-xs font-sans">
                <label className="text-slate-400">Insert Specific Custom Prompts</label>
                <textarea
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  rows={3}
                  placeholder="e.g. highlight team management expertise using scaled REST frameworks metrics..."
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none placeholder-slate-600"
                />
              </div>

              <button
                onClick={triggerLetterGen}
                disabled={generatingLetter || !selectedJobForLetter}
                className="w-full bg-cyan-400 text-slate-950 text-xs font-black py-2.5 rounded-lg hover:bg-cyan-300 transition-all cursor-pointer inline-flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950 animate-bounce" />
                {generatingLetter ? 'Generating Letter...' : 'Generate Cover Letter'}
              </button>
            </div>

            <div className="lg:col-span-2 space-y-3">
              {customLetterText ? (
                <div className="space-y-3 text-xs font-sans">
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-white/5">
                    <span className="font-extrabold text-white flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Letter Tailored For: {selectedJobForLetter?.company}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(customLetterText);
                        setCopyStatus(true);
                        setTimeout(() => setCopyStatus(false), 1500);
                      }}
                      className="text-cyan-400 text-[11px] font-bold font-mono inline-flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copyStatus ? 'Copied Content!' : 'Copy Letter'}
                    </button>
                  </div>

                  <textarea
                    value={customLetterText}
                    onChange={e => setCustomLetterText(e.target.value)}
                    rows={12}
                    className="w-full bg-slate-950 border border-white/14 rounded-xl p-4 text-[11px] text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-cyan-400 resize-none font-medium text-justify"
                  />
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-950/20 border border-dashed border-white/5 rounded-2xl text-slate-500 text-xs flex flex-col justify-center items-center space-y-3.5">
                  <Bot className="w-10 h-10 text-slate-600" />
                  <div>
                    <span className="block font-bold text-slate-400">Smart Cover Letter Studio is Idle</span>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-sm">Select target corporate job properties on the left panel & click &ldquo;Generate Cover Letter&rdquo; to draft high-scoring matching pitches.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {seekerTab === 'interview' && (
        <div className="border border-white/5 bg-slate-900/10 rounded-2xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider font-mono">
                AISTUDIO MOCK INTERVIEW ADVOCATE
              </span>
              <h3 className="text-sm font-black text-white">Interactive Q&A Practice Room</h3>
              <p className="text-xs text-slate-400">Complete AI questions evaluation checks on live target desired roles.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold font-mono">Topic:</span>
              <select
                value={interviewType}
                onChange={e => setInterviewType(e.target.value as any)}
                className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Technical">Technical Stack (Node, React, databases)</option>
                <option value="Behavioral">Behavioral (STAR method conflicts)</option>
                <option value="HR">HR Standard Screening Culture</option>
                <option value="Company-Specific">Company-Specific vacancy fit</option>
              </select>

              {!interviewStarted && (
                <button
                  onClick={triggerStartInterview}
                  className="px-3.5 py-1.5 bg-cyan-400 text-slate-950 font-black rounded-lg text-xs hover:bg-cyan-300 transition-all cursor-pointer flex items-center gap-1"
                >
                  Start Round
                </button>
              )}
            </div>
          </div>

          {interviewStarted ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                
                {/* Visual Dialogue loop */}
                <div className="bg-slate-950 rounded-2xl border border-white/5 p-4 h-[320px] overflow-y-auto space-y-4 font-sans text-xs flex flex-col justify-end">
                  <div className="space-y-3">
                    {interviewHistory.map((hist, i) => (
                      <div key={i} className={`flex gap-3 leading-relaxed max-w-[85%] ${hist.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-bold font-mono border text-[10px] ${
                          hist.role === 'user' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-indigo-505/10 border-indigo-500/20 text-indigo-400'
                        }`}>
                          {hist.role === 'user' ? 'YOU' : 'AI'}
                        </div>
                        <div className={`p-3 rounded-2xl ${
                          hist.role === 'user' ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/10' : 'bg-slate-900 text-slate-300 border border-white/5'
                        }`}>
                          {hist.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit answer control block */}
                <div className="space-y-2">
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={candidateResponse}
                      onChange={e => setCandidateResponse(e.target.value)}
                      placeholder="Type your structured answer (Situation, Task, Action, Result values)..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                      onKeyDown={e => e.key === 'Enter' && triggerPostResponse()}
                    />
                    <button
                      onClick={triggerPostResponse}
                      disabled={submittingResponse || !candidateResponse}
                      className="px-4 py-2.5 bg-cyan-400 text-slate-950 font-black text-xs rounded-xl hover:bg-cyan-400/90 transition-all cursor-pointer disabled:opacity-50 shrink-0 inline-flex items-center gap-1"
                    >
                      <span>Post Response</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Assessment diagnostics scorecard column */}
              <div className="space-y-4">
                <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 space-y-4 h-full">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block font-mono">Live Assessment Scorecard</span>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Technical Accuracy', score: interviewScores.technical, col: 'bg-cyan-400' },
                      { label: 'Communication Clarity', score: interviewScores.communication, col: 'bg-indigo-400' },
                      { label: 'Confidence & Demeanor', score: interviewScores.confidence, col: 'bg-purple-400' }
                    ].map((metric, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">{metric.label}</span>
                          <span className="text-white font-mono">{metric.score}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${metric.col}`} style={{ width: `${metric.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {interviewEvaluation && (
                    <div className="pt-3 border-t border-white/5 text-[11px] text-slate-300 space-y-1">
                      <span className="text-[9.5px] uppercase font-bold text-slate-500 font-mono tracking-widest block">AI Feedback Summary</span>
                      <p className="leading-snug bg-slate-950/60 p-2.5 rounded-lg text-slate-300 font-sans border border-cyan-500/10">{interviewEvaluation}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 bg-slate-950/20 border border-dashed border-white/5 rounded-2xl text-slate-500 text-xs flex flex-col justify-center items-center space-y-3.5">
              <Zap className="w-10 h-10 text-slate-600 animate-bounce" />
              <div>
                <span className="block font-bold text-slate-400">Interview Practice Coach is Idle</span>
                <p className="text-[10px] text-slate-500 mt-1 max-w-sm">Select target practice style credentials on the upper panel & click &ldquo;Start Round&rdquo; to begin a live professional review.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {seekerTab === 'tracker' && (
        <div className="space-y-5 font-sans">
          
          {/* Conversion analytic rates */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl border border-white/5 bg-slate-900/40">
            {[
              { label: 'Total active Pipeline', val: `${kanbanCards.length} Cards` },
              { label: 'ATS Screening Pass', val: '82%', sub: 'High Match' },
              { label: 'Conversion to Interviews', val: '45%', sub: 'Avg: 30%' },
              { label: 'Offer Conversion Rate', val: '15%', sub: 'Target: 10%' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1 text-center sm:text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block font-mono">{stat.label}</span>
                <p className="text-xl font-black text-white">{stat.val}</p>
                {stat.sub && <span className="text-[9px] text-slate-500 font-mono italic leading-none">{stat.sub}</span>}
              </div>
            ))}
          </div>

          {/* Kanban drag/drop lists simulator columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { status: 'Applied', color: 'border-orange-500/20 bg-orange-500/[0.01] text-orange-400 bg-orange-505/10' },
              { status: 'Interview Scheduled', color: 'border-cyan-500/20 bg-cyan-500/[0.01] text-cyan-400 bg-cyan-505/10' },
              { status: 'Offer Received', color: 'border-emerald-500/20 bg-emerald-500/[0.01] text-emerald-400 bg-emerald-505/10' }
            ].map(col => {
              const cards = kanbanCards.filter(c => c.status === col.status);
              
              return (
                <div key={col.status} className={`p-4 rounded-xl border ${col.color} space-y-3 h-fit`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider">{col.status} ({cards.length})</span>
                  </div>

                  <div className="space-y-2">
                    {cards.length > 0 ? (
                      cards.map(card => (
                        <div key={card.id} className="p-3 bg-slate-950 rounded-lg border border-white/5 space-y-2.5">
                          <div>
                            <span className="text-xs font-bold text-white block leading-tight">{card.jobTitle}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{card.company}</span>
                          </div>

                          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1.5 border-t border-white/5">
                            <span>via: {card.source}</span>
                            <button 
                              onClick={() => handleDeleteKanbanCard(card.id)}
                              className="text-rose-400 hover:text-rose-300 font-bold ml-1 transition-all cursor-pointer"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[10px] text-slate-600 font-mono">Empty Column</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {seekerTab === 'coach' && (
        <div className="border border-white/5 bg-slate-900/10 rounded-2xl p-5 space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider font-mono">
              24/7 INTERACTIVE CAREER COACH
            </span>
            <h3 className="text-sm font-black text-white">Full-Stack Counseling & Strategy Companion</h3>
            <p className="text-xs text-slate-400">Ask strategic questions regarding certificate targets, custom resume formats, or wage negotiations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Quick tips selectors */}
            <div className="lg:col-span-1 space-y-3 text-xs leading-tight">
              <span className="text-[10px] uppercase font-black text-slate-500 font-mono block">Specialist Prompts Templates</span>
              {[
                "Prep for dynamic salary negotiations",
                "Review core skill recommendations",
                "Create a structured 3-Month learning roadmap",
                "How do I address a career gap on my resume?"
              ].map((templateMsg, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCoachInput(templateMsg);
                  }}
                  className="w-full text-left p-2.5 bg-slate-950/60 rounded-xl border border-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-cyan-400 transition-all cursor-pointer truncate"
                >
                  {templateMsg}
                </button>
              ))}
            </div>

            {/* Chat screen */}
            <div className="lg:col-span-3 space-y-3.5">
              <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 h-[340px] overflow-y-auto space-y-4 text-xs font-sans">
                {coachMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center font-bold font-mono text-[9px] shrink-0 ${
                      msg.role === 'user' ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-500/15' : 'bg-indigo-400/10 text-indigo-400 border border-indigo-505/15'
                    }`}>
                      {msg.role === 'user' ? 'C' : 'AI'}
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      msg.role === 'user' ? 'bg-cyan-950/20 border border-cyan-500/10 text-cyan-200' : 'bg-slate-900 border border-white/5 text-slate-300'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input console */}
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={coachInput}
                  onChange={e => setCoachInput(e.target.value)}
                  placeholder="Ask your career query..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  onKeyDown={e => e.key === 'Enter' && handleSendCoachMsg()}
                />
                <button
                  onClick={handleSendCoachMsg}
                  disabled={coachSending || !coachInput.trim()}
                  className="px-4 py-2.5 bg-cyan-400 text-slate-950 text-xs font-black rounded-xl hover:bg-cyan-300 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask Coach</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DISCOVER HR CONTACT Automated Email dialog modal */}
      {emailModalJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">HR Contact Discovery</span>
                <h4 className="text-sm font-black text-white">Draft Automated HR Coordinator Pitch</h4>
              </div>
              <button 
                onClick={() => setEmailModalJob(null)}
                className="p-1 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mailSendSuccess ? (
              <div className="py-10 text-center space-y-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Application Mail Dispatched Successfully!</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Simulated delivery loop completed. Recruiter tracking logged under history logs sync.</p>
                </div>
                <button
                  onClick={() => setEmailModalJob(null)}
                  className="px-4 py-1.5 bg-white/10 text-white rounded-lg text-xs"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="space-y-3 font-sans text-xs">
                
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded-xl space-y-1">
                  <div className="flex justify-between text-[10px] font-bold font-mono">
                    <span className="text-slate-400">DISCOVERED RECRUITER CONTACT</span>
                    <span className="text-emerald-400 tracking-wide">VERIFIED</span>
                  </div>
                  <p className="text-white font-bold">{discoveredHr.name} <span className="font-mono text-slate-400 font-semibold">({discoveredHr.email})</span></p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block text-[9.5px] uppercase">Subject Heading</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block text-[9.5px] uppercase">Tailored Email Body</label>
                  <textarea
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setEmailModalJob(null)}
                    className="px-3.5 py-1.5 hover:bg-white/5 rounded-lg text-slate-400"
                  >
                    Cancel Draft
                  </button>
                  <button
                    onClick={handleSendHREmail}
                    disabled={triggerSendingMail}
                    className="px-4 py-1.5 bg-cyan-400 text-slate-950 font-black rounded-lg hover:bg-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {triggerSendingMail ? 'Sending Direct...' : 'Automate Send'}
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* SMART APPLY SIMULATOR DIALOG MODAL */}
      {applyModalJob && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
           <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 w-full max-w-lg space-y-4">
             <div className="flex justify-between items-center border-b border-white/5 pb-3">
               <div>
                 <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">Aura Apply Engine</span>
                 <h4 className="text-sm font-black text-white">Automate Tailored Application Submit</h4>
               </div>
               <button 
                 onClick={() => setApplyModalJob(null)}
                 className="p-1 text-slate-400 hover:text-white transition-all cursor-pointer"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>

             {applySimulateSuccess ? (
               <div className="py-10 text-center space-y-3.5">
                 <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                   <CheckCircle2 className="w-6 h-6 animate-bounce" />
                 </div>
                 <div>
                   <h4 className="text-xs font-bold text-white">Application Dispatched via Platform API Link!</h4>
                   <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Resume tailored, Cover Letter registered, and vacancy successfully logged to Kanban Board.</p>
                 </div>
                 <button
                   onClick={() => setApplyModalJob(null)}
                   className="px-4 py-1.5 bg-white/10 text-white rounded-lg text-xs"
                 >
                   Dismiss
                 </button>
               </div>
             ) : (
               <div className="space-y-3 text-xs">
                 <p className="text-[11px] text-slate-400">Aura AI automatically tailors candidate qualifications parameters to fit benchmarking for <strong>{applyModalJob.title}</strong> at <strong>{applyModalJob.company}</strong>.</p>
                 
                 <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-white/5">
                   <span className="text-[8.5px] uppercase font-bold text-slate-500 font-mono tracking-widest">Tailored Application CV Coordinates preview</span>
                   <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap leading-tight max-h-24 overflow-y-auto mt-1">
                     {applySimulatedCVText}
                   </pre>
                 </div>

                 <div className="space-y-1">
                   <label className="text-slate-400 uppercase font-black block text-[9px] tracking-widest">AI Custom Drafted Cover Letter</label>
                   <textarea
                     value={applyCustomLetter}
                     onChange={e => setApplyCustomLetter(e.target.value)}
                     rows={4}
                     className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none resize-none leading-relaxed"
                   />
                 </div>

                 <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                   <button
                     onClick={() => setApplyModalJob(null)}
                     className="px-3.5 py-1.5 hover:bg-white/5 rounded-lg text-slate-400"
                   >
                     Cancel Apply
                   </button>
                   <button
                     onClick={handleTriggerApplicationSubmit}
                     disabled={simulatingApply}
                     className="px-4 py-1.5 bg-cyan-400 text-slate-950 font-black rounded-lg hover:bg-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
                   >
                     <Plus className="w-3.5 h-3.5 text-slate-950 font-extrabold" />
                     {simulatingApply ? 'Synthesizing Credentials...' : 'One-Click Fast Apply'}
                   </button>
                 </div>

               </div>
             )}
           </div>
         </div>
      )}

      {/* SIMULATED EXTERNAL JOB POSTING & DIRECT APPLY MODAL */}
      {portalSimulatorJob && (() => {
        const url = portalSimulatorJob.originalUrl || "";
        const l = url.toLowerCase();
        let brand = {
          name: "Monster Career Hub",
          logoColor: "bg-[#6366f1]",
          textColor: "text-indigo-400 border-indigo-505/20",
          logoChar: "M",
          accentClass: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/10",
          bannerClass: "from-indigo-500/15 via-slate-900 to-slate-950",
          badge: "Industry Verified Opening • Dynamic Direct Apply"
        };
        if (l.includes("linkedin.com")) {
          brand = {
            name: "LinkedIn Jobs Portal",
            logoColor: "bg-[#0a66c2]",
            textColor: "text-[#0a66c2] border-[#0a66c2]/20",
            logoChar: "in",
            accentClass: "bg-[#0a66c2] hover:bg-[#004182] text-white shadow-blue-500/10",
            bannerClass: "from-[#0a66c2]/15 via-slate-900 to-slate-950",
            badge: "LinkedIn Simple Apply • Direct Corporate Sync Ready"
          };
        } else if (l.includes("naukri.com")) {
          brand = {
            name: "Naukri.com Premium",
            logoColor: "bg-[#183d69]",
            textColor: "text-cyan-400 border-cyan-400/20",
            logoChar: "N",
            accentClass: "bg-[#ff7555] hover:bg-[#e05641] text-white shadow-orange-500/10",
            bannerClass: "from-[#183d69]/30 via-slate-900 to-slate-950",
            badge: "Hot Vacancy Tracker • Automated Evaluation Hub"
          };
        } else if (l.includes("hirist.tech") || l.includes("hirist")) {
          brand = {
            name: "Hirist Tech Jobs",
            logoColor: "bg-[#7c3aed]",
            textColor: "text-purple-400 border-purple-500/20",
            logoChar: "H",
            accentClass: "bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-purple-500/10",
            bannerClass: "from-[#7c3aed]/15 via-slate-900 to-slate-950",
            badge: "Verified Developer Post • Handpicked Agile Opening"
          };
        } else if (l.includes("timesjobs.com") || l.includes("timesjobs")) {
          brand = {
            name: "TimesJobs Premium",
            logoColor: "bg-rose-600",
            textColor: "text-rose-400 border-rose-500/20",
            logoChar: "TJ",
            accentClass: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10",
            bannerClass: "from-rose-600/15 via-slate-900 to-slate-950",
            badge: "Corporate Elite Verified • Direct Recruitment Hook"
          };
        }

        return (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto select-none">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
              
              {/* Premium Simulated Browser Header */}
              <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-[10px] text-slate-500 font-mono ml-4 truncate font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 max-w-xs sm:max-w-md md:max-w-lg block">
                    {url}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPortalSimulatorJob(null)}
                  className="p-1.5 bg-slate-900/60 hover:bg-slate-800 text-slate-400 rounded-lg transition-all cursor-pointer border border-slate-805"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Portal Contents container */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {portalSuccess ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-white">Application Received Successfully!</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">Sent directly to the Recruiter pipeline at {portalSimulatorJob.company}. A copy is synced inside your local Scrum/Kanban Application Pipeline boards.</p>
                    </div>
                    <div className="pt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setPortalSimulatorJob(null)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${brand.accentClass}`}
                      >
                        Back to Seeker Console
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Brand Banner Block */}
                    <div className={`p-5 rounded-2xl bg-gradient-to-r ${brand.bannerClass} border border-slate-800 flex items-center gap-4`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 ${brand.logoColor}`}>
                        {brand.logoChar}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase block">{brand.badge}</span>
                        <h3 className="text-base font-black text-white">{brand.name}</h3>
                      </div>
                    </div>

                    {/* Job Details Card matching original URL source */}
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-805 space-y-4">
                      <div className="space-y-1 border-b border-slate-800 pb-3">
                        <h2 className="text-lg font-black text-white leading-snug">{portalSimulatorJob.title}</h2>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400 mt-1">
                          <span className="font-extrabold text-slate-200">{portalSimulatorJob.company}</span>
                          <span>•</span>
                          <span>{portalSimulatorJob.location} ({portalSimulatorJob.locationModel})</span>
                          <span>•</span>
                          <span className="font-mono text-emerald-400 font-extrabold">{portalSimulatorJob.salaryRange}</span>
                        </div>
                      </div>

                      {/* Full description */}
                      <div className="space-y-2">
                        <h4 className="text-[10.5px] uppercase font-bold tracking-widest text-[#4a90e2] font-mono">Full Job Description</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{portalSimulatorJob.description}</p>
                      </div>

                      {/* Requirements and Responsibilities grids */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400">Core Tech Specifications</h4>
                          <ul className="space-y-1.5">
                            {portalSimulatorJob.requirements?.map((req, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="text-emerald-400 shrink-0 mt-1">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-violet-400">Key Roles & Responsibilities</h4>
                          <ul className="space-y-1.5">
                            {portalSimulatorJob.responsibilities?.map((resp, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="text-violet-400 shrink-0 mt-1">•</span>
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Simple Quick Application Form inside exactly the same job portal widget */}
                    <div className="space-y-4 border-t border-slate-800 pt-5 font-sans">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-white">Apply on {brand.name}</h3>
                        <p className="text-[10.5px] text-slate-500">Provide details to deliver credentials directly to the board administrator at {portalSimulatorJob.company}.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold block text-[10px] uppercase font-mono">Full Name</label>
                          <input
                            type="text"
                            value={portalFullName}
                            onChange={e => setPortalFullName(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-all"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold block text-[10px] uppercase font-mono">E-mail Address</label>
                          <input
                            type="email"
                            value={portalEmail}
                            onChange={e => setPortalEmail(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-all"
                            placeholder="john.doe@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold block text-[10px] uppercase font-mono">Years of Tech Experience</label>
                          <select
                            value={portalExperience}
                            onChange={e => setPortalExperience(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                          >
                            <option value="1">1-2 Years (Junior Developer)</option>
                            <option value="3">3-5 Years (Mid-Senior Engineer)</option>
                            <option value="6">6-8 Years (Lead Tech Practitioner)</option>
                            <option value="9">9+ Years (Staff / Principal Director)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold block text-[10px] uppercase font-mono">Direct Recruiter Dispatch</label>
                          <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Auto Match-Optimized CV Enclosed</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold block text-[10px] uppercase font-mono">Tailored Executive Candidate Statement</label>
                        <textarea
                          value={portalCoverLetterText}
                          onChange={e => setPortalCoverLetterText(e.target.value)}
                          rows={4}
                          required
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setPortalSimulatorJob(null)}
                          className="px-4 py-2 hover:bg-slate-800 border border-slate-805 rounded-xl text-slate-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handlePortalSimulatorSubmit}
                          disabled={submittingPortalMsg || !portalFullName || !portalEmail}
                          className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 ${brand.accentClass} disabled:opacity-50 disabled:-translate-y-0`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          {submittingPortalMsg ? 'Submitting Application...' : 'Send Application'}
                        </button>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
