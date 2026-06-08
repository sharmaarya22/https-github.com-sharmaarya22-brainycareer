import React from 'react';
import { Check, Sparkles, Zap, Award } from 'lucide-react';

interface PricingTiersProps {
  currentPlan: 'Free' | 'Pro' | 'Enterprise';
  onSelectPlan: (plan: 'Free' | 'Pro' | 'Enterprise') => void;
}

export default function PricingTiers({ currentPlan, onSelectPlan }: PricingTiersProps) {
  const tiers = [
    {
      id: 'Free' as const,
      name: 'Bronze Free Plan',
      price: '0',
      description: 'Core matching and portal evaluation rules.',
      features: [
        '5 automated job matches per day',
        'Basic resume parser analysis',
        'Single formal cover letter styling',
        'Public job board indexing views',
        'Email communication alerts'
      ],
      icon: Zap,
      accent: 'border-slate-200 text-slate-500 bg-slate-50',
      buttonText: 'Active Baseline Plan'
    },
    {
      id: 'Pro' as const,
      name: 'Gold Pro Elite',
      price: '29',
      description: 'Complete automated job searching and advanced AI analysis.',
      features: [
        'Unlimited automated AI applications',
        'Advanced match probability meters (Interview, Offer %, Fit)',
        'Full AI Resume Builder with 5 multi-format downloadable styles',
        'HR Contact discovery with automatic verified status check',
        'Four customizable AI Cover Letter modes (Startup, Corporate, etc)',
        'Comprehensive 24/7 AI Career Coach & Mock interview simulator'
      ],
      icon: Sparkles,
      accent: 'border-indigo-200 text-indigo-600 bg-indigo-50 shadow-2xs',
      buttonText: 'Upgrade to Elite'
    },
    {
      id: 'Enterprise' as const,
      name: 'Platinum Recruiter Suite',
      price: '149',
      description: 'Bulk recruiter indexing, enterprise applicant ranking & screens.',
      features: [
        'Automatic applicant fit ranks & sorting',
        'Enterprise candidate screening summaries & feedback forms',
        'Recruiter profile business verification badge registration',
        'AI mock assessment and targeted questions lists constructor',
        'Custom SMS, WhatsApp, & push automated notification pipeline',
        'Priority premium model latency limits fallback rules'
      ],
      icon: Award,
      accent: 'border-violet-200 text-violet-600 bg-violet-50 shadow-2xs',
      buttonText: 'Deploy Developer Recruiter'
    }
  ];

  return (
    <div id="pricing-matrix-panel" className="relative space-y-6 font-sans">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest px-3.5 py-1 bg-indigo-50 border border-indigo-200 rounded-full font-mono">
          PREMIUM FEATURES SELECTOR
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Supercharge Your Recruitment Efficiency
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Upgrade your workspace. Instantly access advanced ATS matching metrics, download tailored CVs, unlock custom-trained interview coaches, and verify corporate entities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((tier) => {
          const IconComponent = tier.icon;
          const isSelected = currentPlan === tier.id;

          return (
            <div
              key={tier.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${
                isSelected
                  ? 'border-indigo-600 bg-white ring-4 ring-indigo-600/10 scale-[1.02] shadow-md'
                  : 'border-slate-205 bg-white hover:border-slate-350 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl border ${tier.accent}`}>
                    <IconComponent className="w-5 h-5 animate-pulse" />
                  </div>
                  {isSelected && (
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-indigo-600 text-white rounded font-mono">
                      Active Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{tier.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100">
                  <span className="text-3xl font-black text-slate-900">${tier.price}</span>
                  <span className="text-xs text-slate-400 font-bold">/ month</span>
                </div>

                <ul className="space-y-2.5 pt-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-[11px] text-slate-600 font-medium leading-tight">
                      <Check className="w-3.5 h-3.5 text-emerald-550 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onSelectPlan(tier.id)}
                disabled={isSelected}
                className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 text-slate-400 cursor-default font-semibold'
                    : tier.id === 'Pro'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 font-extrabold ring-4 ring-indigo-500/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                }`}
              >
                {isSelected ? 'Current Active Tier' : tier.buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
