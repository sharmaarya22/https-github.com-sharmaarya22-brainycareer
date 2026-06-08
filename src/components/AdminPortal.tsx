import React, { useState } from 'react';
import { 
  Users, Building, ShieldCheck, ShieldAlert, BadgeDollarSign, 
  TrendingUp, ArrowRight, BookOpen, Clock, Send, Ban, RefreshCw 
} from 'lucide-react';

export default function AdminPortal() {
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

  const [usersAudit, setUsersAudit] = useState([
    { id: "usr-401", name: "Sarah Connor", email: "sarah.connor@cyberdyne.io", role: "Job Seeker", status: "Active", plan: "Pro" },
    { id: "usr-802", name: "David Miller", email: "david.miller@recruithero.net", role: "Employer", status: "Active", plan: "Enterprise" },
    { id: "usr-109", name: "James Vance", email: "vance929@scammermail.ru", role: "Job Seeker", status: "FL_SUSPICIOUS", plan: "Free" }
  ]);

  const stats = [
    { label: "Active Job Seekers", value: "3,482", icon: Users, diff: "+12.4% this mo", color: "text-cyan-400 border-cyan-500/10" },
    { label: "Registered Employers", value: "829", icon: Building, diff: "+6.8% this week", color: "text-purple-400 border-purple-500/10" },
    { label: "AI Fraud Checks Blocked", value: "142", icon: ShieldAlert, diff: "99.8% precision rate", color: "text-rose-400 border-rose-500/10" },
    { label: "Monthly Recurring Revenue", value: "$42,910", icon: BadgeDollarSign, diff: "+22% QoQ growth", color: "text-emerald-400 border-emerald-500/10" }
  ];

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

  return (
    <div id="super-admin-view" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider font-mono">
            AISTUDIO SUPER-ADMIN ENGINE
          </span>
          <h1 className="text-xl font-black text-white tracking-tight">System Moderator Panel</h1>
          <p className="text-xs text-slate-400">Review SaaS operations audit logs, payment channels, and run automated AI moderate policies.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 text-xs text-slate-300 rounded-xl hover:bg-white/10 transition-all">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
            <span>Recalculate AI Weights</span>
          </button>
        </div>
      </div>

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

      {/* Main Admin Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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
              <span>Registered Accounts List</span>
            </h3>

            <div className="space-y-2.5">
              {usersAudit.map(usr => (
                <div key={usr.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{usr.name}</span>
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
                    <span className="text-slate-400">Role: <strong className="text-indigo-400 font-bold">{usr.role}</strong></span>
                    <span className={`${usr.status.includes('Active') ? 'text-emerald-400' : 'text-orange-400 font-bold'}`}>
                      {usr.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-950/10 border border-indigo-500/10 rounded-xl space-y-1.5">
              <h4 className="text-[10.5px] font-bold text-indigo-400 uppercase tracking-widest font-mono">SaaS Revenue Log</h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Pro Users</span>
                <span className="font-bold text-white">482 Users</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Recruiter Seats</span>
                <span className="font-bold text-white">109 Seats</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
