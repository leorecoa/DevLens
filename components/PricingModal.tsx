import React from 'react';
import { X, Check, Shield, Crown, Zap, Globe, Cpu } from 'lucide-react';
import { UserSubscription } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userSubscription: UserSubscription;
  onUpgrade: () => void;
}

export const PricingModal: React.FC<Props> = ({ isOpen, onClose, userSubscription, onUpgrade }) => {
  if (!isOpen) return null;

  const isFreeTierActive = userSubscription.tier === 'FREE';
  const isProTierActive = userSubscription.tier === 'PRO';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md bg-black/50 dark:bg-black/70 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0b0f1a] border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-[3rem] shadow-2xl dark:shadow-[0_0_50px_rgba(59,130,246,0.1)] overflow-hidden animate-in slide-in-from-bottom-8 duration-500 transition-colors duration-300">
        <div className="relative p-10">
           <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
             <X size={24} />
           </button>
           
           <div className="text-center mb-12">
             <h2 className="text-xs font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.4em] mb-4">Tactical Upgrades</h2>
             <h3 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">Unlock the Full Intel Protocol</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Free Tier */}             <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col shadow-sm">                <div className="flex items-center gap-3 mb-6">                   <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">                      <Shield size={20} className="text-slate-400 dark:text-slate-400" />                   </div>                   <h4 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">Standard Unit</h4>                </div>                <div className="mb-8">                   <p className="text-4xl font-black text-slate-900 dark:text-white">$0 <span className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">/ Project</span></p>                </div>                <ul className="space-y-4 mb-10 flex-1">                   {[                     "3 Neural Profile Probes",                     "Basic Repository Stats",                     "Single Sourcing Pipeline",                     "Community Support"                   ].map((f, i) => (                     <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">                        <Check size={16} className="text-slate-300 dark:text-slate-600" />                        {f}                     </li>                   ))}                </ul>                {isFreeTierActive ? (                  <button disabled className="w-full py-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 font-black uppercase tracking-widest text-xs bg-white dark:bg-transparent">                    Currently Active (Credits: {userSubscription.creditsRemaining})                  </button>                ) : (                  <button onClick={onUpgrade} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-900/40">                    Downgrade to Free                  </button>                )}             </div>             {/* Pro Tier */}             <div className="p-8 bg-blue-50 dark:bg-blue-600/5 border-2 border-blue-500 rounded-[2.5rem] flex flex-col relative overflow-hidden group shadow-lg shadow-blue-500/10">                <div className="absolute top-0 right-0 bg-blue-500 text-white font-black text-[9px] uppercase px-4 py-1.5 rounded-bl-xl tracking-widest shadow-md">                  Highly Classified                </div>                <div className="flex items-center gap-3 mb-6">                   <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/40">                      <Crown size={20} className="text-white" fill="currentColor" />                   </div>                   <h4 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">Pro Commander</h4>                </div>                <div className="mb-8">                   <p className="text-4xl font-black text-slate-900 dark:text-white">$49 <span className="text-sm text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">/ Month</span></p>                </div>                <ul className="space-y-4 mb-10 flex-1">                   {[                     "Unlimited Profile Analysis",                     "AI Battle Mode (Comparison)",                     "Unlimited Talent Pipelines",                     "Priority Neural Reasoning",                     "Contextual Intelligence Chat",                     "Export Dossier Reports"                   ].map((f, i) => (                     <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">                        <Check size={16} className="text-blue-600 dark:text-blue-500" />                        {f}                     </li>                   ))}                </ul>                {isProTierActive ? (                  <button disabled className="w-full py-4 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-300 dark:text-blue-600 font-black uppercase tracking-widest text-xs bg-white dark:bg-transparent">                    Currently Active (Analyses: {userSubscription.totalAnalyses})                  </button>                ) : (                  <button onClick={onUpgrade} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-900/40">                    Initialize Upgrade                  </button>                )}             </div>
           </div>
        </div>
      </div>
    </div>
  );
};