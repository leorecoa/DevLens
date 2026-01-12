import React, { useState, useEffect } from 'react';
import { Search, Github, Terminal, AlertCircle, Loader2, Sparkles, Swords, Users, Crown, CreditCard, Shield, ClipboardList, X, Target, Folders, Cpu, Database, Network, Binary, ShieldCheck, Activity, Wifi, Box, Fingerprint, Zap, Radar, Microscope, HardDrive, Globe, Code, Layers } from 'lucide-react';
import { analyzeProfile, compareProfiles } from './services/geminiService';
import { AppStatus, AIAnalysis, GitHubProfile, Repository, ComparisonAnalysis, UserSubscription, PipelineFolder, SavedCandidate } from './types';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatWidget } from './components/ChatWidget';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { PricingModal } from './components/PricingModal';
import { PipelineManager } from './components/PipelineManager';

const FREE_LIMIT = 3;

function App() {
  const [username1, setUsername1] = useState('gaearon'); 
  const [username2, setUsername2] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [jdInput, setJdInput] = useState('');
  const [isJdOpen, setIsJdOpen] = useState(false);
  
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingSubMessage, setLoadingSubMessage] = useState('');
  const [loadingStage, setLoadingStage] = useState(0); // 0: Fetch, 1: AI, 2: Finalize
  const [error, setError] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [comparison, setComparison] = useState<ComparisonAnalysis | null>(null);
  
  const [profile1, setProfile1] = useState<GitHubProfile | null>(null);
  const [profile2, setProfile2] = useState<GitHubProfile | null>(null);
  
  const [repos1, setRepos1] = useState<Repository[]>([]);
  const [repos2, setRepos2] = useState<Repository[]>([]);

  const [sub, setSub] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem('devlens_sub');
    return saved ? JSON.parse(saved) : { tier: 'FREE', creditsRemaining: FREE_LIMIT, totalAnalyses: 0 };
  });

  const [folders, setFolders] = useState<PipelineFolder[]>(() => {
    const saved = localStorage.getItem('devlens_pipeline');
    return saved ? JSON.parse(saved) : [];
  });

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPipelineManagerOpen, setIsPipelineManagerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('devlens_sub', JSON.stringify(sub));
  }, [sub]);

  useEffect(() => {
    localStorage.setItem('devlens_pipeline', JSON.stringify(folders));
  }, [folders]);

  const fetchGitHubData = async (user: string) => {
    const [pRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=15`)
    ]);
    if (!pRes.ok) throw new Error(`User @${user} not found on GitHub Satellite.`);
    return { p: await pRes.json(), r: await rRes.json() };
  };

  const handleAnalyze = async () => {
    if (!username1.trim()) return;
    if (isCompareMode && !username2.trim()) return;

    if (sub.tier === 'FREE' && sub.creditsRemaining <= 0) {
      setIsPricingOpen(true);
      return;
    }
    
    setStatus(AppStatus.LOADING);
    setError(null);
    setComparison(null);
    setAnalysis(null);
    
    try {
      if (isCompareMode) {
        setLoadingStage(0);
        setLoadingMessage('Establishing Uplink');
        setLoadingSubMessage('Requesting secure GitHub API handshake and mapping dual identities...');
        
        const [d1, d2] = await Promise.all([
          fetchGitHubData(username1),
          fetchGitHubData(username2)
        ]);
        
        setProfile1(d1.p);
        setRepos1(d1.r);
        setProfile2(d2.p);
        setRepos2(d2.r);
        
        setLoadingStage(1);
        setLoadingMessage('Combat Simulation');
        setLoadingSubMessage('Synthesizing technical DNA. Running side-by-side performance audits...');
        const compResult = await compareProfiles(username1, username2, jdInput);
        setComparison(compResult);
      } else {
        setLoadingStage(0);
        setLoadingMessage('Fetching Profile Intel');
        setLoadingSubMessage('Accessing repository metadata and contribution history shards...');
        const d1 = await fetchGitHubData(username1);
        setProfile1(d1.p);
        setRepos1(d1.r);
        
        setLoadingStage(1);
        setLoadingMessage('Neural AI Analysis');
        setLoadingSubMessage('Gemini 3 probing skill matrix, coding consistency, and technical seniority...');
        const aiResult = await analyzeProfile(username1);
        setAnalysis(aiResult);
      }
      
      setLoadingStage(2);
      setLoadingMessage('Finalizing Dossier');
      setLoadingSubMessage('Packaging encrypted intelligence for executive recruitment review...');
      
      await new Promise(resolve => setTimeout(resolve, 1200));

      setSub(prev => ({
        ...prev,
        creditsRemaining: prev.tier === 'PRO' ? prev.creditsRemaining : Math.max(0, prev.creditsRemaining - 1),
        totalAnalyses: prev.totalAnalyses + 1
      }));
      
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Critical failure during neural probe.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: PipelineFolder = {
      id: Date.now().toString(),
      name,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      candidates: []
    };
    setFolders([...folders, newFolder]);
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
  };

  const handleAddToPipeline = (folderId: string, candidate: SavedCandidate) => {
    setFolders(folders.map(f => {
      if (f.id === folderId) {
        if (f.candidates.some(c => c.username === candidate.username)) return f;
        return { ...f, candidates: [...f.candidates, candidate] };
      }
      return f;
    }));
  };

  const handleRemoveCandidate = (folderId: string, username: string) => {
    setFolders(folders.map(f => {
      if (f.id === folderId) {
        return { ...f, candidates: f.candidates.filter(c => c.username !== username) };
      }
      return f;
    }));
  };

  const renderLoadingScreen = () => {
    const stages = [
      { 
        name: 'Data Extraction', 
        icon: Database, 
        color: 'text-blue-500', 
        log: 'Scanning GitHub public nodes. Mapping repo trees and commit density...',
        accent: 'bg-blue-500/10'
      },
      { 
        name: isCompareMode ? 'Comparison Simulation' : 'AI Neural Audit', 
        icon: isCompareMode ? Swords : Cpu, 
        color: isCompareMode ? 'text-red-500' : 'text-purple-500', 
        log: isCompareMode ? 'Running battle simulation. Weighing technical superiority and stack alignment...' : 'Analyzing code syntax patterns. Gemini-3 probing for seniority indicators...',
        accent: isCompareMode ? 'bg-red-500/10' : 'bg-purple-500/10'
      },
      { 
        name: 'Final Synthesis', 
        icon: ShieldCheck, 
        color: 'text-emerald-500', 
        log: 'Generating Dossier report blocks. Compiling executive recommendations...',
        accent: 'bg-emerald-500/10'
      }
    ];

    const current = stages[loadingStage] || stages[0];
    const progressPercent = ((loadingStage + 1) / stages.length) * 100;

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto px-6">
        {/* Tactical Visualizer */}
        <div className="relative mb-20 group">
          <div className="absolute inset-0 rounded-full border border-slate-800 animate-pulse-ring scale-150 opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-slate-700 animate-spin opacity-30" style={{ animationDuration: '12s' }}></div>
          
          <div className="relative z-10 w-64 h-64 rounded-full bg-slate-900 border-2 border-slate-800 shadow-[0_0_80px_rgba(37,99,235,0.1)] flex items-center justify-center overflow-hidden">
            {/* Background Digital Rain Effect (Subtle) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-grid-slate-700/[0.1] [mask-image:radial-gradient(white,transparent)]"></div>
            </div>
            
            {/* Scanning Bar Animation */}
            <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent ${loadingStage === 1 ? 'via-red-500/10' : 'via-blue-500/20'} to-transparent animate-scan z-0`}></div>
            
            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className={`transition-all duration-700 transform ${loadingStage === 1 ? 'scale-110' : 'scale-100'}`}>
                 <current.icon 
                   className={`${current.color} ${loadingStage === 1 ? (isCompareMode ? 'animate-bounce' : 'animate-pulse') : loadingStage === 2 ? 'animate-spin' : 'animate-pulse'}`} 
                   size={80} 
                   strokeWidth={1.5}
                 />
              </div>
              
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === loadingStage ? `${current.color} scale-125 shadow-lg shadow-current` : 'bg-slate-800'}`}></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Orbital Data Shards */}
          <div className="absolute top-0 left-0 w-full h-full animate-spin-slow pointer-events-none">
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500/20 rounded-lg backdrop-blur-md border border-blue-500/30 flex items-center justify-center">
               <Globe size={14} className="text-blue-400" />
             </div>
          </div>
        </div>

        {/* Textual Feedback */}
        <div className="text-center w-full space-y-10">
          <div className="space-y-3">
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter animate-glitch" data-text={loadingMessage}>
              {loadingMessage}
            </h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.6em] h-5 opacity-80">
              {loadingSubMessage}
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="relative max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-3">
                <Activity size={14} className="text-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Link Latency: 24ms</span>
              </div>
              <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{Math.round(progressPercent)}% SYNCED</span>
            </div>
            
            <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden p-0.5 border border-slate-800/50 shadow-inner">
               <div 
                 className={`h-full bg-gradient-to-r from-blue-700 via-blue-400 to-blue-200 rounded-full transition-all duration-1000 ease-in-out relative`}
                 style={{ width: `${progressPercent}%` }}
               >
                 <div className="absolute inset-0 bg-white/10 animate-data-flow"></div>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-400 blur-2xl opacity-60"></div>
               </div>
            </div>
          </div>

          {/* Operational Log Console */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-left backdrop-blur-xl relative overflow-hidden group max-w-3xl mx-auto">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${loadingStage === 1 && isCompareMode ? 'bg-red-500' : 'bg-blue-600'} transition-all`}></div>
            <div className="flex gap-6 items-start">
              <div className={`p-4 rounded-2xl ${current.accent} ${current.color} shrink-0 shadow-lg`}>
                <Terminal size={24} />
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operational Terminal v4.0.2</p>
                   <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-[9px] font-mono text-slate-600 uppercase">Status: Nominal</span>
                   </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                  {current.log}
                </p>
                <div className="flex gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Code size={12} className="text-slate-600" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">API: GitHub-v3</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers size={12} className="text-slate-600" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Model: Gemini-3-Pro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Granular Stepper */}
          <div className="flex items-center justify-between px-6 max-w-2xl mx-auto pt-4">
            {stages.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-4 group cursor-default">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-1000 ${
                    i < loadingStage ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.15)]' :
                    i === loadingStage ? `bg-blue-600/10 border-blue-500 ${current.color} shadow-[0_0_40px_rgba(37,99,235,0.25)] scale-110` :
                    'bg-slate-900 border-slate-800 text-slate-700'
                  }`}>
                    {i < loadingStage ? <ShieldCheck size={32} /> : <s.icon size={28} />}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-700 ${i <= loadingStage ? 'text-slate-300' : 'text-slate-700'}`}>
                    {s.name}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-800 relative mx-4 rounded-full overflow-hidden">
                    {i < loadingStage && <div className="absolute inset-0 bg-emerald-500"></div>}
                    {i === loadingStage && <div className="absolute inset-0 bg-blue-500 animate-data-flow"></div>}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f1a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                <Terminal className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white italic uppercase">DevLens</h1>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">Neural Intelligence Engine</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-slate-800">
              <button 
                onClick={() => setIsPipelineManagerOpen(true)}
                className="flex flex-col items-start group"
              >
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Talent Pipeline</span>
                <div className="flex items-center gap-2">
                  <Folders size={14} className="text-blue-500" />
                  <span className="text-xs font-bold text-slate-300">
                    {folders.reduce((acc, f) => acc + f.candidates.length, 0)} Saved
                  </span>
                </div>
              </button>
              <div className="h-8 w-px bg-slate-800"></div>
              <button 
                onClick={() => setIsPricingOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${sub.tier === 'PRO' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black'}`}
              >
                {sub.tier === 'PRO' ? <Shield size={12} fill="currentColor" /> : <Crown size={12} fill="currentColor" />}
                {sub.tier === 'PRO' ? 'Active Pro' : 'Go Pro'}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full max-w-2xl">
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Github size={16} />
                </div>
                <input 
                  type="text"
                  value={username1}
                  onChange={(e) => setUsername1(e.target.value)}
                  placeholder="Primary Subject"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {isCompareMode && (
                <>
                  <Swords className="text-slate-600 shrink-0 animate-pulse" size={16} />
                  <div className="relative flex-1 animate-in slide-in-from-right duration-300">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Github size={16} />
                    </div>
                    <input 
                      type="text"
                      value={username2}
                      onChange={(e) => setUsername2(e.target.value)}
                      placeholder="Opponent Subject"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`p-2.5 rounded-xl border transition-all ${isCompareMode ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                title="Toggle Battle Mode"
              >
                <Users size={18} />
              </button>
              {isCompareMode && (
                <button 
                  onClick={() => setIsJdOpen(!isJdOpen)}
                  className={`p-2.5 rounded-xl border transition-all ${jdInput ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  title="Attach Job Description"
                >
                  <ClipboardList size={18} />
                </button>
              )}
              <button 
                onClick={handleAnalyze}
                disabled={status === AppStatus.LOADING}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {status === AppStatus.LOADING ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {isCompareMode ? 'Battle' : 'Inspect'}
              </button>
            </div>
          </div>
        </div>
        
        {isCompareMode && isJdOpen && (
          <div className="max-w-7xl mx-auto mt-4 animate-in slide-in-from-top duration-300">
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col gap-3 backdrop-blur-md">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Target size={12} /> Recruitment Context Payload
                 </p>
                 <button onClick={() => setIsJdOpen(false)}><X size={14} className="text-slate-500 hover:text-white" /></button>
               </div>
               <textarea 
                  value={jdInput}
                  onChange={(e) => setJdInput(e.target.value)}
                  placeholder="Paste Job Description for specialized fit analysis..."
                  className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-yellow-500 custom-scrollbar"
               />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {status === AppStatus.LOADING && renderLoadingScreen()}

        {status === AppStatus.ERROR && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in duration-300">
            <Fingerprint className="text-red-500 mb-6" size={64} />
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">System Malfunction</h2>
            <p className="text-slate-400 max-w-md text-sm mb-8 italic">{error}</p>
            <button onClick={handleAnalyze} className="bg-slate-800 border border-slate-700 px-10 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-all">Retry Probe</button>
          </div>
        )}

        {status === AppStatus.SUCCESS && (
          <div className="space-y-8">
            {isCompareMode && comparison && profile1 && profile2 ? (
              <ComparisonDashboard 
                comparison={comparison} 
                p1={profile1} 
                p2={profile2} 
                r1={repos1} 
                r2={repos2} 
              />
            ) : (
              analysis && profile1 && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-8 space-y-8">
                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 no-print">
                         <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${sub.tier === 'PRO' ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                            {sub.tier === 'PRO' ? <Crown size={12} fill="currentColor" /> : <Shield size={12} />}
                            {sub.tier} Account
                         </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <img src={profile1.avatar_url} className="w-36 h-36 rounded-[2.5rem] shadow-2xl border-4 border-slate-700 group-hover:scale-105 transition-transform duration-500" alt="" />
                        <div className="flex-1">
                          <h2 className="text-5xl font-black text-white mb-2 italic uppercase tracking-tighter leading-none">{profile1.name || profile1.login}</h2>
                          <p className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">
                             <Github size={20} /> @{profile1.login}
                          </p>
                          <p className="text-slate-300 text-lg leading-relaxed italic border-l-4 border-blue-500/30 pl-6">{profile1.bio || "Subject is operating under radio silence (No bio)."}</p>
                          <div className="flex flex-wrap gap-8 mt-10">
                            {[
                              { label: 'Repos', val: profile1.public_repos },
                              { label: 'Followers', val: profile1.followers },
                              { label: 'Following', val: profile1.following }
                            ].map(stat => (
                              <div key={stat.label}>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-white">{stat.val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <AnalysisDashboard 
                      analysis={analysis} 
                      repositories={repos1} 
                      isPro={sub.tier === 'PRO'}
                      onUpgradeClick={() => setIsPricingOpen(true)}
                      username={profile1.login}
                      folders={folders}
                      onAddToPipeline={handleAddToPipeline}
                      onCreateFolder={handleCreateFolder}
                    />
                  </div>
                  <div className="xl:col-span-4 lg:sticky lg:top-28 h-fit lg:max-h-[calc(100vh-10rem)] no-print">
                    <div className="h-[600px]">
                      <ChatWidget username={profile1.login} />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {status === AppStatus.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto space-y-12">
            <div className="bg-blue-600/10 p-12 rounded-[4rem] relative group border border-blue-500/10">
              <Github className="text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700" size={100} />
              <div className="absolute -bottom-6 -right-6 bg-yellow-500 p-5 rounded-[2rem] shadow-2xl shadow-yellow-900/40 border-4 border-[#0b0f1a]">
                 <Crown className="text-black" size={40} fill="currentColor" />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.85]">
                Neural <br/> <span className="text-blue-500">Recruitment</span> <br/> Intelligence
              </h2>
              <p className="text-slate-400 text-xl leading-relaxed italic max-w-2xl mx-auto font-medium">
                Deep-probe GitHub profiles with Gemini 3. Audit skills, predict seniority, and compare technical DNA across repositories.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
               <button onClick={handleAnalyze} className="bg-blue-600 hover:bg-blue-500 px-12 py-6 rounded-[2rem] font-black text-white shadow-2xl shadow-blue-500/30 uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4">
                 <Sparkles size={24} />
                 Probe Sector
               </button>
               <button onClick={() => setIsCompareMode(true)} className="bg-slate-800 hover:bg-slate-700 px-12 py-6 rounded-[2rem] font-black text-white border border-slate-700 uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4">
                 <Swords size={24} />
                 Tactical Battle
               </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      {isPipelineManagerOpen && (
        <PipelineManager 
          folders={folders}
          onClose={() => setIsPipelineManagerOpen(false)}
          onDeleteFolder={handleDeleteFolder}
          onRemoveCandidate={handleRemoveCandidate}
        />
      )}

      <footer className="py-12 border-t border-slate-800 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.6em] bg-slate-900/30">
        DevLens // Advanced Neural Sourcing Unit // Gemini 3 Logic Engine Active
      </footer>
    </div>
  );
}

export default App;