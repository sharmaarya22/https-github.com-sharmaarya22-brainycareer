import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, AlertCircle, ChevronRight, Smartphone, Mail, Lock, 
  User, UserPlus, CheckCircle, X, ArrowRight, Laptop,
  Activity, Award, Search, FileText, Check, Zap, 
  MessageSquare, Briefcase, GraduationCap, MapPin, 
  DollarSign, CheckCircle2, Shield, Settings, HelpCircle, FileCheck
} from 'lucide-react';

interface AuthInterfaceProps {
  onAuthSuccess: (user: any, token: string) => void;
}

export default function AuthInterface({ onAuthSuccess }: AuthInterfaceProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Registration and Login Form states
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'employer'>('seeker');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick Action triggers from Hero / Features
  const handleHeroAction = (role: 'seeker' | 'employer') => {
    setSelectedRole(role);
    setIsLogin(false);
    setShowAuthModal(true);
  };

  const handleOpenLogin = () => {
    setIsLogin(true);
    setShowAuthModal(true);
  };

  const handleOpenGetStarted = () => {
    setIsLogin(false);
    setShowAuthModal(true);
  };

  // Submit flow handling direct password-based logins and registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: cleanEmail, password } 
      : { 
          fullName: fullName.trim(), 
          email: cleanEmail, 
          password, 
          role: selectedRole 
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Authentication check declined.');
      }

      setShowAuthModal(false);
      onAuthSuccess(resData.user, resData.token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // One-click credential fillers
  const fillCredentials = (type: 'admin' | 'seeker' | 'employer') => {
    setIsLogin(true);
    if (type === 'admin') {
      setEmail('gaurav');
      setPassword('123456');
    } else if (type === 'seeker') {
      setEmail('upretigaurav@gmail.com');
      setPassword('123456');
    } else if (type === 'employer') {
      setEmail('employer@brainycareer.com');
      setPassword('123456');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased relative selection:bg-indigo-100 overflow-x-hidden">
      
      {/* Background ambient soft blur objects representing premium minimalist styling */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/70 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[-200px] w-[500px] h-[500px] bg-blue-50/60 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full bg-[#F8FAFC]/80 backdrop-blur-md border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F172A] to-[#1E293B] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm">
            BC
          </div>
          <span className="text-lg font-black tracking-tight text-[#0F172A]">
            Brainy<span className="text-[#2563EB]">Career.com</span>
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <a href="#hero" className="hover:text-indigo-600 transition-colors">Home</a>
          <a href="#features" className="hover:text-indigo-600 transition-colors">For Job Seekers</a>
          <a href="#employers" className="hover:text-indigo-600 transition-colors">For Employers</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenLogin}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={handleOpenGetStarted}
            className="px-4 py-2 text-xs font-extrabold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-xl shadow-md transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Headline & CTAs */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-150 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="text-[10px] font-extrabold text-[#2563EB] tracking-wider uppercase font-mono">
              Next-Gen AI Career Operating System
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
            Find the Right Job <br />
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Without Searching
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-650 leading-relaxed font-medium max-w-xl">
            Upload your resume. Our AI analyzes your experience, builds your profile, finds the best jobs worldwide, calculates ATS score, identifies missing skills, creates personalized cover letters, and guides your career path.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => handleHeroAction('seeker')}
              className="px-6 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-200 transition-all cursor-pointer flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-white" />
              Upload Resume
            </button>
            <button
              onClick={() => handleHeroAction('employer')}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-[#2563EB]" />
              Hire Talent
            </button>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg text-xs">
            <div>
              <p className="font-mono text-xl font-black text-[#0F172A]">Instant</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">ATS Breakdown</p>
            </div>
            <div>
              <p className="font-mono text-xl font-black text-[#0F172A]">Unified</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Redirection Link</p>
            </div>
            <div>
              <p className="font-mono text-xl font-black text-[#0F172A]">Zero</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Manual Forms</p>
            </div>
          </div>
        </div>

        {/* Right Dashboard Mockup */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-[#2563EB]/5 rounded-3xl blur-2xl -z-10" />
          
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-2xl space-y-5 select-none pointer-events-none">
            {/* Top Mock bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div className="w-3 h-3 bg-emerald-400 rounded-full" />
              </div>
              <span className="text-[10px] bg-slate-100 font-mono text-slate-500 font-bold px-2 py-0.5 rounded-full">
                AI MATCHMAKER ACTIVE
              </span>
            </div>

            {/* Resume Uploaded block */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-700">Alex_Mercer_Resume.pdf</span>
                <span className="text-emerald-600 font-black flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Parsed
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full w-full" />
              </div>
            </div>

            {/* Match block */}
            <div className="space-y-3.5 pt-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-[#0F172A] leading-tight">Senior Staff Engineer</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Stripe • Remote, USA</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 font-black text-xs px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> 98% Match
                </div>
              </div>

              {/* Skills and ATS score mock dials */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">ATS Score</span>
                  <span className="text-[#0F172A] font-black block text-sm">82% (Excellent)</span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Missing Skills</span>
                  <span className="text-rose-500 font-bold block text-[10px]">Kubernetes, AWS</span>
                </div>
              </div>
            </div>

            {/* Cover letter generator preview */}
            <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl">
              <span className="text-[9px] font-bold text-[#2563EB] block uppercase mb-1">Tailored Cover Letter</span>
              <p className="text-[9.5px] italic text-slate-500 leading-normal">
                "Based on Alex's experience leading backend migrations, I highly recommend him for Stripe's API team..."
              </p>
            </div>
          </div>

          {/* Extra floating badge */}
          <div className="absolute -bottom-4 -left-4 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 font-mono text-[10px] font-black text-slate-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span>5,230 Live Jobs Matched Today</span>
          </div>
        </div>

      </section>

      {/* TRUSTED BY COMPANIES SECTION */}
      <section className="bg-white border-y border-slate-200/80 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <p className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-slate-400">
            Trusted by candidates, employers & global teams
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-sans font-black text-xl tracking-tighter text-[#0F172A]">NOTION</span>
            <span className="font-sans font-black text-xl tracking-tight text-[#0F172A]">stripe</span>
            <span className="font-serif font-bold text-xl tracking-wide text-[#0F172A]">L I N E A R</span>
            <span className="font-sans font-black text-xl tracking-wider text-[#0F172A]">Apple</span>
            <span className="font-serif font-black text-xl text-[#0F172A]">ChatGPT</span>
            <span className="font-mono font-bold text-xl text-[#0F172A]">Airbnb</span>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 space-y-16">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full font-mono">
            Full Autonomous Toolkit
          </span>
          <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
            Not Your Average Job Board
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            We built a complete AI Career Operating System designed to replace manual search, guesswork, and repetitive application creation.
          </p>
        </div>

        {/* Feature Cards Grid (10 Features strictly matching prompt) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[
            {
              title: "AI Resume Analysis",
              desc: "Deep structure evaluation generating summaries, technical lists, soft talents, and career weaknesses.",
              icon: FileText,
              color: "text-blue-600 bg-blue-50 border-blue-100"
            },
            {
              title: "ATS Score Calculation",
              desc: "Get an instant ATS match percentage. Discover formatting flaws and critical missing keywords.",
              icon: Activity,
              color: "text-emerald-600 bg-emerald-50 border-emerald-100"
            },
            {
              title: "Profile Builder",
              desc: "Upload once and let the AI extract experience, certificates, projects, and education on-the-fly.",
              icon: User,
              color: "text-indigo-600 bg-indigo-50 border-indigo-150"
            },
            {
              title: "Smart Job Matching",
              desc: "Searches public pages and licensed feeds worldwide to return matching vacancies sorted by match score.",
              icon: Search,
              color: "text-violet-600 bg-violet-50 border-violet-100"
            },
            {
              title: "Skill Gap Analysis",
              desc: "Compare resume competencies directly against vacancy needs. Uncover estimated study times.",
              icon: Zap,
              color: "text-amber-600 bg-amber-50 border-amber-100"
            },
            {
              title: "Career Roadmap",
              desc: "Get timeline paths mapping progression, required skills, and average salary targets.",
              icon: ChevronRight,
              color: "text-[#2563EB] bg-blue-50/70 border-blue-100"
            },
            {
              title: "Cover Letter Generator",
              desc: "Instant professional custom cover letters written on the fly matching the target role.",
              icon: Sparkles,
              color: "text-teal-600 bg-teal-50 border-teal-100"
            },
            {
              title: "Resume Improvement",
              desc: "AI identifies buzzword traps and grammar issues, then compiles an optimized, clean resume text.",
              icon: Award,
              color: "text-purple-600 bg-purple-50 border-purple-100"
            },
            {
              title: "Interview Preparation",
              desc: "Generate custom mock coding, behavioral, and company-specific interview prompts with immediate reviews.",
              icon: Laptop,
              color: "text-rose-600 bg-rose-50 border-rose-100"
            },
            {
              title: "Salary Prediction",
              desc: "Understand your true market value. Get AI-backed estimates matched against global criteria.",
              icon: DollarSign,
              color: "text-emerald-700 bg-emerald-50 border-emerald-150"
            }
          ].map((feat, index) => {
            const IconComp = feat.icon;
            return (
              <div 
                key={index} 
                onClick={() => {
                  setIsLogin(false);
                  setShowAuthModal(true);
                }}
                className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-350 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className={`p-2 rounded-lg border w-9 h-9 flex items-center justify-center ${feat.color}`}>
                    <IconComp className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-normal font-medium">
                    {feat.desc}
                  </p>
                </div>
                <div className="pt-2 text-[9px] text-[#2563EB] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>Activate</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full font-mono">
              Onboarding Process
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              A Seamless Two-Step Integration
            </h2>
            <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
              We ditched complex registration logs. Authenticate, upload, and apply in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 relative">
            <div className="space-y-3 text-center md:text-left relative z-10">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center mx-auto md:mx-0">
                1
              </div>
              <h3 className="text-xs font-extrabold text-[#0F172A]">OTP Quick Sign-In</h3>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                No passwords, no long fields. Authenticate instantly using your Mobile phone OTP.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white font-black text-xs flex items-center justify-center mx-auto md:mx-0">
                2
              </div>
              <h3 className="text-xs font-extrabold text-[#0F172A]">Upload Your Resume</h3>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                Drag and drop PDF or DOCX up to 10MB. Our backend parsing instantly extracts your profile attributes.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left relative z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center mx-auto md:mx-0">
                3
              </div>
              <h3 className="text-xs font-extrabold text-[#0F172A]">Apply on Real Sourced Posts</h3>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                Receive instant match fits. Click apply to redirect exactly to original company career portals to log applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC PREVIEW PRICING SECTION */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full font-mono">
            Premium Workspaces
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Choose the workspace capability that fits your requirements. UPI instant clearance supported.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Free Plan",
              price: "₹0",
              desc: "Baseline candidate match suite.",
              features: [
                "Up to 10 job matches globally",
                "Basic resume parser metadata profile",
                "Standard dashboard preview",
                "Basic ATS score calculation"
              ],
              cta: "Start Free",
              accent: "border-slate-200"
            },
            {
              title: "Pro Tier",
              price: "₹249",
              desc: "For serious candidate job seekers.",
              features: [
                "Unlimited global matches",
                "Custom AI cover letters generator",
                "Career roadmaps & salary progression",
                "Full mock interview preparations",
                "Resume rewrite recommendations"
              ],
              cta: "Upgrade to Pro",
              accent: "border-amber-400 ring-4 ring-amber-400/5 bg-amber-50/10"
            },
            {
              title: "Employer Suite",
              price: "₹399",
              desc: "Complete toolkit for active recruiters.",
              features: [
                "Post unlimited vacancies",
                "AI candidate match ranking",
                "Direct resume search filters",
                "Enterprise team dashboards access",
                "Priority cloud background sync"
              ],
              cta: "Deploy Recruiter Suite",
              accent: "border-indigo-600 ring-4 ring-indigo-600/5"
            }
          ].map((plan, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border bg-white flex flex-col justify-between space-y-6 ${plan.accent}`}
            >
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">
                  {plan.title}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-400 font-bold">/ month</span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold">{plan.desc}</p>
                <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  {plan.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start gap-2 font-semibold text-slate-650">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setIsLogin(idx === 0 ? false : true);
                  setShowAuthModal(true);
                }}
                className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer text-center block"
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="bg-[#0F172A] text-white py-16 border-t border-slate-800 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-slate-900 flex items-center justify-center font-black text-xs">
                BC
              </div>
              <span className="text-base font-black tracking-tight text-white">
                BrainyCareer.com
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px] font-sans">
              The AI-powered Career Operating System connecting elite job seekers and employers with 100% automated matching.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-slate-400 tracking-wider text-[10px]">For Candidates</h4>
            <ul className="space-y-2 text-slate-350">
              <li><a href="#features" className="hover:text-white transition-colors">AI Resume Parsing</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">ATS Score Checking</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Career Pathways</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Tailored Cover Letters</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-slate-400 tracking-wider text-[10px]">For Employers</h4>
            <ul className="space-y-2 text-slate-350">
              <li><a href="#hero" className="hover:text-white transition-colors">Post Vacancies</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">AI Candidate Ranking</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">Sourcing Partners</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">Resume Shortlisting</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-slate-400 tracking-wider text-[10px]">Secure Access</h4>
            <div className="bg-slate-800/50 p-4.5 rounded-xl border border-slate-700/50 space-y-2">
              <p className="text-slate-350 text-[10px] leading-relaxed">
                Registered administrator or enterprise dashboard profiles have access protected with standard secure tokens.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-[10px]">
          <p>© 2026 BrainyCareer.com (AI Career Operating System). All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>UPI Merchant Settle Protocol</span>
          </div>
        </div>
      </footer>

      {/* MODAL OVERLAY (Unified Sign-In Portal) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-5"
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowAuthModal(false);
                setError(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-650 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {isLogin ? 'Sign In to BrainyCareer' : 'Create Your Profile'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                AI Career Operating System
              </p>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Core Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Role Selection (Only on Register) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">I want to</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('seeker')}
                      className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        selectedRole === 'seeker' 
                          ? 'border-[#2563EB] bg-blue-50/50 text-blue-900 font-extrabold shadow-sm' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      Discover Jobs
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('employer')}
                      className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        selectedRole === 'employer' 
                          ? 'border-[#2563EB] bg-blue-50/50 text-blue-900 font-extrabold shadow-sm' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      Hire Talent
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name (register mode only) */}
              {!isLogin && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><User className="w-4 h-4" /></span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Email / Username field */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {isLogin ? "Email / Username" : "Email Address"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><Mail className="w-4 h-4" /></span>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isLogin ? "e.g. gaurav or candidate@email.com" : "alex@example.com"}
                    className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><Lock className="w-4 h-4" /></span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1">
                <span className="text-slate-450 font-semibold">
                  {isLogin ? "No account yet?" : "Already registered?"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#2563EB] font-black cursor-pointer hover:underline"
                >
                  {isLogin ? "Create Profile" : "Access Account"}
                </button>
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>{isLogin ? 'Sign In Now' : 'Create Profile'}</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
