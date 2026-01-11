import React, { useState } from 'react';
import { ComparisonAnalysis, GitHubProfile, Repository } from '../types';
import { Swords, Trophy, AlertCircle, Share2, Link, FileDown, Twitter, Linkedin, ShieldCheck, Terminal, Clock } from 'lucide-react';

interface Props {
  comparison: ComparisonAnalysis;
  p1: GitHubProfile;
  p2: GitHubProfile;
  r1: Repository[];
  r2: Repository[];
}

export const ComparisonDashboard: React.FC<Props> = ({ comparison, p1, p2, r1, r2 }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const isP1Winner = comparison.winner.toLowerCase() === p1.login.toLowerCase();

  const ScoreBar = ({ score, color }: { score: number, color: string }) => (
    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out`} 
        style={{ width: `${score}%` }}
      />
    </div>
  );

  const shareText = `DevLens Battle Result: @${comparison.winner} dominates with ${isP1Winner ? comparison.suitabilityScore1 : comparison.suitabilityScore2}% fit score! Tactical comparison: ${p1.login} vs ${p2.login}.`;
  const shareUrl = window.location.href;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setShareFeedback(true);
    setTimeout(() => {
      setShareFeedback(false);
      setShowShareMenu(false);
    }, 2000);
  };

  const handleSocialShare = (platform: 'x' | 'linkedin') => {
    const urls = {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };
    window.open(urls[platform], '_blank');
    setShowShareMenu(false);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-10 animate-in fade-in zoom-in duration-500">
      {/* Print Only Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Swords className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">DevLens Battle Intelligence Report</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comparative Technical Evaluation</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center justify-end gap-1">
              <Clock size={10} /> Report Date: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm font-bold">Subjects: @{p1.login} vs @{p2.login}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 no-print">
          <div className="w-32 h-32 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 items-center gap-8">
          <div className={`flex flex-col items-center text-center p-8 rounded-[3rem] border-2 transition-all ${isP1Winner ? 'bg-emerald-500/5 border-emerald-500 shadow-2xl shadow-emerald-500/20' : 'bg-slate-900/50 border-slate-800 opacity-70'}`}>
            <img src={p1.avatar_url} className="w-24 h-24 rounded-[2rem] border-4 border-slate-700 mb-4" alt="" />
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{p1.name || p1.login}</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">@{p1.login}</p>
            {isP1Winner && <Trophy className="text-yellow-500 animate-bounce" size={24} />}
            <div className="w-full mt-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase">Fit Score</span>
                <span className="text-xs font-black text-white">{comparison.suitabilityScore1}%</span>
              </div>
              <ScoreBar score={comparison.suitabilityScore1} color={isP1Winner ? 'bg-emerald-500' : 'bg-slate-600'} />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
             <div className="bg-slate-800 p-6 rounded-full shadow-2xl border-4 border-slate-900 relative">
                <Swords className="text-blue-500" size={48} />
             </div>
             <div className="text-center no-print">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Battle Outcome</h4>
                <p className="text-lg font-black text-white italic uppercase tracking-tighter mb-4">Strategic Superiority Found</p>
                <div className="flex flex-col gap-2 relative">
                  <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="mx-auto flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all w-full max-w-[200px]"
                  >
                    <Share2 size={12} />
                    Share Battle Intel
                  </button>
                  {showShareMenu && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="p-2 border-b border-slate-700">
                        <p className="text-[10px] font-black text-slate-500 uppercase px-2 py-1">Share Uplink</p>
                      </div>
                      <div className="p-1 space-y-1">
                        <button 
                          onClick={() => handleSocialShare('x')}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Twitter size={14} className="text-sky-400" />
                          Share on X
                        </button>
                        <button 
                          onClick={() => handleSocialShare('linkedin')}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Linkedin size={14} className="text-blue-500" />
                          LinkedIn Post
                        </button>
                        <button 
                          onClick={handleCopyLink}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          {shareFeedback ? <ShieldCheck size={14} className="text-emerald-400" /> : <Link size={14} className="text-slate-400" />}
                          {shareFeedback ? 'Intel Copied' : 'Copy Intel Link'}
                        </button>
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={handleExportPDF}
                    className="mx-auto flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all w-full max-w-[200px]"
                    title="Download Report as PDF"
                  >
                    <FileDown size={12} />
                    Download PDF
                  </button>
                  {/* Dedicated LinkedIn Share Button */}
                  <button 
                    onClick={() => handleSocialShare('linkedin')}
                    className="mx-auto mt-1 flex items-center gap-2 px-6 py-2 bg-blue-700/20 hover:bg-blue-700/40 border border-blue-600/30 rounded-full text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-all w-full max-w-[200px]"
                  >
                    <Linkedin size={12} />
                    Share on LinkedIn
                  </button>
                </div>
             </div>
          </div>

          <div className={`flex flex-col items-center text-center p-8 rounded-[3rem] border-2 transition-all ${!isP1Winner ? 'bg-emerald-500/5 border-emerald-500 shadow-2xl shadow-emerald-500/20' : 'bg-slate-900/50 border-slate-800 opacity-70'}`}>
            <img src={p2.avatar_url} className="w-24 h-24 rounded-[2rem] border-4 border-slate-700 mb-4" alt="" />
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{p2.name || p2.login}</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">@{p2.login}</p>
            {!isP1Winner && <Trophy className="text-yellow-500 animate-bounce" size={24} />}
            <div className="w-full mt-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase">Fit Score</span>
                <span className="text-xs font-black text-white">{comparison.suitabilityScore2}%</span>
              </div>
              <ScoreBar score={comparison.suitabilityScore2} color={!isP1Winner ? 'bg-emerald-500' : 'bg-slate-600'} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 no-print">
           <AlertCircle size={100} />
        </div>
        <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
           Neural Rationale Report
        </h4>
        <p className="text-xl text-slate-300 italic leading-relaxed relative z-10 border-l-4 border-blue-600 pl-8">
          "{comparison.rationale}"
        </p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50">
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Combat Category</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">@{p1.login}</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">@{p2.login}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.comparisonPoints.map((point, i) => (
              <tr key={i} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                <td className="p-6 font-bold text-slate-300 text-sm italic">{point.category}</td>
                <td className="p-6 text-center">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg text-xs font-bold text-slate-200">
                      {point.user1Status}
                   </div>
                </td>
                <td className="p-6 text-center">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg text-xs font-bold text-slate-200">
                      {point.user2Status}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};