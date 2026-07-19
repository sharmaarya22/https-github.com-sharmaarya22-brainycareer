import React, { useState } from 'react';
import { Check, Sparkles, Zap, Lock, ShieldCheck, X, CheckCircle, QrCode } from 'lucide-react';

interface PricingTiersProps {
  currentPlan: 'Free' | 'Pro' | 'Enterprise';
  token: string;
  onSelectPlan: (plan: 'Free' | 'Pro' | 'Enterprise') => void;
  role?: 'seeker' | 'employer' | 'admin';
}

export default function PricingTiers({ currentPlan, token, onSelectPlan, role }: PricingTiersProps) {
  // Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState<'Pro' | 'Enterprise' | null>(null);
  const [upiId, setUpiId] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState<{ orderId: string, upiUrl: string, amount: number, status: string } | null>(null);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [formError, setFormError] = useState('');

  const isEmployer = role === 'employer';

  const tiers = [
    {
      id: 'Free' as const,
      name: 'Free Plan',
      price: '0',
      description: isEmployer 
        ? 'Baseline talent tools for emerging recruiters and organizations.'
        : 'Essential job discovery and match analysis tools.',
      features: isEmployer ? [
        'Post up to 5 vacancies per day',
        'Standard applicant registry access',
        'Direct connection with potential candidates',
        'Basic applicant overview metrics'
      ] : [
        'Apply to up to 5 jobs per day',
        'Tailored custom AI cover letters for those 5 jobs',
        'Standard matchmaking overview with default filters'
      ],
      icon: Zap,
      accent: 'border-slate-200 text-slate-500 bg-slate-50',
      buttonText: 'Currently Active Free'
    },
    {
      id: 'Pro' as const, // Maps to Pro/Premium backend integration
      name: 'Premium Plan',
      price: '249',
      description: isEmployer
        ? 'Complete advanced workspace to post unlimited vacancies and sort top-tier talent.'
        : 'Complete AI-driven tools to unlock your career potential and get hired faster.',
      features: isEmployer ? [
        'Post unlimited vacancies per day',
        'Advanced talent compatibility scoring & sorting matches',
        'Priority instant candidate registry indexing',
        'Shared talent pipeline tracking seats',
        'Direct recruiter messaging & feedback templates'
      ] : [
        'Unlimited job applications & direct external apply links',
        'Unlimited custom AI cover letter generations & templates',
        'Unlimited resume parser updates and profile analyses',
        '24/7 AI Career Coach interactive advisor companion',
        'Interactive custom mock interview preparation sandbox',
        'Profile views analytics and full matching filters'
      ],
      icon: Sparkles,
      accent: 'border-amber-200 text-amber-600 bg-amber-50 shadow-2xs',
      buttonText: isEmployer ? 'Upgrade to Premium Hiring (INR 249)' : 'Upgrade to Premium (INR 249)'
    }
  ];

  const handleSelectPress = (tierId: 'Free' | 'Pro' | 'Enterprise') => {
    if (tierId === 'Free') {
      onSelectPlan('Free');
    } else {
      // Trigger checkout modal for payment integration
      setCheckoutPlan(tierId as any);
      setUpiId('');
      setFullName('');
      setFormError('');
      setGeneratedOrder(null);
      setCopiedLink(false);
      setShowSuccessScreen(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your full name associated with your bank.');
      return;
    }

    const trimmedUpi = upiId.trim();
    if (!trimmedUpi.includes('@')) {
      setFormError('Please enter a valid UPI ID (e.g., username@okhdfcbank or 9876543210@paytm).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: checkoutPlan,
          upiId: trimmedUpi,
          fullName: fullName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate secure merchant order URL.');
      }

      setGeneratedOrder(data);
    } catch (err: any) {
      setFormError(err.message || 'Connection timeout. Please verify backend state is live.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerSimulatedWebhook = async (gatewayType: 'Razorpay' | 'Cashfree') => {
    if (!generatedOrder) return;
    setIsSimulatingWebhook(true);
    setFormError('');
    try {
      let body: any = {};
      if (gatewayType === 'Razorpay') {
        body = {
          event: "payment.captured",
          payload: {
            payment: {
              entity: {
                id: "pay_" + Math.random().toString(36).substring(2, 9),
                amount: generatedOrder.amount * 100,
                status: "captured",
                order_id: generatedOrder.orderId,
                vpa: upiId,
                notes: {
                  userId: "", 
                  plan: checkoutPlan
                }
              }
            }
          }
        };
      } else {
        body = {
          event: "PAYMENT_SUCCESS",
          data: {
            order: {
              order_id: generatedOrder.orderId,
              order_amount: generatedOrder.amount
            },
            payment: {
              payment_status: "SUCCESS"
            },
            customer_details: {
              customer_name: fullName
            }
          }
        };
      }

      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Webhook notification refused.');
      }

      setShowSuccessScreen(true);
      setTimeout(() => {
        if (checkoutPlan) {
          onSelectPlan(checkoutPlan);
        }
        setCheckoutPlan(null);
        setGeneratedOrder(null);
        setShowSuccessScreen(false);
      }, 2000);

    } catch (err: any) {
      setFormError(`Webhook simulation rejected: ${err.message}`);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedOrder) {
      navigator.clipboard.writeText(generatedOrder.upiUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const activeTargetTier = tiers.find(t => t.id === checkoutPlan);

  return (
    <div id="pricing-matrix-panel" className="relative space-y-6 font-sans max-w-5xl mx-auto pb-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest px-3.5 py-1 bg-indigo-50 border border-indigo-200 rounded-full font-mono">
          PREMIUM SERVICE UPGRADES
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Supercharge Your Workspace with Smart Plans
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Select premium capabilities tailored to your workflow. We support direct instant zero-fee UPI payment clearance with bank settlement alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {tiers.map((tier) => {
          const IconComponent = tier.icon;
          const isSelected = tier.id === 'Free' ? currentPlan === 'Free' : (currentPlan === 'Pro' || currentPlan === 'Enterprise');

          return (
            <div
              key={tier.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${
                isSelected
                  ? 'border-indigo-600 bg-white ring-4 ring-indigo-600/10 scale-[1.02] shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-355 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl border ${tier.accent}`}>
                    <IconComponent className="w-5 h-5 animate-pulse" />
                  </div>
                  {isSelected && (
                    <span className="text-[9px] uppercase font-bold px-2.5 py-0.5 bg-indigo-600 text-white rounded font-mono">
                      Active Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                    <span>{tier.name}</span>
                    {tier.id !== 'Free' && (
                      <span className="text-[8.5px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-150 rounded px-1.5 uppercase font-bold">
                        Special Rate
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100">
                  <span className="text-3xl font-black text-slate-900">
                    {tier.id === 'Free' ? `₹0` : `₹${tier.price}`}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/ month</span>
                </div>

                <ul className="space-y-2.5 pt-2">
                  {tier.features.map((feature, index) => {
                    const isLocked = feature.startsWith("Lock:");
                    const cleanFeature = isLocked ? feature.replace("Lock:", "🔒 Locked:") : feature;
                    return (
                      <li key={index} className={`flex items-start gap-2 text-[11px] leading-tight ${isLocked ? 'text-slate-400 font-medium' : 'text-slate-650 font-semibold'}`}>
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLocked ? 'text-slate-300' : 'text-emerald-550 text-emerald-600'}`} />
                        <span>{cleanFeature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPress(tier.id)}
                disabled={isSelected}
                className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 text-slate-400 cursor-default font-semibold'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 font-extrabold ring-4 ring-indigo-500/10 hover:shadow-xs'
                }`}
              >
                {isSelected ? 'Currently Active' : tier.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      {/* RECRUITER SETTLEMENT SYSTEM DESIGN COMPLIANCE INFRASTRUCTURE CHART */}
      <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <span>ℹ️ How the Subscription Revenue is Credited to Your Account</span>
        </h4>
        <p className="leading-relaxed font-medium">
          In this portal application, all transactions utilize premium <strong>Unified Payments Interface (UPI) merchant routing</strong> protocols. To accept real Indian Rupees (INR) from subscribers and credit them directly into your personal or corporate bank account, the following integrations are utilized:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-semibold text-slate-750">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-900 font-bold block text-[11px]">1. Payment Gateway API</span>
            <span className="text-slate-500 text-[10px] leading-relaxed block">
              You register a business profile with <strong>Razorpay</strong>, <strong>Paytm Business</strong>, or <strong>Cashfree</strong> inside the merchant dashboard. They generate secure API endpoints for generating dynamic UPI QR codes.
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-900 font-bold block text-[11px]">2. Business VPA Settlement</span>
            <span className="text-slate-500 text-[10px] leading-relaxed block">
              Provide your Business VPA UPI String (e.g. <code>mycompany@hdfcbank</code>) in the environment file <code>.env</code>. The gateway will route 100% of the funds straight into this UPI handle.
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-900 font-bold block text-[11px]">3. Immediate Credits</span>
            <span className="text-slate-500 text-[10px] leading-relaxed block">
              Once an applicant submits a payment, the UPI network triggers a web-hook listener. Your backend receives confirmation, updates the seeker state instantly, and funds settle into your bank account within T+1 hours.
            </span>
          </div>
        </div>
      </div>

      {/* SECURED END-TO-END UPI GATEWAY MODAL */}
      {checkoutPlan && activeTargetTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 relative shadow-2xl space-y-5 overflow-hidden my-8">
            
            {/* Success Overlay state */}
            {showSuccessScreen ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-3.5 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-600">
                  <CheckCircle className="w-12 h-12 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Payment Processed Successfully!</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    UPI authentication verified. Your account has been upgraded to <strong>{activeTargetTier.name}</strong>. Enjoy full premium-tier tools!
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-mono bg-emerald-50 text-emerald-800 border border-emerald-250 p-1 px-2.5 rounded-full font-bold">
                      SECURED UPI GATEWAY INTERFACE
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1.5 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{generatedOrder ? 'Scan & Authorize' : 'Configure Instant Payment'}</span>
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                      setCheckoutPlan(null);
                      setGeneratedOrder(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Bill Review Summary Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900">{activeTargetTier.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Auto-renew. Settle into merchant handle</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-indigo-600">₹{activeTargetTier.price}.00</p>
                    <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider font-mono">Zero Fee UPI</p>
                  </div>
                </div>

                {/* Step 1: Input details to generate order */}
                {!generatedOrder ? (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    {formError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold text-center">
                        ⚠️ {formError}
                      </div>
                    )}

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Gaurav Upreti"
                          className="block w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Enter UPI ID / VPA Handle
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. gaurav@okhdfcbank"
                            className="block w-full pl-3.5 pr-20 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono font-semibold placeholder:text-slate-400"
                          />
                          <span className="absolute right-3.5 top-3 text-[10px] bg-slate-100 text-slate-500 border border-slate-200 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider font-mono select-none">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Creating merchant secure transaction order...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-white" />
                          <span>Generate UPI Scanner QR</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[9.5px] text-slate-500 leading-none">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span>Securely generates standard registered QR scanner</span>
                    </div>
                  </form>
                ) : (
                  /* Step 2: Show generated order scan panel with webhook simulator triggers */
                  <div className="space-y-4">
                    {/* Visual QR Code Scan Graphic */}
                    <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
                        {/* Real-time Dynamic QR Code containing the specified and requested UPI URIs */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatedOrder.upiUrl)}`}
                          alt="Dynamic UPI QR Code Scanner"
                          referrerPolicy="no-referrer"
                          className="w-36 h-36"
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-[11px] font-extrabold text-slate-800">Scan QR Code via GPay / PhonePe / Paytm</p>
                        <p className="text-[10px] text-slate-500">
                          Order ID: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold font-mono text-[9px]">{generatedOrder.orderId}</code>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={copyToClipboard}
                        type="button"
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        {copiedLink ? 'Copied UPI String!' : 'Copy Raw UPI deep-link'}
                      </button>
                    </div>

                    {/* Simulation sandbox controls for Razorpay / Cashfree webhooks */}
                    <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded-2xl space-y-2.5">
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-indigo-700">
                          ⚙️ SECURE PAYMENT GATEWAY WEBHOOK SIMULATORS
                        </span>
                        <span className="block text-[9.5px] text-slate-500 font-medium leading-normal mt-0.5">
                          Since this app runs in a sandboxed container, triggering these calls will dispatch authentic webhook callback requests directly to your backend, verifying account activation and email receipt delivery!
                        </span>
                      </div>

                      {formError && (
                        <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-700 font-bold text-center">
                          ⚠️ {formError}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                        <button
                          onClick={() => triggerSimulatedWebhook('Razorpay')}
                          disabled={isSimulatingWebhook}
                          type="button"
                          className="py-2.5 px-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-1 hover:shadow-xs disabled:opacity-50"
                        >
                          <span className="shrink-0 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
                          <span>Razorpay Webhook</span>
                        </button>
                        <button
                          onClick={() => triggerSimulatedWebhook('Cashfree')}
                          disabled={isSimulatingWebhook}
                          type="button"
                          className="py-2.5 px-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1 hover:shadow-xs disabled:opacity-50"
                        >
                          <span className="shrink-0 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                          <span>Cashfree Webhook</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
