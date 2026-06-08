import React, { useState } from 'react';
import { 
  Building, Plus, Users, Sparkles, AlertCircle, FileText, CheckCircle2, 
  Trash2, Award, Zap, ThumbsUp, ThumbsDown, Check, Star, Play 
} from 'lucide-react';
import { Job, User } from '../types';

interface EmployerPortalProps {
  jobs: Job[];
  onAddJob: (newJob: Job) => void;
  registeredUsers: User[];
  currentPlan: 'Free' | 'Pro' | 'Enterprise';
}

export default function EmployerPortal({ jobs = [], onAddJob, registeredUsers = [], currentPlan }: EmployerPortalProps) {
  const [showRegModal, setShowRegModal] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    name: "Brainy Career Corp",
    logoURL: "",
    website: "www.brainycareer.com",
    industry: "Artificial Intelligence",
    size: "11-50 employees",
    hq: "San Francisco, CA",
    verified: true
  });

  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState(companyProfile.name);
  const [newLocation, setNewLocation] = useState('');
  const [newModel, setNewModel] = useState<'Remote' | 'Hybrid' | 'Onsite'>('Remote');
  const [newSalary, setNewSalary] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReqs, setNewReqs] = useState('');
  const [newTags, setNewTags] = useState('');

  // Local Recruiter Job Listing list
  const [listings, setListings] = useState<Job[]>([
    {
      id: "recruit-1",
      title: "Senior Full Stack Dev (Node & React)",
      company: companyProfile.name,
      logo: "BC",
      description: "Looking for an expert to design custom API gateways, handle state persistent integrations, and construct high-fidelity UI web screens.",
      requirements: ["React 18+", "Node.js", "Express", "TypeScript", "PostgreSQL"],
      responsibilities: ["Develop robust UI layouts", "Optimize server load limits", "Bridge database persistence connectors"],
      location: "San Francisco, CA",
      locationModel: "Remote",
      salaryRange: "$140,000 - $185,000",
      postedDate: "2026-06-06",
      tags: ["React", "TypeScript", "Node.js"],
      originalUrl: "https://www.brainycareer.com/careers"
    }
  ]);

  // Simulated List of active applicants for recruitment screening
  const [applicants, setApplicants] = useState([
    {
      id: "app-101",
      fullName: "Gaurav Upreti",
      skills: ["React", "TypeScript", "Node.js", "Express", "Supabase", "Git"],
      atsScore: 92,
      culturalFit: 88,
      experienceLevel: "Senior",
      suitability: "Highly Suitable",
      strength: "Exceptional modern full-stack engineering proficiency and database design expertise.",
      gap: "Familiarity with Kubernetes cloud clustering architectures.",
      status: "SHORTLISTED",
      resumeFileName: "Upreti_Resume_2026.pdf"
    },
    {
      id: "app-102",
      fullName: "Liam Neeson",
      skills: ["React", "CSS", "HTML", "WordPress"],
      atsScore: 48,
      culturalFit: 55,
      experienceLevel: "Entry",
      suitability: "Unfit for Role",
      strength: "Strong basic web layout structuring skills.",
      gap: "Missing backend Node, API development, and TypeScript type constraints experience.",
      status: "FLAGGED_REJECT",
      resumeFileName: "Liam_Resume_Draft.txt"
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
      status: "UNDER_REVIEW",
      resumeFileName: "Emily_CV_2026.docx"
    }
  ]);

  const [activeTab, setActiveTab] = useState<'listings' | 'applicants' | 'interview_assistant'>('applicants');
  const [selectedApplicant, setSelectedApplicant] = useState<any>(applicants[0]);
  const [jobForQuestions, setJobForQuestions] = useState<string>("recruit-1");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([
    "Explain your strategy to protect an Express database route against deep connection pools leaks.",
    "Describe a time you solved an infinite re-render loop inside a complex React system.",
    "How would you integrate real-time collaborative state persistence without breaking local caches?"
  ]);

  const triggerAddListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLocation || !newSalary) {
      alert("Please fill necessary job criteria.");
      return;
    }

    const createdJob: Job = {
      id: `list-${Date.now()}`,
      title: newTitle,
      company: companyProfile.name,
      logo: companyProfile.name.substring(0, 2).toUpperCase(),
      description: newDesc || "AI-optimized developer opening.",
      requirements: newReqs ? newReqs.split(",").map(r => r.trim()) : ["Software Engineering", "Agile Core"],
      responsibilities: ["Lead engineering milestones", "Develop secure API features"],
      location: newLocation,
      locationModel: newModel,
      salaryRange: newSalary,
      postedDate: new Date().toISOString().split('T')[0],
      tags: newTags ? newTags.split(",").map(t => t.trim()) : ["Developer"],
      originalUrl: "https://www.brainycareer.com/careers"
    };

    onAddJob(createdJob);
    setListings(prev => [createdJob, ...prev]);
    setActiveTab('listings');

    // Reset fields
    setNewTitle('');
    setNewLocation('');
    setNewSalary('');
    setNewDesc('');
    setNewReqs('');
    setNewTags('');
  };

  const handleApplicantStatus = (id: string, newStats: 'SHORTLISTED' | 'FLAGGED_REJECT') => {
    setApplicants(prev => 
      prev.map(app => {
        if (app.id === id) {
          const updated = { ...app, status: newStats };
          if (selectedApplicant?.id === id) {
            setSelectedApplicant(updated);
          }
          return updated;
        }
        return app;
      })
    );
  };

  const generateAIQuestions = () => {
    const selectedJob = listings.find(l => l.id === jobForQuestions) || listings[0];
    const baseReqs = selectedJob ? selectedJob.requirements : ["React", "TypeScript"];
    
    // Simulates an AI structured prompt output
    setGeneratedQuestions([
      `Based on requirements for ${selectedJob?.title || 'Engineer'}: Describe your practical experience managing ${baseReqs[0] || 'clean layouts'} in production environments.`,
      `How do you handle error propagation in asynchronous requests combining ${baseReqs[1] || 'Node API'} integrations?`,
      `Explain your system testing strategies for performance benchmarks before pushing pipelines to Cloud environments.`,
      "Walk us through your workflow when resolving merge conflicts on critical deployment branches."
    ]);
  };

  return (
    <div id="employer-portal-view" className="space-y-6 font-sans">
      
      {/* Recruiter Header and Certified status info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-900/40 rounded-3xl border border-white/5 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10 text-white font-black text-lg">
            {companyProfile.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-white">{companyProfile.name}</h2>
              {companyProfile.verified && (
                <span className="text-[9px] uppercase font-extrabold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded border border-emerald-500/20 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-emerald-400" />
                  Verified Employer
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">{companyProfile.hq} • <a href={`http://${companyProfile.website}`} className="text-cyan-400 hover:underline font-mono">{companyProfile.website}</a></p>
          </div>
        </div>

        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 text-[10px] font-bold">
          <button 
            onClick={() => setActiveTab('applicants')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'applicants' ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'}`}
          >
            AI Candidate Matcher ({applicants.length})
          </button>
          <button 
            onClick={() => setActiveTab('listings')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'listings' ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'}`}
          >
            Job Postings Builder
          </button>
          <button 
            onClick={() => setActiveTab('interview_assistant')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'interview_assistant' ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'}`}
          >
            AI Recruiter Assistant
          </button>
        </div>
      </div>

      {activeTab === 'applicants' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Incoming Candidate ranking list */}
          <div className="lg:col-span-1 border border-white/5 rounded-2xl p-4 bg-slate-900/10 space-y-3.5">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Candidate Ranker & Screening</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">AI automatically screens and ranks applicants by skill-coverage, fit %, and professional score.</p>
            </div>

            <div className="space-y-2">
              {applicants.map(app => {
                const isSelected = selectedApplicant?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApplicant(app)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
                        : 'border-white/5 bg-slate-950/40 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight">{app.fullName}</span>
                        <span className="text-[10.5px] text-slate-400 font-mono mt-1">{app.experienceLevel} Candidate</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-cyan-400 block font-mono">{app.atsScore}% FIT</span>
                        <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">ATS MATCH</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {app.skills.slice(0, 3).map((sk, idx) => (
                        <span key={idx} className="bg-white/5 text-[9px] text-slate-300 px-1.5 py-0.2 rounded leading-none">
                          {sk}
                        </span>
                      ))}
                      {app.skills.length > 3 && (
                        <span className="text-[9px] text-slate-500 font-mono">+{app.skills.length - 3}</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-2 border-t border-white/5 mt-2.5 font-mono">
                      <span className="text-slate-500">Docs: {app.resumeFileName}</span>
                      <span className={`font-bold ${
                        app.status === 'SHORTLISTED' ? 'text-emerald-400' :
                        app.status === 'FLAGGED_REJECT' ? 'text-rose-400' :
                        'text-indigo-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Screening candidate details overview */}
          <div className="lg:col-span-2 border border-white/5 rounded-2xl p-5 bg-slate-900/10 space-y-5">
            {selectedApplicant ? (
              <div className="space-y-5">
                
                {/* Score indicators */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-950/40 border border-white/5 rounded-2xl gap-4">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-widest font-mono">CANDIDATE SUITABILITY AUDIT</span>
                    <h3 className="text-lg font-black text-white">{selectedApplicant.fullName}</h3>
                    <p className="text-xs text-slate-400">Reviewing application documents: <span className="underline text-indigo-300 pointer-events-none">{selectedApplicant.resumeFileName}</span></p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="text-center p-2 px-3.5 bg-cyan-950/20 border border-cyan-500/20 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">ATS Alignment</span>
                      <span className="text-xl font-black text-cyan-400 block tracking-tight">{selectedApplicant.atsScore}%</span>
                    </div>
                    <div className="text-center p-2 px-3.5 bg-purple-950/20 border border-purple-500/20 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">Cultural Fit</span>
                      <span className="text-xl font-black text-purple-400 block tracking-tight">{selectedApplicant.culturalFit}%</span>
                    </div>
                  </div>
                </div>

                {/* Suitability flags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">AI Recommended Profile Strength</span>
                    <p className="text-[11.5px] text-slate-200 leading-normal">{selectedApplicant.strength}</p>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">AI Identified Skill Gaps</span>
                    <p className="text-[11.5px] text-slate-200 leading-normal">{selectedApplicant.gap}</p>
                  </div>
                </div>

                {/* Candidate Skill Coverage tags list */}
                <div>
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Candidate Skills Coverage Checklist</h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedApplicant.skills.map((sk: string, index: number) => (
                      <span key={index} className="bg-cyan-500/5 text-cyan-300 border border-cyan-500/10 text-[10.5px] font-mono px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-cyan-400 font-bold" />
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Trigger actions */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs font-bold">
                  <div>
                    <span className="text-slate-500 mr-2">Status Audit:</span>
                    <span className={`px-2.5 py-1 rounded font-mono uppercase text-[10px] border ${
                      selectedApplicant.status === 'SHORTLISTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      selectedApplicant.status === 'FLAGGED_REJECT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-indigo-505/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {selectedApplicant.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApplicantStatus(selectedApplicant.id, 'FLAGGED_REJECT')}
                      disabled={selectedApplicant.status === 'FLAGGED_REJECT'}
                      className={`px-3.5 py-2 font-bold text-rose-400 rounded-xl border border-rose-500/10 flex items-center gap-1 hover:bg-rose-500/10 transition-all cursor-pointer ${
                        selectedApplicant.status === 'FLAGGED_REJECT' ? 'opacity-50 cursor-default hover:bg-transparent' : ''
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Reject Applicant
                    </button>
                    <button 
                      onClick={() => handleApplicantStatus(selectedApplicant.id, 'SHORTLISTED')}
                      disabled={selectedApplicant.status === 'SHORTLISTED'}
                      className={`px-3.5 py-2 font-bold text-slate-950 bg-cyan-400 rounded-xl flex items-center gap-1 hover:bg-cyan-300 transition-all cursor-pointer ${
                        selectedApplicant.status === 'SHORTLISTED' ? 'opacity-50 cursor-default hover:bg-cyan-400' : ''
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5 fill-slate-950" />
                      Shortlist Candidate
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center justify-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-600 animate-bounce" />
                <span className="text-xs">No active applicant selected. Click on a candidate card on the left panel to trigger screening checks.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'listings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Job builder creation form */}
          <div className="lg:col-span-1 border border-white/5 rounded-2xl p-5 bg-slate-900/10 h-fit space-y-4">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Publish Open Vacancy</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Define your target prerequisites to let the AI screen inbound applicants.</p>
            </div>

            <form onSubmit={triggerAddListing} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Job Vacancy Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior AI Research Engineer"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Location City</label>
                  <input 
                    type="text" 
                    value={newLocation} 
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="e.g. San Jose, CA"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Salary Range Offering</label>
                  <input 
                    type="text" 
                    value={newSalary} 
                    onChange={e => setNewSalary(e.target.value)}
                    placeholder="e.g. $130,000 - $160,000"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Location Model</label>
                <select 
                  value={newModel} 
                  onChange={e => setNewModel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Role Requirements (Comma separated)</label>
                <input 
                  type="text" 
                  value={newReqs} 
                  onChange={e => setNewReqs(e.target.value)}
                  placeholder="React 19, TypeScript, Express, database design"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Job Description Outline</label>
                <textarea 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Provide immediate duties, team structures, and performance benchmarks for potential hires..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all resize-none" 
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-cyan-400 text-slate-950 text-xs font-black py-2.5 rounded-xl hover:bg-cyan-300 transition-all cursor-pointer flex items-center justify-center gap-1 mt-2.5"
              >
                <Plus className="w-4 h-4 text-slate-950 font-bold" />
                Publish to Global Board
              </button>
            </form>
          </div>

          {/* Active Job Posting overview lists */}
          <div className="lg:col-span-2 border border-white/5 rounded-2xl p-5 bg-slate-900/10 space-y-4">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Active Published Vacancies ({listings.length})</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Review active listed vacancies published globally.</p>
            </div>

            <div className="space-y-3">
              {listings.map(lst => (
                <div key={lst.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">{lst.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{lst.company} • {lst.location} ({lst.locationModel})</p>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-500/10">
                      {lst.salaryRange}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 italic">&ldquo;{lst.description}&rdquo;</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {lst.requirements.map((req, i) => (
                      <span key={i} className="bg-white/5 text-[9px] text-slate-300 px-2 py-0.5 rounded">
                        {req}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-2 border-t border-white/5">
                    <span>Published On: {lst.postedDate}</span>
                    <span>Direct Apply Route: Verified Corp Link</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'interview_assistant' && (
        <div className="border border-white/5 bg-slate-900/10 rounded-2xl p-5 space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider font-mono">
                AI RECRUITER ASSISTANT
              </span>
              <h3 className="text-sm font-black text-white">Automated Candidate Question Generators</h3>
              <p className="text-xs text-slate-400">Generate targeted interview pre-screens and custom evaluation checklists.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold font-mono">Target Job:</span>
              <select 
                value={jobForQuestions}
                onChange={e => setJobForQuestions(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {listings.map(lst => (
                  <option key={lst.id} value={lst.id}>{lst.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                  <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Configure Questionnaire</span>
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">AI analyzes standard criteria tags and outputs 3 to 4 technical, situational, or behavioral assessment check questions.</p>
                <button
                  onClick={generateAIQuestions}
                  className="w-full bg-cyan-400 text-slate-950 text-xs font-black py-2 rounded-lg hover:bg-cyan-300 transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  Generate AI Questions
                </button>
              </div>

              <div className="bg-indigo-950/10 border border-indigo-500/15 p-4 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider block font-mono">Employer Pro Advisory</span>
                <p className="text-[10px] text-slate-300 leading-normal italic">Recommend screening questions are synced with applicant pipelines. Candidates can perform responses voice evaluations when selected.</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3.5">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest font-mono">AI Generated Assessment Checklist</span>
              
              <div className="space-y-2 text-xs">
                {generatedQuestions.map((q, i) => (
                  <div key={i} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-cyan-400/10 text-cyan-300 flex items-center justify-center font-mono font-extrabold shrink-0 border border-cyan-500/10">
                      {i + 1}
                    </span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed font-sans">{q}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
