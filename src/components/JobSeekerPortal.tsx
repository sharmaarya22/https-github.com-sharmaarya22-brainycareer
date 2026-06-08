import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, MapPin, Building, Calendar, DollarSign, 
  Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight, 
  Clipboard, Check, Edit3, TrendingUp, Cpu, Info, SlidersHorizontal, Settings,
  Globe, RefreshCw, ExternalLink, Mail, X, Send, Bot, CheckSquare, Plus, Trash2, Award, Zap,
  Users, Eye
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
  ba: {
    fileName: "sarah_jenkins_business_analyst.txt",
    fullName: "Sarah Jenkins",
    text: `SARAH JENKINS - SENIOR BUSINESS ANALYST & PRODUCT OWNER
Email: sarah.jenkins@deliveryhub.co -- Location: Toronto, ON / Hybrid
SUMMARY:
Over 5 years of certified expertise as a professional Business Analyst across banking, CRM integration, and software delivery workflows. Proficient in rigorous requirements gathering, data modeling, mapping functional processes, and authoring concise User Stories and Use Cases. Highly skilled at managing backlog grooming, Facilitating Sprint Planning sessions, and Scrum master duties to bridge systems engineering with corporate commercial priorities.

CORE EXPERTISE:
* Business Analysis, Requirements Gathering, Process Flow Diagrams, Gap Analysis
* Agile, Scrum Framework, Backlog Grooming, Sprint Tracking (Jira / Confluence)
* Wireframing, UX Prototyping (Figma / Balsamiq), User Stories, Use Case Modeling
* SQL Queries, Data Mapping, Functional Testing, Stakeholder Walkthroughs`
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
  onShowToast?: (title: string, message: string) => void;
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
  uploadingResume,
  onShowToast
}: JobSeekerPortalProps) {
  
  const [seekerTab, setSeekerTab] = useState<'jobs' | 'match' | 'resume' | 'letters' | 'interview' | 'tracker' | 'coach' | 'visitors'>('match');
  const [simulatingStep, setSimulatingStep] = useState<string | null>(null);

  const handleLoadDemoProfile = async (type: 'developer' | 'ba') => {
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

  // Profile View Log state & poll trigger
  const [profileViews, setProfileViews] = useState<any[]>([]);
  const [loadingViews, setLoadingViews] = useState(false);

  const fetchProfileViews = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.notifications || [];
        // Filter those of type "profile_view" representing recruiter click activity
        const views = list.filter((n: any) => n.type === 'profile_view');
        setProfileViews(views);
      }
    } catch (e) {
      console.warn("Could not load profile views log history:", e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfileViews();
      const interval = setInterval(fetchProfileViews, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

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
      if (onShowToast) {
        onShowToast(
          "Document Render Completed!",
          `Successfully compiled and exported your tailored standard ${resumeStyle} CV format as a professional ${type} file.`
        );
      } else {
        alert(`Simulation completed: Successfully compiled & exported your tailored ${resumeStyle} CV format as professional ${type}. Document is mapped under active profile link.`);
      }
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
      <div className="flex border-b border-slate-205 pb-2 overflow-x-auto gap-4 scrollbar-none">
        {[
          { id: 'match', label: 'AI Matchmaking & Jobs' },
          { id: 'resume', label: 'Resume Intelligence & Builder' },
          { id: 'letters', label: 'AI Cover Letter Studio' },
          { id: 'interview', label: 'Interactive Interview Coach' },
          { id: 'tracker', label: 'Application Pipeline & Kanban' },
          { id: 'coach', label: '24/7 AI Career Coach' },
          { id: 'visitors', label: 'Who Viewed My Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSeekerTab(tab.id as any)}
            className={`text-sm font-bold py-2 whitespace-nowrap cursor-pointer transition-all border-b-2 inline-flex items-center gap-1.5 ${
              seekerTab === tab.id 
                ? 'border-indigo-600 text-indigo-700 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.id === 'visitors' && profileViews.length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-black bg-indigo-100 text-indigo-700 rounded-full animate-pulse">
                {profileViews.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {seekerTab === 'jobs' && (
        <div className="space-y-6">
          
          {/* SIMULATION STATE LOGGER */}
          {simulatingStep && (
            <div className="p-4 bg-indigo-55 border border-indigo-150 rounded-2xl flex items-center justify-between text-xs text-indigo-800 font-mono">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>{simulatingStep}</span>
              </div>
              <div className="h-1.5 w-24 bg-slate-205 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 animate-[pulse_1.5s_infinite] w-3/4"></div>
              </div>
            </div>
          )}

          {/* SYSTEM DISPATCHER: PROFILE UNANALYZED HERO vs ANALYZED COUNTERPARTS */}
          {!user.resumeText ? (
            <div className="bg-white border border-slate-200 p-8 rounded-3xl relative overflow-hidden space-y-6 font-sans shadow-sm">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-100/40 rounded-full blur-2xl"></div>
              
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 font-mono">Autonomous Global Job Matchmaker</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Your Automated Worldwide Career Matchmaker is Ready</h3>
                  <p className="text-sm text-slate-650 max-w-xl leading-relaxed font-semibold">
                    NexGen AI automatically indexes corporate vacancy portals worldwide to evaluate skill overlaps, compute ATS alignments, and gauge interview success likelihoods. Choose one of our elite presets or upload your own CV file to start.
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-3.5 shrink-0 font-sans">
                  <button
                    onClick={() => handleLoadDemoProfile('developer')}
                    disabled={uploadingResume}
                    className="p-4 text-left w-full lg:w-[240px] bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-2xl transition-all font-sans cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-indigo-900 block group-hover:text-indigo-75 transition-colors">Alex Mercer Preset</span>
                      <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:text-indigo-700 transition-colors" />
                    </div>
                    <span className="text-xs text-indigo-650 block mt-1.5 font-mono font-medium">Software Lead (React, Node, Cloud, TS)</span>
                  </button>

                  <button
                    onClick={() => handleLoadDemoProfile('ba')}
                    disabled={uploadingResume}
                    className="p-4 text-left w-full lg:w-[240px] bg-emerald-50/30 hover:bg-emerald-50 border border-emerald-100 rounded-2xl transition-all font-sans cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-emerald-950 block group-hover:text-emerald-75 transition-colors">Sarah Jenkins Preset</span>
                      <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:text-emerald-700 transition-colors" />
                    </div>
                    <span className="text-xs text-emerald-650 block mt-1.5 font-mono font-medium">Business Analyst (SQL, BA, Jira, Scrum)</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <span className="text-xs uppercase font-bold text-slate-500 block mb-3 tracking-wider font-mono">Or Upload Your Professional Credentials Manual File:</span>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <ResumeUploader onUploadSuccess={onUploadResume} isLoading={uploadingResume} currentFileName={user.resumeFileName} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* STUNNING GLOBAL PROFILE & ANALYTICS BENTO HUB */}
              <div className="bg-white border border-slate-205 p-6 md:p-8 rounded-3xl space-y-5 font-sans shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs uppercase tracking-widest font-black text-indigo-600 font-mono">AUTONOMOUS GLOBAL PORTAL INDEXING STATUS</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 mt-1">Automated Global Profile Matchmaker Diagnostics</h3>
                  </div>
                  <button 
                    onClick={() => onUploadResume({ text: "" }, "")}
                    className="text-xs text-rose-600 font-bold hover:text-rose-800 transition-all underline cursor-pointer"
                  >
                    Clear Credentials Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                  {/* General scoring block */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <span className="text-xs font-mono uppercase font-black text-slate-500 tracking-wider block">Candidate Match Compatibility Index</span>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl font-extrabold text-indigo-700 font-mono tracking-tight">{user.analysis?.score || 85}%</div>
                      <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-1.5 px-2.5 text-xs text-indigo-805 font-bold font-mono">
                        {(user.analysis?.score || 85) >= 90 ? 'A+ ELITE COMPLIANT' : 'B+ HIGH FIT'}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs text-slate-550 block uppercase font-mono font-bold">Top Career Archetypes suitability:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(user.analysis?.recommendedRoles || ["Fullstack Engineer", "Frontend Architect"]).map((role) => (
                          <span key={role} className="bg-white text-slate-700 p-1 px-2.5 rounded-lg text-xs font-bold shrink-0 border border-slate-200">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans italic mt-2 bg-white p-3 rounded-xl border border-slate-200">
                      &ldquo;{user.analysis?.executiveSummary || 'Profile successfully parsed for target global corporate channels.'}&rdquo;
                    </p>
                  </div>

                  {/* Dynamic extracted skills Overlay with green strengths and amber gaps */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <span className="text-xs font-mono uppercase font-black text-slate-505 tracking-wider block">Extracted Skill Attributes & Deficiencies</span>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs uppercase font-extrabold text-emerald-700 block tracking-wide">✅ Profile Strengths identified ({user.analysis?.keyStrengths?.length || 0}):</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(user.analysis?.keyStrengths || ["React", "TypeScript", "Tailwind"]).map((strength) => (
                            <span key={strength} className="bg-emerald-50 text-emerald-805 text-xs p-1 px-2.5 rounded-lg font-bold inline-flex items-center gap-1 border border-emerald-100">
                              <Check className="w-3.5 h-3.5" />
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-extrabold text-amber-705 block tracking-wide">⚠️ Identified Tech Skill Gaps ({user.analysis?.skillGaps?.length || 0}):</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(user.analysis?.skillGaps || ["Kubernetes", "GraphQL"]).map((gap) => (
                            <span key={gap} className="bg-amber-50 text-amber-805 text-xs p-1 px-2.5 rounded-lg font-bold inline-flex items-center gap-1 border border-amber-100">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Step Timelines and Career Path Actions */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <span className="text-xs font-mono uppercase font-black text-slate-505 tracking-wider block">Strategic 3-Year Career Progression Path</span>
                    <div className="space-y-3.5">
                      <div className="space-y-1 text-slate-705 bg-white p-3 rounded-xl border border-slate-200 text-xs font-semibold">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">Current Stage diagnostic:</span>
                        <p className="font-extrabold text-slate-905">{user.analysis?.careerPath?.currentState || 'Diagnostic step determined.'}</p>
                        <p className="text-xs text-indigo-600 font-bold mt-1.5">Transitions target: {(user.analysis?.careerPath?.transitionRoles || []).join(', ')}</p>
                      </div>
                      
                      <div className="space-y-1 bg-white p-3 rounded-xl text-xs border border-slate-200 font-medium">
                        <span className="text-[10px] font-mono uppercase text-slate-505 block tracking-wider font-bold">3-Year Action Plan Timelines:</span>
                        <div className="space-y-1 mt-1.5 font-mono text-slate-700">
                          {(user.analysis?.careerPath?.strategicPlan || []).slice(0, 3).map((plan, pIdx) => (
                            <div key={pIdx} className="flex gap-2 leading-relaxed">
                              <span className="text-indigo-600 font-bold shrink-0">Y{pIdx+1}:</span>
                              <span className="text-slate-700 truncate font-semibold">{plan}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-150 p-4.5 rounded-2xl text-xs text-indigo-900 flex items-center gap-2.5 font-semibold">
                  <Bot className="w-5 h-5 text-indigo-600 shrink-0 animate-pulse" />
                  <p className="leading-relaxed">
                    <strong>Actionable suggested CV additions checklist:</strong> {(user.analysis?.suggestedImprovements || ["Quantifying microfrontend metrics", "Detailing docker cluster deployments"]).join(" | ")}
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

          {/* Core job list section with INLINE card expansion */}
          <div className="space-y-5">
            
            {/* Search and location model filter controls */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 px-4 rounded-xl border border-slate-200 flex-1">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search job titles, skills, technologies, tags..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                />
              </div>

              <div className="flex gap-2 shrink-0">
                {['All', 'Remote', 'Hybrid', 'Onsite'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setLocModel(mode as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                      locModel === mode 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertically stacked Job cards directory */}
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => {
                  const isSelected = selectedJob?.id === job.id;
                  const match = matches.find(m => m.jobId === job.id);
                  const score = match ? match.score : 0;
                  
                  return (
                    <div
                      key={job.id}
                      className={`rounded-2xl border bg-white transition-all duration-300 overflow-hidden ${
                        isSelected 
                          ? 'border-indigo-505 ring-4 ring-indigo-100 shadow-md' 
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Job Header (Trigger) */}
                      <div
                        onClick={() => {
                          if (isSelected) {
                            setSelectedJob(null);
                          } else {
                            handleSelectActiveJob(job);
                          }
                        }}
                        className="p-5 md:p-6 cursor-pointer select-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
                              {job.title}
                            </h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md font-mono ${
                              job.locationModel === 'Remote' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-blue-50 text-blue-700 border border-blue-150'
                            }`}>
                              {job.locationModel}
                            </span>
                          </div>
                          
                          <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-700">{job.company}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-bold">{job.salaryRange}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {score > 0 && (
                            <div className="p-2 px-3 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-mono font-extrabold border border-indigo-100 text-center">
                              {score}% MATCH
                            </div>
                          )}
                          <div className="text-slate-400">
                            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isSelected ? 'rotate-90 text-indigo-600' : ''}`} />
                          </div>
                        </div>
                      </div>

                      {/* Job Tags preview block */}
                      {!isSelected && (
                        <div className="px-5 md:px-6 pb-5 flex flex-wrap gap-1.5 border-t border-slate-50 pt-3">
                          {job.tags.map((tg, idx) => (
                            <span key={idx} className="bg-slate-100 text-[11px] font-bold text-slate-600 px-2.5 py-0.5 rounded-lg">
                              {tg}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* EXPANDED INLINE JOB DETAIL PANEL (Right Below the Card) */}
                      {isSelected && (
                        <div className="border-t border-slate-200 bg-slate-50/70 p-6 md:p-8 space-y-6">
                          
                          {/* Brief Alignment Diagnostics */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                              <span className="text-xs uppercase font-extrabold text-slate-400 font-mono block">Applicant ATS Compatibility</span>
                              <div className="text-2xl font-black text-indigo-700 font-mono">
                                {score}% match overlap
                              </div>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                              <span className="text-xs uppercase font-extrabold text-slate-400 font-mono block">Estimated Interview Probability</span>
                              <div className="text-2xl font-black text-emerald-600 font-mono">
                                {Math.round(score * 0.95)}% likely
                              </div>
                            </div>
                          </div>

                          {/* Action Hub Panel (Autogenerated content & quick links) */}
                          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider font-mono">
                                    HR Contact & Pitch Generation Engine
                                  </span>
                                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 p-0.5 px-2 rounded-full">
                                    DIRECT EMAIL DETECTED
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                  Our intelligent engine matched this opening to Talent Acquisition contacts. Generate a tailored pitch email dynamically mapping your profile.
                                </p>
                              </div>

                              <button
                                onClick={() => handleOpenEmailHR(job)}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm font-bold rounded-xl flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
                              >
                                <Mail className="w-4 h-4 text-white" />
                                Mail HR Autogenerated Pitch
                              </button>
                            </div>
                          </div>

                          {/* Core matching diagnostic (matching vs deficiencies) */}
                          {match && (
                            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
                              <div className="flex items-center gap-1.5">
                                <Cpu className="w-5 h-5 text-indigo-600 animate-pulse" />
                                <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Aura Profile Alignment Analysis</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                                <div className="space-y-2">
                                  <span className="text-xs uppercase font-bold text-emerald-700 block">✅ Compliant core skills ({match.matchingSkills.length})</span>
                                  {match.matchingSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {match.matchingSkills.map(sk => (
                                        <span key={sk} className="bg-emerald-50 border border-emerald-100 text-emerald-805 text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                                          {sk}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400 font-mono italic">No exact matching skills found.</p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <span className="text-xs uppercase font-bold text-amber-700 block">⚠️ Position Missing Gaps ({match.missingSkills.length})</span>
                                  {match.missingSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {match.missingSkills.map(sk => (
                                        <span key={sk} className="bg-amber-50 border border-amber-100 text-amber-805 text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                                          {sk}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-emerald-600 font-bold italic">Perfect alignment! All requirements fulfilled.</p>
                                  )}
                                </div>
                              </div>

                              {match.missingSkills.length > 0 && (
                                <div className="p-4 bg-amber-50/40 text-xs rounded-xl border border-amber-100 text-amber-900 space-y-1.5 leading-relaxed font-sans font-medium">
                                  <p className="font-extrabold text-amber-805">💡 Tailored Profile Bridging & Application Strategy:</p>
                                  <p>To bypass automated filters, focus your covers on <strong>{match.missingSkills.slice(0, 2).join(' and ')}</strong>. You can practice responding to these gaps under our Interview tab to train your pitch replies.</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Requirements & Skill Radar Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3 p-5 bg-white rounded-2xl border border-slate-205">
                              <h4 className="text-xs uppercase font-black tracking-wider text-slate-500 font-mono">Position Requirements & Key Duties</h4>
                              <ul className="space-y-2 text-sm text-slate-600 font-medium">
                                {job.requirements.map((req, i) => (
                                  <li key={i} className="flex gap-2 items-start">
                                    <span className="text-indigo-600 shrink-0 text-base font-extrabold leading-none">•</span>
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-5 bg-white rounded-2xl border border-slate-205 flex flex-col items-center justify-center">
                              <SkillRadarChart 
                                requirements={job.requirements}
                                matchingSkills={matches.find(m => m.jobId === job.id)?.matchingSkills || []}
                                missingSkills={matches.find(m => m.jobId === job.id)?.missingSkills || []}
                                jobTitle={job.title}
                              />
                            </div>
                          </div>

                          {/* Detailed Job Description Section */}
                          <div className="space-y-3 p-5 bg-white rounded-2xl border border-slate-205">
                            <h4 className="text-xs uppercase font-black tracking-wider text-slate-500 font-mono">Job Description Details</h4>
                            <p className="text-sm text-slate-700 leading-relaxed font-sans italic whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                              &ldquo;{job.description}&rdquo;
                            </p>
                          </div>

                          {/* Interactive Submission Footer triggers */}
                          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-4 border-t border-slate-200 gap-4">
                            <span className="text-xs text-slate-400 font-mono font-semibold">
                              Applications Deadline: 2026-06-30
                            </span>

                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setPortalSimulatorJob(job);
                                  setPortalFullName(user.fullName || '');
                                  setPortalEmail(user.email || '');
                                  setPortalSuccess(false);
                                  setPortalCoverLetterText(`Dear Hiring Team,\n\nI am extremely excited to apply for the ${job.title} position at ${job.company}. Based on my background in professional engineering projects and related certifications, I believe i am a wonderful fit for this vacancy.\n\nBest regards,\n${user.fullName || 'Applicant'}`);
                                }}
                                className="px-4.5 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                              >
                                <ExternalLink className="w-4 h-4 text-indigo-600" />
                                Original Corporate Post
                              </button>
                              
                              <button
                                onClick={() => handleOpenApplySim(job)}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-xs font-bold rounded-xl cursor-pointer shadow-sm shadow-indigo-600/10"
                              >
                                Smart AI Instant Apply
                              </button>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl text-slate-400 text-sm font-medium">
                  No matching global openings found. Try adjusting your preferences.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
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
          onApplyRedirect={(job) => {
            setPortalSimulatorJob(job);
            setPortalFullName(user.fullName || '');
            setPortalEmail(user.email || '');
            setPortalSuccess(false);
            setPortalCoverLetterText(`Dear Hiring Team,\n\nI am extremely excited to apply for the ${job.title} position at ${job.company}. Based on my background in professional engineering projects and related certifications, I believe I am a wonderful fit for this vacancy.\n\nBest regards,\n${user.fullName || 'Applicant'}`);
          }}
        />
      )}

      {seekerTab === 'resume' && (
        <div className="border border-slate-200 bg-white rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider font-mono">
                Resume Intelligence Console
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight mt-1">Analytics & Tailored ATS CV Builder</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Analyze current upload statistics or trigger clean templates generation.</p>
            </div>

            <div className="w-fit">
              <ResumeUploader onUploadSuccess={onUploadResume} isLoading={uploadingResume} currentFileName={user.resumeFileName} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 space-y-4">
              
              {/* Score card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 tracking-widest font-mono">COMPREHENSIVE PARSE SCORE</span>
                <p className="text-4xl font-extrabold text-indigo-600 font-mono leading-none font-black">{user.analysis?.score || 60}<span className="text-xs text-slate-400">/100</span></p>
                <p className="text-[10.5px] text-slate-600 font-sans mt-1.5 font-medium">Evaluated matching indices on desired role: <strong className="text-slate-850 font-bold">{user.preferences?.desiredRole || 'Flexible'}</strong></p>
              </div>

              {/* Recommendations certificate gaps */}
              <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-3.5 animate-pulse">
                <h4 className="text-[10.5px] uppercase font-black text-indigo-805 tracking-wider flex items-center gap-1">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Missing Certifications Roadmap</span>
                </h4>
                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="p-2.5 bg-white border border-indigo-100/70 rounded-xl text-slate-800 font-medium shadow-2xs">
                    • <strong className="text-indigo-700 font-bold">Certified Scrum Master (CSM) or CBAP</strong> - highly desired for continuous analytical coordination.
                  </div>
                  <div className="p-2.5 bg-white border border-indigo-100/70 rounded-xl text-slate-800 font-medium shadow-2xs">
                    • <strong className="text-indigo-700 font-bold">PMI Agile Certified Practitioner (PMP)</strong> - adds 15%+ score advantage in system alignment.
                  </div>
                </div>
              </div>

              {/* Builder Configure */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                <span className="text-[10.5px] uppercase font-bold text-slate-605 tracking-wider block">AI Resume Builder Panel</span>
                
                <div className="space-y-3.5">
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-500 font-semibold block">Select Career Target Template</label>
                    <select
                      value={resumeTemplate}
                      onChange={e => setResumeTemplate(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 hover:border-slate-350 cursor-pointer shadow-2xs"
                    >
                      <option value="Developer">Full-Stack Application Developer</option>
                      <option value="Executive">Executive Leadership CV</option>
                      <option value="Marketer">Product Growth Manager</option>
                      <option value="UX Designer">UI/UX Design Specialist</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-500 font-semibold block">Select Export Preset Theme</label>
                    <select
                      value={resumeStyle}
                      onChange={e => setResumeStyle(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 hover:border-slate-350 cursor-pointer shadow-2xs"
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100"
                >
                  <Cpu className="w-3.5 h-3.5 text-white" />
                  Format Tailored Resume
                </button>
              </div>

            </div>

            <div className="lg:col-span-2 space-y-4">
              {generatedResume ? (
                <div className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 px-4 rounded-2xl border border-slate-200 text-xs gap-3">
                    <span className="font-bold text-slate-805 flex items-center gap-2 font-sans">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Resume Ready ({resumeStyle} Preset Style Loaded)
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => triggerSimulatedExport('PDF')}
                        disabled={!!isExporting}
                        className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-250 hover:border-slate-350 text-indigo-700 rounded-lg cursor-pointer transition-all shadow-2xs"
                      >
                        {isExporting === 'PDF' ? 'Compiling PDF...' : 'Download PDF'}
                      </button>
                      <button
                        onClick={() => triggerSimulatedExport('DOCX')}
                        disabled={!!isExporting}
                        className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-250 hover:border-slate-350 text-indigo-700 rounded-lg cursor-pointer transition-all shadow-2xs"
                      >
                        {isExporting === 'DOCX' ? 'Compiling DOCX...' : 'Download DOCX'}
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-700 font-mono leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto shadow-inner">
                    {generatedResume}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs flex flex-col justify-center items-center space-y-4 shadow-2xs">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <FileText className="w-8 h-8 text-slate-401" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-700">AI Tailored CV Builder is Ready</span>
                    <p className="text-[10.5px] text-slate-500 mt-1 max-w-sm leading-relaxed font-semibold">Select target layout parameters and click &ldquo;Format Tailored Resume&rdquo; to build high-performance CV copies instantly.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {seekerTab === 'letters' && (
        <div className="border border-slate-200 bg-white rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100">
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider font-mono">
              AI Cover Letter Studio
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight mt-1">Dynamic Letter Personalization Builder</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Select target published global opening metrics and select tailored pitch tone styles.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-600 font-semibold block">Select Target Role</label>
                <select
                  value={selectedJobForLetter?.id || ""}
                  onChange={e => {
                    const found = jobs.find(j => j.id === e.target.value);
                    if (found) setSelectedJobForLetter(found);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  <option value="" disabled>-- Choose Job Openings --</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.company} • {j.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-slate-600 font-semibold block">Configure Writing Style Accent</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'formal', label: 'Formal Version' },
                    { id: 'creative', label: 'Creative Style' },
                    { id: 'executive', label: 'Executive Leadership' },
                    { id: 'startup', label: 'Startup Punchy Accent' }
                  ].map(styleOpt => (
                    <label key={styleOpt.id} className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200 text-[10.5px] cursor-pointer hover:border-slate-300 text-slate-700 font-medium shadow-2xs">
                      <input 
                        type="radio" 
                        name="style_opt" 
                        checked={letterStyle === styleOpt.id} 
                        onChange={() => setLetterStyle(styleOpt.id as any)}
                        className="accent-indigo-600"
                      />
                      <span>{styleOpt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-sans">
                <label className="text-slate-600 font-semibold block">Insert Specific Custom Prompts</label>
                <textarea
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  rows={3}
                  placeholder="e.g. highlight team management expertise using scaled REST frameworks metrics..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 resize-none placeholder-slate-400 shadow-2xs"
                />
              </div>

              <button
                onClick={triggerLetterGen}
                disabled={generatingLetter || !selectedJobForLetter}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-md shadow-indigo-150 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-bounce" />
                {generatingLetter ? 'Generating Letter...' : 'Generate Cover Letter'}
              </button>
            </div>

            <div className="lg:col-span-2 space-y-3">
              {customLetterText ? (
                <div className="space-y-3 text-xs font-sans">
                  <div className="flex justify-between items-center bg-slate-50 p-3 px-4 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                      Letter Tailored For: {selectedJobForLetter?.company}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(customLetterText);
                        setCopyStatus(true);
                        setTimeout(() => setCopyStatus(false), 1500);
                      }}
                      className="text-indigo-600 text-[11px] font-bold font-sans inline-flex items-center gap-1 hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      {copyStatus ? 'Copied Content!' : 'Copy Letter'}
                    </button>
                  </div>

                  <textarea
                    value={customLetterText}
                    onChange={e => setCustomLetterText(e.target.value)}
                    rows={12}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-705 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 resize-none font-medium shadow-inner"
                  />
                </div>
              ) : (
                <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs flex flex-col justify-center items-center space-y-4 shadow-2xs">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <Bot className="w-8 h-8 text-slate-401" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-700">Cover Letter Studio is Ready</span>
                    <p className="text-[10.5px] text-slate-500 mt-1 max-w-sm leading-relaxed font-semibold">Select target corporate job properties on the left panel & click &ldquo;Generate Cover Letter&rdquo; to draft high-scoring matching pitches.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {seekerTab === 'interview' && (
        <div className="border border-slate-200 bg-white rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider font-mono block">
                AURA MOCK INTERVIEW ADVOCATE
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">Interactive Q&A Practice Room</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Complete AI questions evaluation checks on live target desired roles.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold font-mono">Topic:</span>
              <select
                value={interviewType}
                onChange={e => setInterviewType(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="Technical">Technical Stack (Node, React, databases)</option>
                <option value="Behavioral">Behavioral (STAR method conflicts)</option>
                <option value="HR">HR Standard Screening Culture</option>
                <option value="Company-Specific">Company-Specific vacancy fit</option>
              </select>

              {!interviewStarted && (
                <button
                  onClick={triggerStartInterview}
                  className="px-4.5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-100"
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
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 h-[320px] overflow-y-auto space-y-4 font-sans text-xs flex flex-col justify-end shadow-inner">
                  <div className="space-y-3.5">
                    {interviewHistory.map((hist, i) => (
                      <div key={i} className={`flex gap-3 leading-relaxed max-w-[85%] ${hist.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-extrabold font-mono border text-[10px] ${
                          hist.role === 'user' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs' : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                        }`}>
                          {hist.role === 'user' ? 'YOU' : 'AI'}
                        </div>
                        <div className={`p-3 rounded-2xl text-[11.5px] shadow-2xs font-medium ${
                          hist.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border border-slate-200/80'
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
                      placeholder="Type your structured answer (Situation, Task, Action, Result)..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans shadow-2xs"
                      onKeyDown={e => e.key === 'Enter' && triggerPostResponse()}
                    />
                    <button
                      onClick={triggerPostResponse}
                      disabled={submittingResponse || !candidateResponse}
                      className="px-5 py-2.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 shrink-0 inline-flex items-center gap-1.5 shadow-md shadow-indigo-100"
                    >
                      <span>Post Response</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Assessment diagnostics scorecard column */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 h-full">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Live Assessment Scorecard</span>
                  
                  <div className="space-y-3.5">
                    {[
                      { label: 'Technical Accuracy', score: interviewScores.technical, col: 'bg-indigo-600' },
                      { label: 'Communication Clarity', score: interviewScores.communication, col: 'bg-emerald-500' },
                      { label: 'Confidence & Demeanor', score: interviewScores.confidence, col: 'bg-violet-500' }
                    ].map((metric, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10.5px] font-bold">
                          <span className="text-slate-600">{metric.label}</span>
                          <span className="text-slate-800 font-mono font-extrabold">{metric.score}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${metric.col}`} style={{ width: `${metric.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {interviewEvaluation && (
                    <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                      <span className="text-[9.5px] uppercase font-bold text-slate-550 font-mono tracking-widest block">AI Feedback Summary</span>
                      <p className="leading-relaxed bg-white p-3 rounded-xl text-slate-700 font-sans border border-indigo-100/50 shadow-2xs font-medium text-justify">{interviewEvaluation}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs flex flex-col justify-center items-center space-y-4 shadow-2xs">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <Zap className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <div>
                <span className="block font-bold text-slate-700">Interview Practice Coach is Ready</span>
                <p className="text-[10.5px] text-slate-500 mt-1 max-w-sm leading-relaxed font-semibold">Select target practice style credentials on the upper panel & click &ldquo;Start Round&rdquo; to begin a live professional review.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {seekerTab === 'tracker' && (
        <div className="space-y-6 font-sans">
          
          {/* Conversion analytic rates */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
            {[
              { label: 'Total active Pipeline', val: `${kanbanCards.length} Cards` },
              { label: 'ATS Screening Pass', val: '82%', sub: 'High Match' },
              { label: 'Conversion to Interviews', val: '45%', sub: 'Avg: 30%' },
              { label: 'Offer Conversion Rate', val: '15%', sub: 'Target: 10%' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">{stat.label}</span>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight">{stat.val}</p>
                {stat.sub && <span className="text-[10.5px] text-slate-405 font-mono italic leading-none font-semibold">{stat.sub}</span>}
              </div>
            ))}
          </div>

          {/* Kanban drag/drop lists simulator columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { status: 'Applied', color: 'border-amber-200 bg-slate-50 text-amber-800', badgeCls: 'bg-amber-100 text-amber-800' },
              { status: 'Interview Scheduled', color: 'border-indigo-200 bg-slate-50 text-indigo-800', badgeCls: 'bg-indigo-100 text-indigo-800' },
              { status: 'Offer Received', color: 'border-emerald-200 bg-slate-50 text-emerald-800', badgeCls: 'bg-emerald-100 text-emerald-800' }
            ].map(col => {
              const cards = kanbanCards.filter(c => c.status === col.status);
              
              return (
                <div key={col.status} className={`p-5 rounded-2xl border ${col.color} space-y-4 h-fit shadow-xs`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-sans flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${col.badgeCls}`}>{cards.length}</span>
                      {col.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {cards.length > 0 ? (
                      cards.map(card => (
                        <div key={card.id} className="p-4 bg-white rounded-xl border border-slate-205 space-y-3 shadow-2xs hover:border-slate-350 transition-all text-slate-850">
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 block leading-tight">{card.jobTitle}</span>
                            <span className="text-[10.5px] text-slate-500 font-semibold font-mono block mt-1">{card.company}</span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                            <span className="font-semibold">via: {card.source}</span>
                            <button 
                              onClick={() => handleDeleteKanbanCard(card.id)}
                              className="text-slate-400 hover:text-rose-600 font-bold ml-1 transition-all cursor-pointer font-sans"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-[10.5px] text-slate-400 font-mono italic font-semibold">No jobs in column</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {seekerTab === 'coach' && (
        <div className="border border-slate-200 bg-white rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100">
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider font-mono block">
              24/7 INTERACTIVE CAREER COACH
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">Full-Stack Counseling & Strategy Companion</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Ask strategic questions regarding certificate targets, custom resume formats, or wage negotiations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Quick tips selectors */}
            <div className="lg:col-span-1 space-y-3.5 text-xs leading-tight">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">Specialist Prompt Presets</span>
              <div className="space-y-2">
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
                    className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-250 transition-all cursor-pointer truncate font-medium shadow-2xs"
                  >
                    {templateMsg}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat screen */}
            <div className="lg:col-span-3 space-y-3.5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 h-[340px] overflow-y-auto space-y-4 text-xs font-sans shadow-inner">
                {coachMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold font-mono text-[10px] shrink-0 border shadow-2xs ${
                      msg.role === 'user' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-700 border-slate-200'
                    }`}>
                      {msg.role === 'user' ? 'YOU' : 'AI'}
                    </div>
                    <div className={`p-3 rounded-2xl text-[11.5px] font-medium shadow-2xs ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border border-slate-200/80'
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
                  className="w-full bg-white border border-slate-205 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans shadow-2xs"
                  onKeyDown={e => e.key === 'Enter' && handleSendCoachMsg()}
                />
                <button
                  onClick={handleSendCoachMsg}
                  disabled={coachSending || !coachInput.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-extrabold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-100"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask Coach</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {seekerTab === 'visitors' && (
        <div className="space-y-6">
          {/* Analytics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute right-3.5 top-3.5 text-indigo-300 select-none">
                <Users className="w-16 h-16 opacity-20 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-indigo-700 tracking-wider font-mono">Total Visual Clicks</span>
                <h3 className="text-3xl font-black text-indigo-950 font-sans tracking-tight">{profileViews.length}</h3>
                <p className="text-xs text-indigo-800/80 font-medium leading-normal">Aggregate number of recruiters viewing your complete resume indices.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider font-mono">Top Recruiting Partner</span>
                <h3 className="text-base font-extrabold text-slate-900 font-sans truncate">
                  {profileViews.length > 0 
                    ? (profileViews[profileViews.length - 1].metadata?.companyName || profileViews[profileViews.length - 1].metadata?.company || "Verified Employer")
                    : "Waiting for clicks"}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-normal">Enterprise partner that recently completed your portfolio match analysis.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider font-mono">Last Activity Logged</span>
                <h3 className="text-xs font-bold text-slate-900 font-mono">
                  {profileViews.length > 0 
                    ? new Date(profileViews[profileViews.length - 1].timestamp).toLocaleString()
                    : "No views recorded yet"}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-normal">Last verified timestamp an employer fetched credentials payload.</p>
              </div>
            </div>
          </div>

          {/* Historical Log */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-slate-800">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Recruiter Audits Log</h3>
                <p className="text-xs text-slate-500">Chronological history of executive talent matches & profile view activity</p>
              </div>
              <button 
                onClick={fetchProfileViews}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer text-slate-600 inline-flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sync Logs</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {profileViews.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-full border border-slate-200/50 text-slate-400 flex items-center justify-center mx-auto">
                    <Eye className="w-7 h-7 text-slate-400" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-xs font-black text-slate-700">Your profile hasn't been clicked of late.</h4>
                    <p className="text-xs text-slate-400">Optimize your resume ATS index or compatibility indicators in the matches index to gain recruiter highlight priority!</p>
                  </div>
                </div>
              ) : (
                [...profileViews].reverse().map((view, i) => {
                  const companyName = view.metadata?.companyName || view.metadata?.company || "Enterprise Recruiter";
                  const employerName = view.metadata?.employerName || "Talent Acquisition Lead";
                  return (
                    <div key={view.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 flex items-center justify-center font-black font-mono">
                          {companyName ? companyName.charAt(0).toUpperCase() : "E"}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-900">{employerName}</span>
                            <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                              {companyName}
                            </span>
                            {i === 0 && (
                              <span className="text-[9px] font-black uppercase font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 animate-pulse">
                                Most Recent View
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                            {view.message || "Recruiter reviewed your custom resume credentials and talent qualification index details."}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <span className="text-xs font-bold text-slate-950 block">
                          {new Date(view.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(view.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
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
                            <option value="1">1-2 Years (Associate / Junior Specialist)</option>
                            <option value="3">3-5 Years (Mid-Senior Professional)</option>
                            <option value="6">6-8 Years (Lead Practitioner / Consultant)</option>
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
