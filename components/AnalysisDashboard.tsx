import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { AIAnalysis, Repository, PipelineFolder, SavedCandidate } from '../types';
import { ShieldCheck, Zap, AlertTriangle, Target, Save, ChevronRight, Star, GitFork, Share2, Link, FileDown, Twitter, Linkedin, Terminal, Clock } from 'lucide-react';

interface Props {
  analysis: AIAnalysis;
  repositories: Repository[];
  isPro: boolean;
  onUpgradeClick: () => void;
  username: string;
  folders: PipelineFolder[];
  onAddToPipeline: (folderId: string, candidate: SavedCandidate) => void;
  onCreateFolder: (name: string) => void;
}

export const AnalysisDashboard: React.FC<Props> = ({ 
  analysis, 
  repositories, 
  isPro, 
  onUpgradeClick, 
  username,
  folders,
  onAddToPipeline,
  onCreateFolder
}) => {
  const [showPipelineMenu, setShowPipelineMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'Senior': return 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
      case 'Architect': return 'text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/5';
      case 'Lead': return 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/5';
      default: return 'text-yellow-600 dark:text-yellow-400 border-yellow-500/30 bg-yellow-500/5';
    }
  };

  const shareText = `DevLens Intelligence: @${username} evaluated as ${analysis.seniority} level. Tech DNA: ${analysis.techStack.slice(0, 3).join(', ')}.`;
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Print Only Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Terminal className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">DevLens Intelligence Dossier</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidential Technical Audit Report</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center justify-end gap-1">
              <Clock size={10} /> Generated on {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm font-bold">Subject ID: @{username}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] backdrop-blur-md shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Target size={14} className="text-blue-500" /> Neural Skill Matrix
            </h3>
            <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase ${getSeniorityColor(analysis.seniority)}`}>
              {analysis.seniority} Level
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.skillMatrix}>
                <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Radar
                  name="Subject"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] backdrop-blur-md flex flex-col shadow-sm dark:shadow-none">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Executive Intelligence
          </h3>
          <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed text-sm mb-6 flex-1">
            "{analysis.recommendation}"
          </p>
          <div className="space-y-3 no-print">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <button 
                    onClick={() => { setShowPipelineMenu(!showPipelineMenu); setShowShareMenu(false); }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
                  >
                    <Save size={14} /> Pipeline
                  </button>
                  {showPipelineMenu && (
                    <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-200">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase px-2 py-1">Select Pipeline Folder</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {folders.length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-xs text-slate-500 italic mb-2">No folders found</p>
                            <button 
                              onClick={() => onCreateFolder('Default')}
                              className="text-blue-500 text-[10px] font-black uppercase hover:underline"
                            >
                              + Create 'Default'
                            </button>
                          </div>
                        ) : (
                          folders.map(f => (
                            <button 
                              key={f.id}
                              onClick={() => {
                                onAddToPipeline(f.id, {
                                  username,
                                  name: username,
                                  avatar: `https://github.com/${username}.png`,
                                  seniority: analysis.seniority,
                                  addedAt: new Date().toISOString()
                                });
                                setShowPipelineMenu(false);
                              }}
                              className="w-full text-left px-4 py-3 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }}></div>
                              {f.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => { setShowShareMenu(!showShareMenu); setShowPipelineMenu(false); }}
                      className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-black py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                    {showShareMenu && (
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase px-2 py-1">Share Uplink</p>
                        </div>
                        <div className="p-1 space-y-1">
                          <button 
                            onClick={() => handleSocialShare('x')}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Twitter size={14} className="text-sky-400" />
                            Share on X
                          </button>
                          <button 
                            onClick={() => handleSocialShare('linkedin')}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Linkedin size={14} className="text-blue-600" />
                            LinkedIn Post
                          </button>
                          <button 
                            onClick={handleCopyLink}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            {shareFeedback ? <ShieldCheck size={14} className="text-emerald-500" /> : <Link size={14} className="text-slate-400" />}
                            {shareFeedback ? 'Copied Intel' : 'Copy Intel Link'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleExportPDF}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-black py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all"
                    title="Export Dossier as PDF"
                  >
                    <FileDown size={14} />
                    Export
                  </button>
                </div>
             </div>
             {/* Dedicated LinkedIn Share Area */}
             <button 
               onClick={() => handleSocialShare('linkedin')}
               className="w-full mt-2 bg-blue-100 dark:bg-blue-700/20 hover:bg-blue-200 dark:hover:bg-blue-700/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600/30 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all no-print"
             >
               <Linkedin size={14} />
               Share Dossier on LinkedIn
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/40 border border-emerald-500/20 dark:border-emerald-500/20 p-6 rounded-3xl shadow-sm dark:shadow-none">
          <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap size={14} /> Key Strategic Strengths
          </h4>
          <ul className="space-y-3">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-slate-900/40 border border-red-500/20 dark:border-red-500/20 p-6 rounded-3xl shadow-sm dark:shadow-none">
          <h4 className="text-[10px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle size={14} /> Observed Vulnerabilities
          </h4>
          <ul className="space-y-3">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] backdrop-blur-md shadow-sm dark:shadow-none">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
           Verified Tech Stack DNA
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.techStack.map((tech, i) => (
            <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-bold hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-white transition-colors cursor-default">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Recent Intelligence Ops (Repositories)
          </h3>
          <a href={`https://github.com/${username}?tab=repositories`} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase hover:underline flex items-center gap-1 no-print">
            Explore All <ChevronRight size={12} />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repositories.slice(0, 6).map((repo, i) => (
            <div key={i} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate max-w-[150px]">{repo.name}</h4>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <Star size={10} className="text-yellow-500" /> {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <GitFork size={10} className="text-blue-500" /> {repo.forks_count}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 h-8">{repo.description || "No descriptive intelligence provided."}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">{repo.language || 'Hybrid'}</span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};