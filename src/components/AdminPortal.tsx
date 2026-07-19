import React, { useState, useEffect } from 'react';
import { 
  Users, Building, ShieldCheck, ShieldAlert, BadgeDollarSign, 
  TrendingUp, ArrowRight, BookOpen, Clock, Send, Ban, RefreshCw,
  Mail, Eye, Search, AlertCircle, Sparkles, Receipt
} from 'lucide-react';

interface SentEmailLog {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  hrEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  recipientName: string;
  recipientEmail: string;
  userId: string;
}

interface UserAudit {
  id: string;
  fullName: string;
  email: string;
  role: string;
  plan: string;
  profileCompleted: boolean;
  status: string;
}

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'emails'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real stats & lists fetched from server API
  const [usersAudit, setUsersAudit] = useState<UserAudit[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmailLog[]>([]);
  const [statsSummary, setStatsSummary] = useState({
    totalSeekers: 0,
    totalEmployers: 0,
    totalPro: 0,
    totalEnterprise: 0,
    estimatedMRR: 0
  });

  const [selectedEmail, setSelectedEmail] = useState<SentEmailLog | null>(null);
  const [emailSearch, setEmailSearch] = useState('');

  const [spamListings, setSpamListings] = useState([
    {
      id: "fake-1",
      title: "Work From Home Typing Expert - $500/hr",
      company: "Apex Global Typists",
      hrEmail: "typingspammer99@gmail.com",
      status: "FLAGGED_SPAM",
      reason: "Unreasonable salary indicator, generic non-verified company domain, and spammy text payload keywords.",
      scannedAt: "2026-06-06 14:15"
    },
    {
      id: "fake-2",
      title: "Crypto Assistant & Wallet Validation Associate",
      company: "SecureDefi Ltd",
      hrEmail: "hr@securedefi-verifycrypto.xyz",
      status: "FLAGGED_FRAUD",
      reason: "Phishing terminology. Direct instructions asking to submit test wallet passphrases.",
      scannedAt: "2026-06-05 18:32"
    },
    {
      id: "fake-3",
      title: "Senior AI Architect (Urgent Direct Entry)",
      company: "AlphaTech Recruiting Inc",
      hrEmail: "unverified-recruiter@yahoo.com",
      status: "UNDER_AUDIT",
      reason: "Recruiter registration is missing a company domain association and exhibits bulk posting anomalies.",
      scannedAt: "2026-06-06 19:10"
    }
  ]);

  // Fetch admin telemetry aggregate data
  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('nexgen_job_token');
      if (!token) {
        throw new Error("Authentication session token missing. Please sign in as admin.");
      }

      const res = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      setUsersAudit(data.users || []);
      setSentEmails(data.sentEmails || []);
      setStatsSummary(data.stats || {
        totalSeekers: 0,
        totalEmployers: 0,
        totalPro: 0,
        totalEnterprise: 0,
        estimatedMRR: 0
      });
    } catch (err: any) {
      console.error("Failed to load admin telemetry dashboard:", err);
      setError(err.message || "Could not retrieve admin telemetry information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAction = (id: string, action: 'ban' | 'approve') => {
    setSpamListings(prev => 
      prev.map(item => {
        if (item.id === id) {
          return { ...item, status: action === 'ban' ? 'BLOCKED_FRAUD' : 'APPROVED_PASSED' };
        }
        return item;
      })
    );
  };

  const filteredEmails = sentEmails.filter(email => {
    const term = emailSearch.toLowerCase();
    return (
      email.recipientEmail.toLowerCase().includes(term) ||
      email.recipientName.toLowerCase().includes(term) ||
      email.subject.toLowerCase().includes(term) ||
      email.body.toLowerCase().includes(term) ||
      email.jobTitle.toLowerCase().includes(term)
    );
  });

  const stats = [
    { 
      label: "Active Job Seekers", 
      value: loading ? "..." : (statsSummary.totalSeekers || 3), 
      icon: Users, 
      diff: "Registered candidates in workspace", 
      color: "text-cyan-400 border-cyan-500/10" 
    },
    { 
      label: "Registered Employers", 
      value: loading ? "..." : (statsSummary.totalEmployers || 0), 
      icon: Building, 
      diff: "Talent recruiters & managers", 
      color: "text-purple-400 border-purple-500/10" 
    },
    { 
      label: "Premium Users (Pro)", 
      value: loading ? "..." : (statsSummary.totalPro || 0), 
      icon: ShieldCheck, 
      diff: `Enterprise: ${statsSummary.totalEnterprise || 0}`, 
      color: "text-rose-400 border-rose-500/10" 
    },
    { 
      label: "Dynamic SaaS Revenue", 
      value: loading ? "..." : `₹${statsSummary.estimatedMRR.toLocaleString()}`, 
      icon: BadgeDollarSign, 
      diff: "Calculated from active elite plan upgrades", 
      color: "text-emerald-400 border-emerald-500/10" 
    }
  ];

  return (
    <div id="super-admin-view" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider font-mono">
            AISTUDIO SUPER-ADMIN ENGINE
          </span>
          <h1 className="text-xl font-black text-white tracking-tight">System Moderator Panel</h1>
          <p className="text-xs text-slate-400">Review SaaS operations, inspect transactional email logs with simulated logo, and audit payments.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Tab switches */}
          <div className="bg-slate-900 border border-white/5 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Moderator Overview
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'emails' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Transactional Email Logs</span>
              {sentEmails.length > 0 && (
                <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded-full">
                  {sentEmails.length}
                </span>
              )}
            </button>
          </div>

          <button 
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 text-xs text-slate-300 rounded-xl hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Stream</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-4 rounded-2xl border bg-slate-900/40 ${stat.color} space-y-2`}>
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <Icon className="w-4 h-4 shrink-0 opacity-80" />
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <div className="text-[10px] text-slate-500 font-mono font-semibold">{stat.diff}</div>
            </div>
          );
        })}
      </div>

      {activeTab === 'overview' ? (
        /* Moderator Overview columns */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Flagged AI Spam Checker column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl border border-rose-500/10 bg-rose-500/[0.01]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">AI Real-time Fraud & Spam Alerts</h3>
                    <p className="text-[10px] text-slate-400">Flagged posts on company registry verification & salary filters.</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono uppercase bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-extrabold border border-rose-500/20">
                  Active Scanner
                </span>
              </div>

              <div className="space-y-3">
                {spamListings.map(lst => (
                  <div key={lst.id} className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white">{lst.title}</h4>
                        <p className="text-[10px] text-slate-400">{lst.company} • Contact: <span className="font-mono text-indigo-400">{lst.hrEmail}</span></p>
                      </div>
                      <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded font-black border ${
                        lst.status.includes('SPAM') ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' :
                        lst.status.includes('FRAUD') || lst.status.includes('BLOCKED') ? 'bg-rose-500/10 text-rose-400 border-rose-500/10' :
                        lst.status.includes('PASSED') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                        'bg-indigo-500/10 text-indigo-400 border-indigo-500/10'
                      }`}>
                        {lst.status}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-slate-300 leading-normal bg-slate-950/60 p-2 rounded border border-white/5 font-mono italic">
                      <span className="font-extrabold text-rose-400 uppercase not-italic block text-[9px] tracking-widest mb-0.5">Automated Scan Reason:</span>
                      {lst.reason}
                    </p>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[9px] text-slate-500 font-mono">Discovered: {lst.scannedAt}</span>
                      {lst.status !== 'BLOCKED_FRAUD' && lst.status !== 'APPROVED_PASSED' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAction(lst.id, 'approve')}
                            className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded hover:bg-emerald-500/25 transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(lst.id, 'ban')}
                            className="px-2.5 py-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded hover:bg-rose-500/25 transition-all cursor-pointer"
                          >
                            Ban Recruiter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Users lists audit logs column */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/10 space-y-4">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Registered Accounts List ({loading ? "..." : usersAudit.length})</span>
              </h3>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-6 text-xs text-slate-500">Loading live user list...</div>
                ) : usersAudit.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">No users found.</div>
                ) : (
                  usersAudit.map(usr => (
                    <div key={usr.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex flex-col gap-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white truncate max-w-[120px]">{usr.fullName}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-extrabold ${
                          usr.plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-300' :
                          usr.plan === 'Pro' ? 'bg-cyan-500/10 text-cyan-300' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {usr.plan}
                        </span>
                      </div>

                      <p className="font-mono text-slate-500 truncate text-[10px]">{usr.email}</p>
                      
                      <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-white/5 mt-1 font-mono">
                        <span className="text-slate-400">Role: <strong className="text-indigo-400 font-bold capitalize">{usr.role}</strong></span>
                        <span className="text-emerald-400 font-bold">
                          {usr.status || "Active"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-indigo-950/10 border border-indigo-500/10 rounded-xl space-y-1.5">
                <h4 className="text-[10.5px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Dynamic Stats Log</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Seeker Profiles</span>
                  <span className="font-bold text-white">{statsSummary.totalSeekers} Users</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Employer Seats</span>
                  <span className="font-bold text-white">{statsSummary.totalEmployers} Seats</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Transactional Email Logs Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Email Lists */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>Dispatched Emails Stream</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Onboarding welcomes, OTP dispatches, and premium billing receipts.</p>
                </div>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">
                  {filteredEmails.length} Matches
                </span>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by recipient, subject, text..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              {/* Scrollable list */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-12 text-xs text-slate-500">Loading sent logs...</div>
                ) : filteredEmails.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500">
                    {emailSearch ? "No matches found for your criteria." : "No transactional emails logged yet."}
                  </div>
                ) : (
                  filteredEmails.map(mail => {
                    const isWelcome = mail.jobId === 'system-welcome';
                    const isOTP = mail.subject.includes('verification code');
                    const isInvoice = mail.jobId === 'billing-invoice';

                    return (
                      <button
                        key={mail.id}
                        onClick={() => setSelectedEmail(mail)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                          selectedEmail?.id === mail.id 
                            ? 'bg-indigo-600/15 border-indigo-500/40 text-white' 
                            : 'bg-slate-950/40 border-white/5 hover:bg-white/5 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[8.5px] uppercase font-mono px-1.5 py-0.2 rounded font-black shrink-0 ${
                            isInvoice ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                            isWelcome ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10' :
                            isOTP ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' :
                            'bg-slate-500/10 text-slate-400 border border-white/5'
                          }`}>
                            {isInvoice ? 'Invoice' : isWelcome ? 'Welcome' : isOTP ? 'OTP Security' : 'User Outreach'}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {new Date(mail.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div>
                          <p className="text-[11.5px] font-bold truncate leading-tight">{mail.subject}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            To: <strong className="text-indigo-400 font-bold">{mail.recipientName}</strong> &lt;{mail.recipientEmail}&gt;
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-white/5 mt-0.5 font-mono text-slate-500">
                          <span>Ref: {mail.id.substring(0, 12)}</span>
                          <span className="flex items-center gap-1 text-indigo-400 font-bold group">
                            <span>Open HTML Frame</span>
                            <Eye className="w-3 h-3 group-hover:scale-110 transition-transform" />
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Detailed Email Branded Simulator Viewer */}
          <div className="lg:col-span-7 space-y-4">
            {selectedEmail ? (
              <div className="p-4 rounded-2xl border border-indigo-500/10 bg-slate-900/10 space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-xs font-black text-white">Interactive Email Inspector</h3>
                    <p className="text-[10px] text-slate-400">Verifying proper formatting, CSS variables, and branding layout.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[9px] font-mono bg-slate-950 px-2 py-1 rounded border border-white/5 text-slate-400">
                      ID: {selectedEmail.id}
                    </span>
                  </div>
                </div>

                {/* Sender/Recipient fields */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 text-slate-500">From:</span>
                    <span className="col-span-10 text-slate-300 font-bold">Brainy Career Ecosystem &lt;support@brainycareer.com&gt;</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 text-slate-500">To:</span>
                    <span className="col-span-10 text-indigo-400 font-black">
                      "{selectedEmail.recipientName}" &lt;{selectedEmail.recipientEmail}&gt;
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 text-slate-500">Subject:</span>
                    <span className="col-span-10 text-emerald-400 font-bold">{selectedEmail.subject}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 text-slate-500">Date:</span>
                    <span className="col-span-10 text-slate-400">{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Simulated Device Frame showing exactly what the user receives */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Live Branded HTML Simulation Frame (Rendered with logo)</span>
                  </span>

                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950 relative">
                    {/* Simulated browser header bar */}
                    <div className="bg-slate-900 border-b border-white/5 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                        <span className="text-[10px] text-slate-500 font-mono ml-2">https://mail.google.com/mail/u/0/inbox/</span>
                      </div>
                    </div>

                    {/* Styled HTML Body Rendered inside the dashboard */}
                    <div className="max-h-[460px] overflow-y-auto bg-[#F8FAFC] p-6 text-slate-800">
                      
                      {/* Unified Branded Template wrapper */}
                      <div className="max-w-[500px] mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-left">
                        
                        {/* Branded Header Banner */}
                        <div className="bg-gradient-to-tr from-[#0F172A] to-[#1E293B] p-6 text-center border-b-3 border-[#4F46E5]">
                          {/* Beautiful simulated SVG / logo badge inside HTML */}
                          <div className="inline-block bg-[#4F46E5] text-white font-black text-sm tracking-tighter px-3.5 py-1.5 rounded-lg mb-2 shadow-sm font-mono">
                            BC
                          </div>
                          <h1 className="text-white text-base font-black tracking-tight m-0">Brainy Career</h1>
                          <p className="text-[#94A3B8] text-[9.5px] uppercase tracking-widest m-0.5 font-bold">AI-Powered Talent Matching Ecosystem</p>
                        </div>

                        {/* Content area */}
                        <div className="p-6 text-xs text-[#334155] leading-relaxed">
                          
                          {/* Welcome Onboarding template */}
                          {selectedEmail.jobId === 'system-welcome' && (
                            <div>
                              <h2 className="text-sm font-bold text-[#0F172A] mb-3">
                                Welcome to the Future of Talent Acquisition, {selectedEmail.recipientName}!
                              </h2>
                              <p className="mb-4 text-[#475569]">
                                We are absolutely thrilled to welcome you to <strong>Brainy Career</strong>. Your account has been successfully created and secured on our unified matching portal.
                              </p>
                              
                              <div className="border-l-4 border-[#10B981] bg-[#F0FDF4] p-3 rounded-r-xl mb-4">
                                <strong className="text-[#065F46] block text-[11px] uppercase tracking-wider font-extrabold mb-0.5">✓ Account Registration Verified</strong>
                                <span className="text-[#047857] text-[10.5px]">
                                  Verified email: <strong>{selectedEmail.recipientEmail}</strong>
                                </span>
                              </div>

                              <p className="mb-2">Here is what you can accomplish on your dashboard right now:</p>
                              <ul className="space-y-1.5 pl-4 list-none text-[#475569] mb-4">
                                <li className="relative pl-4 before:content-['✦'] before:text-[#4F46E5] before:absolute before:left-0">
                                  <strong>AI Resume & Profile Analyzer:</strong> Submit your career background or job description text to parse core competencies automatically.
                                </li>
                                <li className="relative pl-4 before:content-['✦'] before:text-[#4F46E5] before:absolute before:left-0">
                                  <strong>Semantic Profile Matcher:</strong> Instantly map your qualifications against open vacancies in our database with precise match percentage scores.
                                </li>
                                <li className="relative pl-4 before:content-['✦'] before:text-[#4F46E5] before:absolute before:left-0">
                                  <strong>Real-Time Team Messaging:</strong> Chat directly with potential talent or hiring managers with zero intermediate agency delay.
                                </li>
                              </ul>

                              <div className="text-center my-5">
                                <span className="inline-block bg-[#4F46E5] text-white font-extrabold text-[11px] px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90">
                                  Access Your Portal Workspace
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 mt-4 italic">
                                If you did not register for this account, please ignore this email or contact support to report unauthorized actions.
                              </p>
                            </div>
                          )}

                          {/* OTP Verification code template */}
                          {selectedEmail.subject.includes('verification code') && (
                            <div>
                              <h2 className="text-sm font-bold text-[#0F172A] mb-3">Verify Your Account Identity</h2>
                              <p className="mb-4 text-[#475569]">
                                We received a request to verify your email address on <strong>Brainy Career</strong>. Please use the secure, one-time passcode (OTP) below to authenticate your action:
                              </p>
                              
                              <div className="text-center my-6">
                                <div className="inline-block bg-[#F1F5F9] border-2 border-dashed border-[#4F46E5] rounded-xl px-8 py-3">
                                  <span className="font-mono text-2xl font-black text-[#4F46E5] tracking-widest">
                                    {selectedEmail.subject.match(/\d{6}/)?.[0] || "######"}
                                  </span>
                                </div>
                              </div>

                              <div className="border-l-4 border-blue-500 bg-blue-50/50 p-3 rounded-r-xl mb-4">
                                <strong className="text-blue-900 block text-[11px] uppercase tracking-wider font-extrabold mb-0.5">🔒 Security Advisory</strong>
                                <p className="text-blue-800 text-[10.5px] m-0">
                                  This code is valid for exactly <strong>10 minutes</strong> and can only be used once. Never share this passcode with anyone.
                                </p>
                              </div>

                              <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 mt-4">
                                If you did not initiate this identity check, please disregard this email or update your password if you suspect unauthorized activity.
                              </p>
                            </div>
                          )}

                          {/* Premium Invoice upgraded template */}
                          {selectedEmail.jobId === 'billing-invoice' && (
                            <div>
                              <h2 className="text-sm font-bold text-[#4F46E5] mb-2">Congratulations, Your Workspace is Now Elite!</h2>
                              <p className="mb-4 text-[#475569]">
                                Hi {selectedEmail.recipientName}, your payment has successfully cleared. Your account has been instantly upgraded to the premium subscription benefits:
                              </p>

                              <div className="border-l-4 border-[#10B981] bg-[#F0FDF4] p-3 rounded-r-xl mb-4">
                                <strong className="text-[#065F46] block text-[11px] uppercase tracking-wider font-extrabold mb-0.5">⚡ SUBSCRIPTION ACTIVE - ALL PREMIUM TOOLS UNLOCKED</strong>
                                <p className="text-[#047857] text-[10.5px] m-0">
                                  Enjoy unlimited AI matching scans, full recruiter outreach pipelines, and advanced ATS optimization checkers.
                                </p>
                              </div>

                              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 mt-4">Transaction Receipt Details</h3>
                              
                              {/* Parse invoice fields */}
                              <div className="border-t border-slate-200 py-1.5 space-y-1.5">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-500">Invoice Ref / Order ID:</span>
                                  <span className="font-mono font-bold text-[#0F172A]">
                                    {selectedEmail.body.match(/Order ID:\s*([^\n]+)/)?.[1] || "BC-ORDER-SUCCESS"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-500">Subscription Tier:</span>
                                  <span className="font-bold text-[#4F46E5]">
                                    {selectedEmail.body.match(/Subscription Tier:\s*([^\n]+)/)?.[1] || "Gold Pro Elite"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-500">Settlement Amount:</span>
                                  <span className="font-bold text-slate-900 text-xs">
                                    {selectedEmail.body.match(/Settlement Amount:\s*([^\n]+)/)?.[1] || "₹1,499.00"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-500">Gateway Clearing Handle:</span>
                                  <span className="font-mono text-emerald-600 font-bold">
                                    {selectedEmail.body.match(/Customer VPA Handle:\s*([^\n]+)/)?.[1] || "payee@upi"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-500">Clearing Status:</span>
                                  <span className="text-emerald-600 font-black">SUCCESSFUL / SETTLED</span>
                                </div>
                              </div>

                              <div className="text-center my-5">
                                <span className="inline-block bg-[#4F46E5] text-white font-extrabold text-[11px] px-5 py-2.5 rounded-lg shadow-sm">
                                  Explore Elite Superpowers
                                </span>
                              </div>

                              <p className="text-[10.5px] text-slate-400 border-t border-slate-100 pt-3 mt-4 text-center">
                                For billing questions, contact <a href="mailto:accounts@brainycareer.com" className="text-indigo-600 underline">accounts@brainycareer.com</a>
                              </p>
                            </div>
                          )}

                          {/* Seeker / Employer user-outreach template */}
                          {selectedEmail.jobId !== 'billing-invoice' && selectedEmail.jobId !== 'system-welcome' && !selectedEmail.subject.includes('verification code') && (
                            <div>
                              <h2 className="text-sm font-bold text-[#0F172A] mb-3">Outreach Notification from Brainy Career</h2>
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 whitespace-pre-wrap font-sans text-[#334155]">
                                {selectedEmail.body}
                              </div>
                              
                              <p className="text-[11px] text-slate-500">
                                This message was triggered regarding job: <strong>{selectedEmail.jobTitle}</strong> at <strong>{selectedEmail.company}</strong>.
                              </p>
                            </div>
                          )}

                        </div>

                        {/* Branded Footer */}
                        <div className="bg-[#1E293B] p-5 text-center text-[10px] text-[#94A3B8] border-t border-[#334155]">
                          <p className="m-0 mb-1">© 2026 Brainy Career Inc. All rights reserved.</p>
                          <p className="m-0">You received this transactional system notification regarding your active account.</p>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>

                {/* Plain text block */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono block">Raw Plaintext Body (SMTP fallback)</span>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 whitespace-pre-wrap max-h-[140px] overflow-y-auto">
                    {selectedEmail.body}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-[460px] rounded-2xl border border-dashed border-white/10 bg-slate-950/20 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Mail className="w-10 h-10 text-slate-600 mb-2 animate-bounce-slow" />
                <h4 className="text-xs font-bold text-slate-400">No Email Selected</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1">Select any dispatched email transaction from the list on the left to inspect its HTML template formatting, branding, and inline styling components.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
