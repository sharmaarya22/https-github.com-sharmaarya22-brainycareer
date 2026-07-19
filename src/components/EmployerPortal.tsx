import React, { useState, useEffect } from 'react';
import { 
  Building, Plus, Users, Sparkles, AlertCircle, FileText, CheckCircle2, 
  Trash2, Award, Zap, ThumbsUp, ThumbsDown, Check, Star, Play, Download, Send, Edit3, MessageSquare, Briefcase, Eye
} from 'lucide-react';
import { Job, User } from '../types';

interface EmployerPortalProps {
  jobs: Job[];
  user: User;
  token: string;
  onAddJob: (newJob: Job) => void;
  onRefreshJobs: () => Promise<void>;
  registeredUsers: User[];
  currentPlan: 'Free' | 'Pro' | 'Enterprise';
  onShowToast?: (title: string, message: string) => void;
  onNavigatePricing?: () => void;
}

export default function EmployerPortal({ 
  jobs = [], 
  user, 
  token, 
  onAddJob, 
  onRefreshJobs, 
  registeredUsers = [], 
  currentPlan,
  onShowToast,
  onNavigatePricing
}: EmployerPortalProps) {
  const [activeTab, setActiveTab] = useState<'applicants' | 'listings' | 'interview_assistant'>('applicants');
  const [companyProfile, setCompanyProfile] = useState({
    name: "Brainy Career Corp",
    logoURL: "",
    website: "www.brainycareer.com",
    industry: "Artificial Intelligence",
    size: "11-50 employees",
    hq: "San Francisco, CA",
    verified: true
  });

  // Form states for creating or editing job listings
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState(companyProfile.name);
  const [newLocation, setNewLocation] = useState('');
  const [newModel, setNewModel] = useState<'Remote' | 'Hybrid' | 'Onsite'>('Remote');
  const [newSalary, setNewSalary] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReqs, setNewReqs] = useState('');
  const [newTags, setNewTags] = useState('');

  // Dynamic custom candidate/employee matching state variables
  const [candName, setCandName] = useState('');
  const [candSkills, setCandSkills] = useState('');
  const [candExp, setCandExp] = useState<'Entry' | 'Mid' | 'Senior'>('Mid');
  const [candResumeText, setCandResumeText] = useState('');
  const [candMatches, setCandMatches] = useState<any[]>([]);
  const [isMatchingCandidate, setIsMatchingCandidate] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Local applicants list (with initial fallback/mock seekers, strictly excluding Gaurav!)
  const [applicants, setApplicants] = useState<any[]>([
    {
      id: "app-102",
      fullName: "Liam Neeson",
      skills: ["React", "CSS", "HTML", "WordPress"],
      atsScore: 48,
      culturalFit: 55,
      experienceLevel: "Entry",
      suitability: "Needs Training",
      strength: "Strong basic web layout structuring skills.",
      gap: "Missing backend Node, API development, and TypeScript type constraints experience.",
      status: "UNDER_REVIEW",
      resumeFileName: "Liam_Resume_Draft.txt",
      resumeText: "LIAM NEESON RESUME\nSkills: React, CSS, HTML, WordPress\nExperience in developing WordPress sites."
    },
    {
      id: "app-103",
      fullName: "Emily Blunt",
      skills: ["Express", "Node.js", "PostgreSQL", "JavaScript", "Docker"],
      atsScore: 78,
      culturalFit: 84,
      experienceLevel: "Mid",
      suitability: "Suitable",
      strength: "Experienced Node runtime backend dev and SQL query optimization strategies.",
      gap: "Modern React state handlers and Tailwind layout styling.",
      status: "SHORTLISTED",
      resumeFileName: "Emily_CV_2026.docx",
      resumeText: "EMILY BLUNT\nSenior Node Backend Architect\nAdvanced Postgres query setups, Docker containers"
    }
  ]);

  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [jobForQuestions, setJobForQuestions] = useState<string>("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([
    "Explain your strategy to protect an Express database route against deep connection pools leaks.",
    "Describe a time you solved an infinite re-render loop inside a complex React system.",
    "How would you integrate real-time collaborative state persistence without breaking local caches?"
  ]);

  // Chat/Messaging system states
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatJobId, setChatJobId] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch registered seekers from server & fetch chats
  const fetchDbApplicantsAndChats = async () => {
    try {
      // 1. Fetch Candidates (Seekers with resumes)
      const appRes = await fetch('/api/applicants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let registeredSeekers: any[] = [];
      if (appRes.ok) {
        const appData = await appRes.json();
        registeredSeekers = appData.applicants || [];
      }

      // Format dynamic database seekers to match the list structure
      const formattedSeekers = registeredSeekers.map((seeker: any) => ({
        id: seeker.id,
        fullName: seeker.fullName || seeker.email,
        skills: seeker.analysis?.parsedSkills || seeker.preferences?.skills || ["React", "TypeScript"],
        atsScore: seeker.analysis?.overallAtsScore || 85,
        culturalFit: 85,
        experienceLevel: seeker.analysis?.recommendedRole?.includes("Senior") ? "Senior" : "Mid",
        suitability: "Highly Suitable",
        strength: seeker.analysis?.executiveStrategicSummary || "Strong analytical and software integration talents.",
        gap: seeker.analysis?.structuralGapsImprovementAreas || "Familiarity with container clustering.",
        status: seeker.status || "UNDER_REVIEW",
        resumeFileName: seeker.resumeFileName || "resume.txt",
        resumeText: seeker.resumeText || ""
      }));

      // Filter local applicants to remove any potential duplicates by name, and exclude Gaurav
      const defaultSeekersCleaned = [
        {
          id: "app-102",
          fullName: "Liam Neeson",
          skills: ["React", "CSS", "HTML", "WordPress"],
          atsScore: 48,
          culturalFit: 55,
          experienceLevel: "Entry",
          suitability: "Needs Training",
          strength: "Strong basic web layout structuring skills.",
          gap: "Missing backend Node, API development, and TypeScript type constraints experience.",
          status: "UNDER_REVIEW",
          resumeFileName: "Liam_Resume_Draft.txt",
          resumeText: "LIAM NEESON RESUME\nSkills: React, CSS, HTML, WordPress"
        },
        {
          id: "app-103",
          fullName: "Emily Blunt",
          skills: ["Express", "Node.js", "PostgreSQL", "JavaScript", "Docker"],
          atsScore: 78,
          culturalFit: 84,
          experienceLevel: "Mid",
          suitability: "Suitable",
          strength: "Experienced Node runtime backend dev and SQL query optimization.",
          gap: "Modern React state handlers and Tailwind layout styling.",
          status: "SHORTLISTED",
          resumeFileName: "Emily_CV_2026.docx",
          resumeText: "EMILY BLUNT\nSenior Node Backend Architect\nAdvanced Postgres query setups"
        }
      ];

      // Combine database applicants with clean mock ones
      const combined = [...formattedSeekers];
      defaultSeekersCleaned.forEach(m => {
        if (!combined.find(c => c.fullName.toLowerCase() === m.fullName.toLowerCase())) {
          combined.push(m);
        }
      });

      setApplicants(combined);
      if (combined.length > 0 && !selectedApplicant) {
        setSelectedApplicant(combined[0]);
      }

      // 2. Fetch Chat Messages list
      const msgRes = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);
      }
    } catch (e) {
      console.error("Failed to load applicants and communications:", e);
    }
  };

  useEffect(() => {
    fetchDbApplicantsAndChats();
    // Default chatJobId to the first available job
    if (jobs.length > 0) {
      setChatJobId(jobs[0].id);
      setJobForQuestions(jobs[0].id);
    }
  }, [token, jobs.length]);

  // Refetch messages periodically (basic pulling)
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeTab === 'applicants') {
        const fetchOnlyChats = async () => {
          try {
            const msgRes = await fetch('/api/messages', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (msgRes.ok) {
              const msgData = await msgRes.json();
              setMessages(msgData.messages || []);
            }
          } catch (_) {}
        };
        fetchOnlyChats();
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [token, activeTab]);

  // Fetch telemetry to register that the recruiter checked a candidate's details
  const handleSelectApplicant = async (app: any) => {
    setSelectedApplicant(app);
    try {
      await fetch(`/api/applicants/${app.id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      console.warn("Failed to log candidate view event:", e);
    }
  };

  // Update applicant application status
  const handleUpdateApplicantStatus = async (applicantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applicants/${applicantId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          jobId: chatJobId || (jobs.length > 0 ? jobs[0].id : '')
        })
      });

      if (response.ok) {
        // Update local applicants state so it reflects immediately
        setApplicants(prev => prev.map(app => 
          app.id === applicantId ? { ...app, status: newStatus } : app
        ));
        // Update selectedApplicant too
        setSelectedApplicant(prev => prev && prev.id === applicantId ? { ...prev, status: newStatus } : prev);
      } else {
        const err = await response.json();
        alert("Failed to update applicant state: " + (err.error || "Server issue"));
      }
    } catch (e: any) {
      alert("Error submitting applicant status update: " + e.message);
    }
  };

  // Format date readable
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (_) {
      return dateStr;
    }
  };

  // Submit new job listing or save edit changes
  const triggerSaveJobListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLocation || !newSalary) {
      alert("Please specify necessary job requirements: Job Title, Location, and Salary.");
      return;
    }

    // Enforce Free plan job listing limit
    if (currentPlan === 'Free' && !editingJobId) {
      const companyJobsCount = jobs.filter(jb => {
        const companyName = companyProfile.name.toLowerCase();
        return jb.company && jb.company.toLowerCase() === companyName;
      }).length;
      if (companyJobsCount >= 5) {
        if (onShowToast) {
          onShowToast("Upgrade Required", "You have reached your limit of 5 job listings on the Free plan. Upgrade to Premium for unlimited job postings!");
        } else {
          alert("Upgrade Required: You have reached your limit of 5 job listings on the Free plan. Upgrade to Premium for unlimited job postings!");
        }
        if (onNavigatePricing) {
          onNavigatePricing();
        }
        return;
      }
    }

    const payload = {
      title: newTitle,
      company: newCompany || companyProfile.name,
      location: newLocation,
      locationModel: newModel,
      salaryRange: newSalary,
      description: newDesc || "Excellent development role at our AI tech center.",
      requirements: newReqs ? newReqs.split(",").map(r => r.trim()) : ["React", "TypeScript", "Node.js"],
      responsibilities: ["Develop enterprise modules", "Scale internal databases", "Engage in pair reviews"],
      tags: newTags ? newTags.split(",").map(t => t.trim()) : ["React", "Dev"],
      originalUrl: "https://www.brainycareer.com/careers"
    };

    try {
      let response;
      if (editingJobId) {
        // Edit Mode
        response = await fetch(`/api/jobs/${editingJobId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Mode
        response = await fetch('/api/jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to sync job with database.');
      }

      alert(editingJobId ? "Job opening updated successfully!" : "New job listing successfully published to the platform database!");
      await onRefreshJobs();
      
      // Reset State
      setEditingJobId(null);
      setNewTitle('');
      setNewLocation('');
      setNewSalary('');
      setNewDesc('');
      setNewReqs('');
      setNewTags('');
      
    } catch (err: any) {
      alert(err.message || "An error occurred saving the job details.");
    }
  };

  // Load a job into form for editing
  const handleLoadJobForEditing = (job: Job) => {
    if (job.status === "Closed") {
      alert("This job has been marked as Closed. Reopen it to enable details editing.");
      return;
    }
    setEditingJobId(job.id);
    setNewTitle(job.title);
    setNewCompany(job.company);
    setNewLocation(job.location);
    setNewModel(job.locationModel);
    setNewSalary(job.salaryRange);
    setNewDesc(job.description);
    setNewReqs(Array.isArray(job.requirements) ? job.requirements.join(", ") : typeof job.requirements === 'string' ? job.requirements : "");
    setNewTags(Array.isArray(job.tags) ? job.tags.join(", ") : typeof job.tags === 'string' ? job.tags : "");
    // Scroll form into focus or scroll to top
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  // Toggle Job Open/Closed status directly on backend
  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Closed' ? 'Open' : 'Closed';
    const confirmToggle = window.confirm(`Are you sure you want to mark this vacancy as "${nextStatus}"?`);
    if (!confirmToggle) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        alert(`Vacancy status changed successfully to ${nextStatus}!`);
        await onRefreshJobs();
      } else {
        const errVal = await response.json();
        alert("Could not update status: " + (errVal.error || "Server issue"));
      }
    } catch (e: any) {
      alert("Error updating status: " + e.message);
    }
  };

  // Safe chemical extraction for candidate resume downloading
  const handleDownloadApplicantResume = async (applicant: any) => {
    // If mock candidate, download locally synthesized plain file
    if (applicant.id.startsWith("app-")) {
      try {
        const textToSave = applicant.resumeText || `Mock resume file for candidate ${applicant.fullName}. Skills: ${applicant.skills.join(",")}`;
        const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = applicant.resumeFileName || `${applicant.fullName.replace(/\s+/g, '_')}_resume.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        alert("Downloading simulated resume failed.");
      }
      return;
    }

    // Direct database Candidate download calling endpoint
    try {
      const res = await fetch(`/api/users/${applicant.id}/resume/download`);
      if (!res.ok) {
        throw new Error("Target file missing on backend servers.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = applicant.resumeFileName || "candidate_resume.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      alert("Resume Download Error: " + err.message);
    }
  };

  // Send Direct Message
  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedApplicant) return;

    setIsSendingMessage(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedApplicant.id,
          jobId: chatJobId || 'general',
          content: chatInput.trim()
        })
      });

      if (response.ok) {
        setChatInput('');
        // Refetch immediately
        const msgRes = await fetch('/api/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (msgRes.ok) {
          const mData = await msgRes.json();
          setMessages(mData.messages || []);
        }
      } else {
        const data = await response.json();
        alert(data.error || "Failed context sending message.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Generate customized screening questions
  const generateAIQuestions = () => {
    const selectedJobObj = jobs.find(l => l.id === jobForQuestions) || jobs[0];
    if (!selectedJobObj) return;

    const reqsArray = Array.isArray(selectedJobObj.requirements)
      ? selectedJobObj.requirements
      : typeof selectedJobObj.requirements === 'string'
        ? (selectedJobObj.requirements as string).split(',').map(s => s.trim()).filter(Boolean)
        : ["React", "TypeScript"];
    const baseReqs = reqsArray.length > 0 ? reqsArray : ["React", "TypeScript"];
    setGeneratedQuestions([
      `Based on requirements for ${selectedJobObj.title}: Describe your practical experience managing ${baseReqs[0] || 'clean layouts'} in production environments.`,
      `How do you handle error propagation in asynchronous requests combining ${baseReqs[1] || 'Node API'} integrations?`,
      `Explain your system testing strategies for performance benchmarks before pushing pipelines to Cloud environments.`,
      `Describe how you configured ${baseReqs[2] || 'Tailwind CSS / SQL'} inside a high-volume development project at short notice.`
    ]);
  };

  const handleMatchCandidateWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim()) {
      alert("Candidate/Employee name is required.");
      return;
    }

    setIsMatchingCandidate(true);
    setMatchError(null);
    setCandMatches([]);

    try {
      const response = await fetch('/api/employer/match-candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: candName.trim(),
          skills: candSkills,
          experienceLevel: candExp,
          resumeText: candResumeText.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate match ratings.");
      }

      const matchData = await response.json();
      setCandMatches(matchData.matches || []);
      if (onShowToast) {
        onShowToast("Match Completed", `Successfully calculated matching scores for candidate ${candName}!`);
      }
    } catch (err: any) {
      console.error(err);
      setMatchError(err.message || "An unexpected error occurred during AI matchmaking.");
    } finally {
      setIsMatchingCandidate(false);
    }
  };

  // Filter messages for current selected seeker thread
  const filteredChats = selectedApplicant ? messages.filter(
    (m: any) => (m.senderId === user.id && m.receiverId === selectedApplicant.id) || 
                 (m.senderId === selectedApplicant.id && m.receiverId === user.id)
  ) : [];

  return (
    <div id="employer-portal-view" className="space-y-8 font-sans bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200">
      
      {/* Recruiter Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 bg-white rounded-2xl border border-slate-200 gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-indigo-150">
            {companyProfile.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{companyProfile.name}</h2>
              <span className="text-[10px] uppercase font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                Verified Employer
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">HQ: {companyProfile.hq} • {companyProfile.size} • <a href={`http://${companyProfile.website}`} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline font-mono text-[13px]">{companyProfile.website}</a></p>
          </div>
        </div>

        {/* Portlet navigation controls */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl border border-slate-200 text-sm font-bold gap-1">
          <button 
            onClick={() => setActiveTab('applicants')}
            className={`px-4.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'applicants' 
                ? 'bg-white text-indigo-600 shadow-sm font-extrabold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Candidate Matcher ({applicants.length})
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('listings');
              setEditingJobId(null);
            }}
            className={`px-4.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'listings' 
                ? 'bg-white text-indigo-600 shadow-sm font-extrabold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Job Postings Builder
          </button>
          
          <button 
            onClick={() => setActiveTab('interview_assistant')}
            className={`px-4.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'interview_assistant' 
                ? 'bg-white text-indigo-600 shadow-sm font-extrabold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interview Question Assistant
          </button>

          <button 
            onClick={() => setActiveTab('dynamic_matcher')}
            className={`px-4.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dynamic_matcher' 
                ? 'bg-white text-indigo-600 shadow-sm font-extrabold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct Employee Matcher
          </button>
        </div>
      </div>

      {/* 1. APPLICANTS TAB */}
      {activeTab === 'applicants' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Rank list column */}
          <div className="xl:col-span-1 border border-slate-200 rounded-3xl p-5 bg-white space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-950 uppercase tracking-wider">Candidate Ranker Queue</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Dynamic applicants screen. Real-time ATS analytics & uploaded profiles indexed below.</p>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {applicants.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm font-medium">No candidate has uploaded profile resumes yet.</div>
              ) : (
                applicants.map(app => {
                  const isSelected = selectedApplicant?.id === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => handleSelectApplicant(app)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md' 
                          : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-sm font-bold text-slate-900 block leading-tight">{app.fullName}</span>
                          <span className="text-xs text-slate-500 font-semibold block mt-1.5">{app.experienceLevel} Developer</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-indigo-700 block tracking-tight">{app.atsScore}% FIT</span>
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest font-mono">ATS INDEX</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 md:gap-1.5 mt-3">
                        {app.skills.slice(0, 4).map((sk: string, idx: number) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                        {app.skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-bold self-center leading-none">+{app.skills.length - 4}</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-3 border-t border-slate-100 mt-3 font-medium">
                        <span className="text-slate-500 truncate max-w-[120px] font-mono">{app.resumeFileName}</span>
                        <span className="font-bold text-indigo-600 uppercase text-[10px] tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Detailed Panel showing Applicant Info & Chat Thread */}
          <div className="xl:col-span-2 space-y-6">
            {selectedApplicant ? (
              <div className="space-y-6 bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
                
                {/* Visual Recruiter Status Controller */}
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-indigo-700 font-mono tracking-widest block">Recruiter Status Panel</span>
                    <p className="text-xs text-slate-600 font-semibold leading-none">Modify application tracking state & emit real-time push notification</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'UNDER_REVIEW', label: 'Under Review' },
                      { id: 'SHORTLISTED', label: 'Shortlist' },
                      { id: 'Interview Scheduled', label: 'Invite Interview' },
                      { id: 'Offer Received', label: 'Extend Offer' }
                    ].map(statusBtn => {
                      const isActive = selectedApplicant.status === statusBtn.id;
                      return (
                        <button
                          key={statusBtn.id}
                          onClick={() => handleUpdateApplicantStatus(selectedApplicant.id, statusBtn.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            isActive 
                              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300' 
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {statusBtn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Score Header Indicators */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono">ATS QUALIFICATION SUMMARY</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedApplicant.fullName}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
                      <FileText className="w-3.5 h-3.5" />
                      Document type: <span className="font-semibold text-slate-800 underline">{selectedApplicant.resumeFileName}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDownloadApplicantResume(selectedApplicant)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100/70 transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4 text-indigo-600" />
                      Download Resume
                    </button>
                    <div className="text-center p-2 px-4 bg-indigo-600 text-white rounded-xl shadow-md">
                      <span className="text-[9px] font-extrabold uppercase text-indigo-200 block font-mono tracking-wider">FIT Score</span>
                      <span className="text-lg font-black block leading-none mt-0.5">{selectedApplicant.atsScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Score details grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50/55 border border-emerald-100 space-y-1">
                    <div className="text-emerald-800 font-bold text-[13px] flex items-center gap-1 px-1 py-0.5">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      Key Core Competency Strengths
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedApplicant.strength}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/55 border border-amber-100 space-y-1">
                    <div className="text-amber-800 font-bold text-[13px] flex items-center gap-1 px-1 py-0.5">
                      <ThumbsDown className="w-4 h-4 text-amber-600" />
                      Development & Strategic Gaps
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedApplicant.gap}</p>
                  </div>
                </div>

                {/* Candidate detailed attributes */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-widest font-black text-slate-400 font-mono">Skills Indexed</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedApplicant.skills.map((st: string, i: number) => (
                      <span key={i} className="bg-slate-50 text-slate-700 border border-slate-200 text-xs px-2.5 py-1 rounded-lg font-semibold tracking-tight">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CANDIDATE SUBMITTED APPLICATIONS & TRACKING COVER LETTERS */}
                <div className="space-y-3.5 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h4 className="text-xs uppercase tracking-widest font-black text-slate-900 font-mono">
                      Submitted Applications & Custom Core Pitches ({selectedApplicant.applications?.length || 0})
                    </h4>
                  </div>
                  
                  {selectedApplicant.applications && selectedApplicant.applications.length > 0 ? (
                    <div className="space-y-3">
                      {selectedApplicant.applications.map((appItem: any, appIdx: number) => (
                        <div key={appIdx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2.5 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 pb-2">
                            <div>
                              <span className="text-xs font-black text-slate-900 block leading-tight">
                                {appItem.jobTitle}
                              </span>
                              <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                                {appItem.company} • Portal Source: <span className="font-extrabold text-indigo-650">{appItem.source || "Direct Portal"}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                                {new Date(appItem.appliedAt).toLocaleDateString()}
                              </span>
                              <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[9.5px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full">
                                {appItem.status}
                              </span>
                            </div>
                          </div>
                          
                          {appItem.coverLetter && (
                            <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-150">
                              <span className="text-[9.5px] uppercase font-bold text-slate-400 block font-mono">CUSTOM LETTER ENCLOSED</span>
                              <p className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700">
                                {appItem.coverLetter}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-450 font-mono italic p-4 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                      No applications logged on local system for this candidate yet.
                    </div>
                  )}
                </div>

                {/* FULL-STACK DIRECT CHAT WORKSPACE */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-205 p-3 px-4.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-800">Recruiter Chat Context & Messaging</h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 font-mono">Starting Job:</span>
                      <select 
                        value={chatJobId}
                        onChange={(e) => setChatJobId(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none font-semibold cursor-pointer max-w-[200px]"
                      >
                        {jobs.map(j => (
                          <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Messaging logs board */}
                  <div className="h-60 bg-slate-50 border border-slate-200 rounded-2xl p-4.5 overflow-y-auto space-y-3 shadow-inner">
                    {filteredChats.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 text-sm font-medium">
                        No dialogue initiated yet. Initiate contact by sending a welcome inquiry message regarding the selected position.
                      </div>
                    ) : (
                      filteredChats.map((msg: any) => {
                        const isMe = msg.senderId === user.id;
                        const relatedJob = jobs.find(jb => jb.id === msg.jobId);
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-3.5 ${
                              isMe ? 'bg-indigo-650 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                            }`}>
                              <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                              <div className="flex justify-between items-center gap-4 mt-1.5 pt-1.5 border-t border-current/10 text-[10px] opacity-75 font-mono">
                                <span>{isMe ? 'Employer (You)' : selectedApplicant.fullName}</span>
                                <span>
                                  {relatedJob ? `via ${relatedJob.title}` : 'Inquiry'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Chat submission bar */}
                  <form onSubmit={handleSendDirectMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      required
                      placeholder={`Send direct response to ${selectedApplicant.fullName} regarding the selected vacancy...`}
                      className="flex-1 bg-slate-50 border border-slate-200 pl-4 pr-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 font-medium placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={isSendingMessage || !chatInput.trim()}
                      className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="h-96 border border-slate-250 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400 text-sm font-medium">
                Please select a candidate from the ranking list queue on left to view ATS analytics scorecard.
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. JOB POSTINGS BUILDER TAB */}
      {activeTab === 'listings' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* Left posting builder workspace */}
            <div className="lg:col-span-2 border border-slate-200 bg-white p-6 rounded-3xl space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  {editingJobId ? "Edit Open Vacancy Opening" : "Publish Dynamic Job Opening"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Publish vacancies straight into the platform database engine instantly.</p>
              </div>

              <form onSubmit={triggerSaveJobListing} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Senior Full Stack Engineer (React & Go)"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Salary Scale Range</label>
                    <input
                      type="text"
                      required
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      placeholder="e.g., $135,000 - $160,000"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Location</label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g., Boston, MA"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Workplace Model</label>
                    <select
                      value={newModel}
                      onChange={(e: any) => setNewModel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-bold cursor-pointer"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Company Identifier</label>
                    <input
                      type="text"
                      value={newCompany}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm text-slate-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Key Matchmaking Skills Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newReqs}
                    onChange={(e) => setNewReqs(e.target.value)}
                    placeholder="React, TypeScript, Redux, PostgreSQL"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Brief Role Description</label>
                  <textarea
                    rows={4}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe core duties and expectations of target candidates here..."
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-medium resize-none shadow-inner"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    id="save-job-submit-btn"
                    type="submit"
                    className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-indigo-100 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingJobId ? "Save Job Edits" : "Publish to Database"}</span>
                  </button>

                  {editingJobId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingJobId(null);
                        setNewTitle('');
                        setNewLocation('');
                        setNewSalary('');
                        setNewDesc('');
                        setNewReqs('');
                      }}
                      className="px-4 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right table displaying all posted positions with edits controls & lock */}
            <div className="lg:col-span-3 border border-slate-200 bg-white p-6 rounded-3xl space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  Active Posted Vacancy Board
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Ensure posted openings are optimized. Open jobs can be updated anytime; once marked "Closed", editing is securely locked.</p>
              </div>

              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {jobs.length === 0 ? (
                  <div className="text-center py-24 text-slate-400 text-sm font-medium">No posted listings in this database registry yet. Write one on the left panel!</div>
                ) : (
                  jobs.map(jb => {
                    const isClosed = jb.status === 'Closed';
                    return (
                      <div key={jb.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-350 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">{jb.title}</span>
                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                              isClosed ? 'bg-slate-200 text-slate-650' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {jb.status || 'Open'}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 font-semibold">{jb.company} • <span className="font-mono">{jb.location} ({jb.locationModel})</span></p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="bg-white border border-slate-200 text-[11px] font-bold text-indigo-600 py-0.5 px-2.5 rounded-lg">{jb.salaryRange}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Posted {formatDate(jb.postedDate)}</span>
                          </div>
                        </div>

                        {/* Edit job / Close job buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {!isClosed ? (
                            <>
                              <button
                                onClick={() => handleLoadJobForEditing(jb)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                Edit Title/Desc
                              </button>
                              
                              <button
                                onClick={() => handleToggleJobStatus(jb.id, 'Open')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-100 transition-all cursor-pointer"
                              >
                                Close Posting
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <span className="text-xs text-slate-400 font-bold bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 block w-full text-center sm:w-auto">🔒 Posting Closed</span>
                              <button
                                onClick={() => handleToggleJobStatus(jb.id, 'Closed')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 transition-all cursor-pointer"
                              >
                                Reopen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. AI RECRUITER ASSISTANT TAB */}
      {activeTab === 'interview_assistant' && (
        <div className="border border-slate-200 bg-white p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-950 uppercase tracking-widest flex items-center gap-2 font-mono">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              AI Recruiter Screening Assistant
            </h3>
            <p className="text-xs text-slate-500 mt-1">Select an active posted vacancy to formulate elite, AI-scoring interview screening question tracks instantly.</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-slate-600 font-mono">Active Job Context:</label>
            <select
              value={jobForQuestions}
              onChange={(e) => setJobForQuestions(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none font-bold cursor-pointer"
            >
              {jobs.map(jb => (
                <option key={jb.id} value={jb.id}>{jb.title} ({jb.company})</option>
              ))}
            </select>
            <button
              onClick={generateAIQuestions}
              disabled={jobs.length === 0}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 select-none shadow-md"
            >
              <Play className="w-3.5 h-3.5 text-white" />
              Generate Screening Tracks
            </button>
          </div>

          <div className="space-y-3 pt-3">
            {generatedQuestions.map((qs, i) => (
              <div key={i} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex gap-3.5 items-start">
                <div className="w-7 h-7 bg-indigo-50 border border-indigo-105 rounded-xl flex items-center justify-center font-bold text-xs text-indigo-700 font-mono shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-800 leading-normal font-medium">{qs}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DIRECT EMPLOYEE/CANDIDATE MATCHER TAB */}
      {activeTab === 'dynamic_matcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Left panel: Candidate/Employee upload & detail form */}
          <div className="lg:col-span-2 border border-slate-200 bg-white p-6 rounded-3xl space-y-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-5 h-5 text-indigo-600" />
                Upload Employee / Candidate details
              </h3>
              <p className="text-xs text-slate-500 mt-1">Enter candidate background, experiences, and core skills to evaluate alignment with your open job listings instantly.</p>
            </div>

            <form onSubmit={handleMatchCandidateWithAI} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="e.g., Jane Miller"
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Experience Seniority Tier</label>
                  <select
                    value={candExp}
                    onChange={(e: any) => setCandExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-bold cursor-pointer"
                  >
                    <option value="Entry">Entry (0-2 years)</option>
                    <option value="Mid">Mid Level (2-5 years)</option>
                    <option value="Senior">Senior Elite (5+ years)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Key Core Skills (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={candSkills}
                  onChange={(e) => setCandSkills(e.target.value)}
                  placeholder="e.g., React, Node.js, Express, PostgreSQL"
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Paste Resume Text or Professional Profile Details</label>
                <textarea
                  rows={6}
                  value={candResumeText}
                  onChange={(e) => setCandResumeText(e.target.value)}
                  placeholder="Paste work experience, past roles, or complete resume details here to power deep semantic AI matching..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 font-medium resize-none shadow-inner"
                />
              </div>

              <button
                id="evaluate-candidate-ai-btn"
                type="submit"
                disabled={isMatchingCandidate}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-100"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isMatchingCandidate ? "AI Matchmaker running..." : "Evaluate & List Best Matches"}</span>
              </button>
            </form>
          </div>

          {/* Right panel: Live Matchmaking ratings */}
          <div className="lg:col-span-3 border border-slate-200 bg-white p-6 rounded-3xl space-y-6 shadow-sm min-h-[500px]">
            <div>
              <h3 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                AI Job Matchmaker Report Card
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Dynamic semantic AI evaluation. Your posted jobs are automatically indexed and compared against candidate qualifications.</p>
            </div>

            {isMatchingCandidate ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-extrabold text-slate-800 animate-pulse">Running AI Career Matchmaking Algorithm...</p>
                  <p className="text-xs text-slate-500 mt-1">Analyzing candidate resume details against active vacancy specifications</p>
                </div>
              </div>
            ) : matchError ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <span className="font-extrabold block">Matchmaker Error</span>
                  <p className="mt-0.5">{matchError}</p>
                </div>
              </div>
            ) : candMatches.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {candMatches.map((matchItem: any, index: number) => {
                  const job = matchItem.job;
                  const score = matchItem.score;
                  return (
                    <div key={job.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 hover:border-indigo-200 hover:bg-slate-50/50 transition-all shadow-2xs">
                      
                      {/* Top Job/Score bar */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-150">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">Rank #{index + 1}</span>
                            <h4 className="text-sm font-black text-slate-900 leading-tight">{job.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-1">{job.company} • <span className="font-mono text-[11px]">{job.location} ({job.locationModel})</span></p>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <span className={`text-lg font-black tracking-tight ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-indigo-600' : 'text-slate-500'}`}>
                            {score}% Match
                          </span>
                          <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-indigo-500' : 'bg-slate-400'}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Matching / Missing Skill Tags */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1">
                          <span className="text-[10px] text-emerald-800 uppercase font-mono tracking-wider flex items-center gap-1 font-black">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Matching Core Skills ({matchItem.matchingSkills?.length || 0})
                          </span>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {matchItem.matchingSkills && matchItem.matchingSkills.length > 0 ? (
                              matchItem.matchingSkills.map((sk: string, i: number) => (
                                <span key={i} className="bg-emerald-55 bg-opacity-20 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                  {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium italic">No precise skill overlaps detected</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-amber-800 uppercase font-mono tracking-wider flex items-center gap-1 font-black">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            Missing Core Skills ({matchItem.missingSkills?.length || 0})
                          </span>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {matchItem.missingSkills && matchItem.missingSkills.length > 0 ? (
                              matchItem.missingSkills.map((sk: string, i: number) => (
                                <span key={i} className="bg-amber-55 bg-opacity-20 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                  {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium italic">None missing</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* AI Reasons Bullet Explanations */}
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-150">
                        <span className="text-[9.5px] uppercase font-mono tracking-widest text-slate-400 block font-black">AI RECRUITER ASSESSMENT</span>
                        <ul className="space-y-1 text-xs text-slate-700 font-medium">
                          {matchItem.reasons && matchItem.reasons.map((re: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-indigo-500 select-none mt-0.5">•</span>
                              <span className="leading-relaxed">{re}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-96 border border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400 text-sm font-medium p-6 text-center">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse mb-3" />
                <p>No matchmaking report generated yet.</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1.5">Enter candidate details on the left, then click "Evaluate & List Best Matches" to analyze job suitability instantly.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
