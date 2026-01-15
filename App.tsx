
import React, { useState, useEffect, useRef } from 'react';
import { Github, Terminal, Loader2, Sparkles, Swords, Users, Target, Folders, Database, ShieldCheck, Fingerprint, Star, GitFork, Sun, Moon, Zap, Shield, Cpu, Activity, ChevronRight, Crown, Search, Wifi, Box, Globe, Lock, ShieldAlert, Laptop, FileText, AlertCircle, Cpu as CpuIcon, Layers, Network, LogOut, LogIn } from 'lucide-react';
import { analyzeProfile, compareProfiles } from './services/geminiService';
import { fetchUserProfile, syncUserProfile, fetchFolders, syncFolders, supabase, signInWithGitHub, signOut } from './services/supabaseService';
import { AppStatus, AIAnalysis, GitHubProfile, Repository, ComparisonAnalysis, UserSubscription, PipelineFolder, SavedCandidate } from './types';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatWidget } from './components/ChatWidget';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { PricingModal } from './components/PricingModal';
import { PipelineManager } from './components/PipelineManager';

const DEFAULT_FREE_LIMIT = 10;

export default function App() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [username1, setUsername1] = useState('gaearon'); 
  const [username2, setUsername2] = useState('danabramov');
  const [assessmentContext, setAssessmentContext] = useState('- Priority: Senior React Expertise\n- Requirement: Open Source contributor\n- Context: Looking for a core architecture lead.');
  const [isCompareMode, setIsCompareMode] = useState(false);
  
  const [theme, setTheme] = useState(() => localStorage.getItem('devlens_theme') || 'dark');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [loadingMessage, setLoadingMessage] = useState('FETCHING GITHUB DATA');
  const [loadingSubMessage, setLoadingSubMessage] = useState('INITIALIZING NEURAL UPLINK...');
  const [loadingStage, setLoadingStage] = useState(0); 
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [comparison, setComparison] = useState<ComparisonAnalysis | null>(null);
  const [profile1, setProfile1] = useState<GitHubProfile | null>(null);
  const [profile2, setProfile2] = useState<GitHubProfile | null>(null);
  const [repos1, setRepos1] = useState<Repository[]>([]);
  const [repos2, setRepos2] = useState<Repository[]>([]);

  const [sub, setSub] = useState<UserSubscription>({ 
    tier: 'FREE', 
    creditsRemaining: DEFAULT_FREE_LIMIT, 
    totalAnalyses: 0 
  });

  const [folders, setFolders] = useState<PipelineFolder[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPipelineManagerOpen, setIsPipelineManagerOpen] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Data Initialization
  useEffect(() => {
    if (!sessionUser) {
      if (isInitialized) {
        setSub({ tier: 'FREE', creditsRemaining: DEFAULT_FREE_LIMIT, totalAnalyses: 0 });
        setFolders([]);
      }
      return;
    }

    const init = async () => {
      try {
        const remoteSub = await fetchUserProfile();
        const remoteFolders = await fetchFolders();
        if (remoteSub) setSub(remoteSub);
        if (remoteFolders) setFolders(remoteFolders || []);
      } catch (err) {
        console.warn("Supabase initial link deferred.");
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, [sessionUser]);

  // Secure Cloud Sync Logic
  useEffect(() => {
    if (!isInitialized || !sessionUser) return;
    const sync = async () => {
      try {
        await syncUserProfile(sub);
        await syncFolders(folders);
      } catch (err) {
        console.error("Tactical Sync Error:", err);
      }
    };
    const timer = setTimeout(sync, 2000); 
    return () => clearTimeout(timer);
  }, [sub, folders, isInitialized, sessionUser]);

  useEffect(() => {
    localStorage.setItem('devlens_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-12));
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const fetchGitHubData = async (user: string) => {
    addLog(`GET /users/${user} - Requesting Core Profile...`);
    const [pRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=15`)
    ]);
    if (!pRes.ok) throw new Error(`Subject @${user} not found in database.`);
    addLog(`SUCCESS: Received payload for @${user}`);
    return { p: await pRes.json(), r: await rRes.json() };
  };

  const handleAnalyze = async () => {
    if (!username1.trim()) return;
    if (sub.creditsRemaining <= 0 && sub.tier === 'FREE') {
      setIsPricingOpen(true);
      return;
    }
    setStatus(AppStatus.LOADING);
    setTerminalLogs([]);
    setLoadingProgress(0);
    setError(null);
    try {
      setLoadingStage(0);
      setLoadingProgress(10);
      setLoadingMessage('ACQUISITION_INITIALIZED');
      setLoadingSubMessage('SYNCHRONIZING REPOSITORY TREES...');
      addLog("Initializing Neural Sourcing Protocol v5.0.1");
      addLog(`Connecting to subject: @${username1}`);
      
      const d1 = await fetchGitHubData(username1);
      setProfile1(d1.p);
      setRepos1(d1.r);
      setLoadingProgress(33);
      
      await new Promise(r => setTimeout(r, 600));
      setLoadingStage(1);
      setLoadingMessage('NEURAL_AUDIT_ACTIVE');
      setLoadingSubMessage('DECRYPTING CODING DNA VIA GEMINI 3...');
      addLog("Telemetry burst sent to Gemini Logic Engine...");
      setLoadingProgress(45);
      
      const aiResult = await analyzeProfile(username1);
      setAnalysis(aiResult);
      addLog("Analysis payload received. Processing skill matrix...");
      setLoadingProgress(66);
      
      await new Promise(r => setTimeout(r, 600));
      setLoadingStage(2);
      setLoadingMessage('TACTICAL_SYNTHESIS');
      setLoadingSubMessage('COMPILING INTELLIGENCE DOSSIER...');
      addLog("Evaluating seniority vectors and tech stack DNA...");
      setLoadingProgress(85);
      
      setSub(prev => ({
        ...prev,
        creditsRemaining: prev.tier === 'PRO' ? prev.creditsRemaining : Math.max(0, prev.creditsRemaining - 1),
        totalAnalyses: prev.totalAnalyses + 1
      }));
      
      addLog("Mission Complete. Visualizing output...");
      setLoadingProgress(100);
      await new Promise(r => setTimeout(r, 800)); 
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      setError(e.message);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleCompare = async () => {
    if (!username1.trim() || !username2.trim()) return;
    setStatus(AppStatus.LOADING);
    setTerminalLogs([]);
    setLoadingProgress(0);
    setError(null);
    try {
      setLoadingStage(0);
      setLoadingProgress(10);
      setLoadingMessage('DUAL_TARGET_ACQUISITION');
      setLoadingSubMessage('SYNCHRONIZING DUAL GITHUB STREAMS...');
      addLog(`Engaging Battle Mode: @${username1} vs @${username2}`);
      
      const [d1, d2] = await Promise.all([fetchGitHubData(username1), fetchGitHubData(username2)]);
      setProfile1(d1.p); setRepos1(d1.r);
      setProfile2(d2.p); setRepos2(d2.r);
      setLoadingProgress(33);
      
      await new Promise(r => setTimeout(r, 600));
      setLoadingStage(1);
      setLoadingMessage('COMBAT_SIMULATION');
      setLoadingSubMessage('CALCULATING STRATEGIC SUPERIORITY...');
      addLog("Injecting mission context into Gemini Reasoning Engine...");
      setLoadingProgress(45);
      
      const compResult = await compareProfiles(username1, username2, assessmentContext);
      setComparison(compResult);
      addLog("Comparison matrix finalized. Determining winner...");
      setLoadingProgress(66);
      
      await new Promise(r => setTimeout(r, 600));
      setLoadingStage(2);
      setLoadingMessage('VERDICT_SYNTHESIS');
      setLoadingSubMessage('FINALIZING COMMAND REPORT...');
      addLog("Formulating tactical rationale for selection...");
      setLoadingProgress(85);
      
      addLog("Battle simulation concluded.");
      setLoadingProgress(100);
      await new Promise(r => setTimeout(r, 800)); 
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      setError(e.message);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleAddToPipeline = (folderId: string, candidate: SavedCandidate) => {
    setFolders(prev => prev.map(f => 
      f.id === folderId 
        ? { ...f, candidates: [...f.candidates.filter(c => c.username !== candidate.username), candidate] } 
        : f
    ));
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: PipelineFolder = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][folders.length % 5],
      candidates: []
    };
    setFolders(prev => [...prev, newFolder]);
  };

  if (!sessionUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 grid-pattern transition-colors duration-500 bg-[#080b14] text-white overflow-hidden relative crt-overlay">
         <div className="scanner-laser"></div>
         
         <div className="relative mb-12 animate-float">
            <div className="absolute inset-0 bg-blue-600 blur-[150px] opacity-20 animate-pulse-slow"></div>
            <div className="relative w-56 h-56 rounded-[3.5rem] border border-white/10 flex items-center justify-center backdrop-blur-md bg-white/[0.02] shadow-[0_0_100px_rgba(59,130,246,0.1)] group">
               <Terminal size={100} strokeWidth={1} className="text-blue-500 transition-transform group-hover:scale-110 duration-700" />
               <div className="absolute inset-0 border border-blue-500/20 rounded-[3.5rem] animate-ping scale-75 opacity-20"></div>
            </div>
         </div>

         <div className="text-center space-y-4 mb-16 relative z-10">
           <span className="text-[12px] font-black uppercase text-blue-500 tracking-[0.8em] block mb-2 animate-pulse">Neural Access Protocol</span>
           <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-2xl">Entry Required</h1>
           <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.4em] max-w-sm mx-auto leading-relaxed mt-6">Autentique sua identidade via GitHub para inicializar o motor neural DevLens.</p>
         </div>

         <button 
           onClick={signInWithGitHub}
           className="group relative px-16 py-6 bg-white text-black rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:scale-105 hover:bg-slate-100 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] flex items-center gap-6 overflow-hidden"
         >
           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
           <Github size={24} fill="currentColor" />
           Sign in with GitHub
         </button>

         <div className="mt-20 flex gap-12 items-center opacity-30 grayscale transition-all hover:opacity-60 hover:grayscale-0">
            <div className="flex flex-col items-center gap-2">
              <Lock size={20} className="text-blue-500" />
              <span className="text-[7px] font-black uppercase tracking-widest">Encrypted</span>
            </div>
            <div className="h-px w-20 bg-slate-800"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.5em] font-mono text-slate-500">Neural Security Verified</span>
            <div className="h-px w-20 bg-slate-800"></div>
            <div className="flex flex-col items-center gap-2">
              <Shield size={20} className="text-emerald-500" />
              <span className="text-[7px] font-black uppercase tracking-widest">Protected</span>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen selection:bg-blue-500/30 overflow-x-hidden flex flex-col grid-pattern transition-colors duration-500 ${theme === 'dark' ? 'bg-[#080b14] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <header className={`fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-xl border-b flex items-center px-6 transition-all duration-500 ${theme === 'dark' ? 'bg-[#080b14]/90 border-white/5' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center gap-3 w-1/4">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
            <Terminal size={14} className="text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xs font-black italic uppercase tracking-tighter leading-none">DevLens</span>
            <span className="text-[7px] font-bold text-blue-500 uppercase tracking-widest">Neural Intelligence</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center gap-6">
          <button onClick={() => setIsPipelineManagerOpen(true)} className="flex items-center gap-2 group transition-all">
             <Folders size={14} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
             <div className="flex flex-col -space-y-1 text-left">
               <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">Pipeline</span>
               <span className="text-[10px] font-bold">{folders.reduce((acc, f) => acc + f.candidates.length, 0)} Targets</span>
             </div>
          </button>

          <button onClick={() => setIsPricingOpen(true)} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 hover:bg-amber-500/20 transition-all group">
            <Crown size={12} className="text-amber-500 transition-transform group-hover:scale-110" fill="currentColor" />
            <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Upgrade Intel</span>
          </button>

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
            <input 
              type="text"
              value={username1}
              onChange={(e) => setUsername1(e.target.value)}
              placeholder="TARGET USERNAME"
              className={`w-full border rounded-full py-1.5 pl-9 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all ${theme === 'dark' ? 'bg-slate-900/60 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
            />
          </div>
        </div>

        <div className="w-1/4 flex justify-end gap-3 items-center">
           <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-500/10 transition-colors">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
           </button>
           
           <div className="h-6 w-px bg-slate-500/20 mx-2"></div>

           <div className="flex items-center gap-3">
              <div className="flex flex-col items-end -space-y-1">
                 <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[80px]">@{sessionUser.user_metadata.user_name || sessionUser.email.split('@')[0]}</span>
                 <button onClick={signOut} className="text-[7px] font-bold text-red-500 uppercase tracking-[0.2em] hover:text-red-400 transition-colors flex items-center gap-1">
                    <LogOut size={8} /> Logout
                 </button>
              </div>
              <img 
                src={sessionUser.user_metadata.avatar_url || `https://github.com/${sessionUser.user_metadata.user_name}.png`} 
                className="w-8 h-8 rounded-lg border border-white/10 shadow-lg" 
                alt="" 
              />
           </div>

           <button 
             onClick={isCompareMode ? handleCompare : handleAnalyze}
             disabled={status === AppStatus.LOADING}
             className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.25em] flex items-center gap-2 transition-all btn-glow disabled:opacity-50 shadow-lg shadow-blue-500/30"
           >
             {status === AppStatus.LOADING ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
             Inspecionar
           </button>
        </div>
      </header>

      <main className="pt-14 flex-1 flex flex-col relative">
        {status === AppStatus.LOADING && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080b14] crt-overlay neural-mesh animate-matrix-scroll overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 animate-scanline"></div>
             </div>

             <div className="relative mb-20">
                {/* Orbital Hologram Rings */}
                <div className="absolute -inset-40 border-2 border-dashed border-blue-500/10 rounded-full animate-spin-slow"></div>
                <div className="absolute -inset-32 border border-blue-400/20 rounded-full animate-spin-reverse opacity-60"></div>
                <div className="absolute -inset-24 border-2 border-blue-600/30 rounded-full animate-spin-slow"></div>
                
                {/* Central Core */}
                <div className="relative w-64 h-64 rounded-full border-2 border-white/10 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-3xl shadow-[0_0_120px_rgba(59,130,246,0.3)] transition-all duration-1000 scale-125">
                   <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse-slow"></div>
                   
                   {loadingStage === 0 && <Database size={90} className="text-blue-500 animate-pulse drop-shadow-[0_0_15px_#3b82f6]" />}
                   {loadingStage === 1 && <CpuIcon size={90} className="text-blue-500 animate-pulse drop-shadow-[0_0_15px_#3b82f6]" />}
                   {loadingStage === 2 && <ShieldCheck size={90} className="text-blue-500 animate-pulse drop-shadow-[0_0_15px_#3b82f6]" />}
                   
                   <div className="mt-6 flex flex-col items-center">
                      <div className="flex gap-2">
                        <div className={`w-2 h-2 rounded-full transition-all duration-700 ${loadingStage >= 0 ? 'bg-blue-400 shadow-[0_0_12px_#3b82f6]' : 'bg-slate-800'}`}></div>
                        <div className={`w-2 h-2 rounded-full transition-all duration-700 ${loadingStage >= 1 ? 'bg-blue-400 shadow-[0_0_12px_#3b82f6]' : 'bg-slate-800'}`}></div>
                        <div className={`w-2 h-2 rounded-full transition-all duration-700 ${loadingStage >= 2 ? 'bg-blue-400 shadow-[0_0_12px_#3b82f6]' : 'bg-slate-800'}`}></div>
                      </div>
                      <span className="text-[10px] font-black text-blue-500/70 uppercase tracking-[0.4em] mt-4 font-mono">Neural_Phase: 0{loadingStage + 1}</span>
                   </div>

                   {/* Orbital Shards */}
                   {[0, 72, 144, 216, 288].map((angle, i) => (
                     <div 
                       key={i} 
                       className="absolute w-2 h-2 bg-blue-400 rounded-sm shadow-[0_0_8px_#3b82f6] animate-pulse"
                       style={{ 
                         transform: `rotate(${angle}deg) translateY(-140px)`,
                         animationDelay: `${i * 200}ms`
                       }}
                     />
                   ))}
                </div>
             </div>

             <div className="text-center space-y-4 mb-20 z-10 px-6">
                <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-white glitch-text">
                  {loadingMessage.replace('_', ' ')}
                </h2>
                <div className="flex items-center justify-center gap-8">
                  <div className="h-[2px] w-24 bg-gradient-to-r from-transparent to-blue-500/40"></div>
                  <p className="text-[14px] font-black uppercase tracking-[0.8em] text-blue-500 animate-pulse font-mono">{loadingSubMessage}</p>
                  <div className="h-[2px] w-24 bg-gradient-to-l from-transparent to-blue-500/40"></div>
                </div>
             </div>

             <div className="w-full max-w-4xl px-12 mb-16 relative">
                <div className="flex justify-between mb-3 px-2">
                  <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.3em] font-mono">INTEGRITY_INDEX</span>
                  <span className="text-[12px] font-black text-blue-400 uppercase tracking-widest font-mono">{(loadingProgress / 100).toFixed(2)}_NEURONS</span>
                </div>
                <div className="w-full h-4 rounded-full overflow-hidden p-[2px] relative bg-slate-900 border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                   <div 
                      className="h-full bg-gradient-to-r from-blue-900 via-blue-500 to-blue-300 transition-all duration-[800ms] ease-out shadow-[0_0_30px_rgba(59,130,246,0.8)] rounded-full relative z-10" 
                      style={{ width: `${loadingProgress}%` }}
                   >
                     <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-matrix-scroll"></div>
                   </div>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-600 uppercase tracking-[0.6em]">System Initializing... Please Stand By</div>
             </div>

             <div className="w-full max-w-3xl bg-black/80 backdrop-blur-3xl rounded-3xl border-2 border-white/5 p-8 font-mono text-[11px] overflow-hidden transition-all duration-500 shadow-2xl">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                   <div className="flex gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500/60 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/60 animate-pulse"></div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-slate-500 uppercase tracking-widest text-[9px] font-black">Uplink: STABLE</span>
                      <div className="w-px h-3 bg-white/10"></div>
                      <span className="text-blue-500/50 uppercase tracking-widest text-[9px] font-black">Neural_IO_V5</span>
                   </div>
                </div>
                <div ref={terminalRef} className="space-y-2 text-blue-400/90 h-44 overflow-hidden flex flex-col justify-end">
                   {terminalLogs.map((log, i) => (
                     <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                       <span className="text-blue-600 font-black shrink-0 select-none opacity-40">>></span>
                       <span className="break-all tracking-tight leading-none font-medium">{log}</span>
                     </div>
                   ))}
                   <div className="flex gap-4 animate-pulse pt-2">
                      <span className="text-blue-600 font-black opacity-80">>></span>
                      <span className="w-3 h-4 bg-blue-500/40"></span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {status === AppStatus.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000 relative">
            <div className="relative mb-12 animate-float">
               <div className="absolute inset-0 bg-blue-600 blur-[150px] opacity-10 animate-pulse-slow"></div>
               <div className={`relative w-56 h-56 rounded-[3.5rem] border flex items-center justify-center backdrop-blur-sm group shadow-2xl transition-all ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-white/60'}`}>
                  <Github size={120} strokeWidth={1} className="text-blue-500 transition-transform group-hover:scale-105 duration-500" />
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 p-3 rounded-2xl shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-amber-500/30">
                     <Crown size={36} className="text-black" fill="currentColor" />
                  </div>
               </div>
            </div>

            <div className="text-center space-y-0 mb-10">
              <span className="text-[11px] font-black uppercase text-blue-500 tracking-[0.6em] block mb-6 animate-pulse">Neural Sourcing Protocol v5.0.1</span>
              <h1 className={`text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Inteligência</h1>
              <h1 className="text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] text-blue-600 drop-shadow-[0_0_40px_rgba(37,99,235,0.4)]">Recruitment</h1>
              <h1 className={`text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Neural</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-8 z-10">
              <button onClick={handleAnalyze} className="group relative px-20 py-6 bg-blue-600 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:scale-105 hover:bg-blue-500 shadow-[0_25px_50px_-15px_rgba(37,99,235,0.4)] text-white">
                Sondar Perfil
              </button>
              <button onClick={() => setIsCompareMode(!isCompareMode)} className={`px-20 py-6 border rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white/5 transition-all flex items-center gap-5 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200 bg-white shadow-sm'}`}>
                <Swords size={20} className="transition-transform group-hover:rotate-12" />
                Batalha Tática
              </button>
            </div>
            
            {isCompareMode && (
              <div className="mt-12 animate-in slide-in-from-top-6 flex flex-col gap-6 w-full max-w-2xl bg-slate-900/50 p-10 rounded-[3.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
                 <div className="flex gap-6">
                   <input 
                     value={username1}
                     onChange={(e) => setUsername1(e.target.value)}
                     placeholder="TARGET 1"
                     className={`flex-1 border rounded-[1.5rem] py-4 px-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all ${theme === 'dark' ? 'bg-slate-900/60 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
                   />
                   <div className="flex items-center text-slate-500 font-black italic tracking-tighter">VS</div>
                   <input 
                     value={username2}
                     onChange={(e) => setUsername2(e.target.value)}
                     placeholder="TARGET 2"
                     className={`flex-1 border rounded-[1.5rem] py-4 px-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all ${theme === 'dark' ? 'bg-slate-900/60 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
                   />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-3 ml-2">
                      <FileText size={14} className="text-blue-500" /> Mission Briefing (Job/Context)
                    </label>
                    <textarea 
                      value={assessmentContext}
                      onChange={(e) => setAssessmentContext(e.target.value)}
                      className="w-full h-36 bg-slate-900/80 border border-white/5 rounded-[2rem] p-6 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none transition-all"
                      placeholder="Paste technical requirements or assessment goals..."
                    />
                 </div>
                 <button onClick={handleCompare} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-full transition-all shadow-xl shadow-blue-500/30">
                   Iniciar Engajamento
                 </button>
              </div>
            )}
          </div>
        )}

        {status === AppStatus.SUCCESS && (
          <div className="max-w-[1400px] mx-auto w-full p-8 pb-20 animate-in slide-in-from-bottom-10 duration-700">
             {isCompareMode && comparison && profile1 && profile2 ? (
                <ComparisonDashboard comparison={comparison} p1={profile1} p2={profile2} r1={repos1} r2={repos2} />
             ) : (
                analysis && profile1 && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                       <div className={`border p-12 rounded-[4rem] flex flex-col md:flex-row gap-12 items-center md:items-start relative overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <div className="relative group">
                             <div className="absolute inset-0 bg-blue-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                             <img src={profile1.avatar_url} className="w-44 h-44 rounded-[3rem] border-4 border-slate-800 shadow-2xl relative z-10" alt="" />
                          </div>
                          <div className="flex-1 relative z-10">
                            <h2 className={`text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{profile1.name || profile1.login}</h2>
                            <p className="text-blue-500 font-black uppercase text-base tracking-[0.3em] mb-8 flex items-center gap-3">
                               <Github size={20} /> @{profile1.login}
                            </p>
                            <p className="italic text-lg leading-relaxed border-l-4 border-blue-600/40 pl-8 text-slate-400 font-medium">"{profile1.bio || "Neural DNA summary missing for this subject profile."}"</p>
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
                    <div className="xl:col-span-4 h-fit sticky top-24">
                       <ChatWidget username={profile1.login} />
                    </div>
                  </div>
                )
             )}
          </div>
        )}

        {status === AppStatus.ERROR && (
           <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse"></div>
                <ShieldAlert size={80} className="text-red-500 relative z-10 animate-bounce" />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Neural Link Severed</h2>
              <p className="text-slate-500 mt-3 font-bold uppercase text-xs tracking-widest">{error}</p>
              <button onClick={() => setStatus(AppStatus.IDLE)} className="mt-10 px-12 py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-xs rounded-full hover:bg-red-500/20 transition-all tracking-widest">Retry Mission</button>
           </div>
        )}
      </main>

      <footer className={`h-12 border-t flex items-center px-6 text-slate-500 text-[10px] font-mono uppercase tracking-[0.3em] transition-colors duration-500 ${theme === 'dark' ? 'border-white/5 bg-[#080b14]' : 'border-slate-200 bg-white'}`}>
        <div className="flex-1 flex items-center gap-10">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <span>GEMINI_3_PRO: ACTIVE</span>
           </div>
           <div className="flex items-center gap-3">
              <GitFork size={14} className="text-slate-600" />
              <span>GITHUB_API_v4: STABLE</span>
           </div>
        </div>
        <div className="flex items-center gap-10">
           <div className="flex items-center gap-3">
              <Wifi size={14} className="text-blue-500" />
              <span>LATENCY: 89MS</span>
           </div>
           <span className="opacity-50">© 2025 NEURAL OPERATIONS UNIT</span>
        </div>
      </footer>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      {isPipelineManagerOpen && (
        <PipelineManager 
          folders={folders} 
          onClose={() => setIsPipelineManagerOpen(false)} 
          onDeleteFolder={(id) => setFolders(folders.filter(f => f.id !== id))}
          onRemoveCandidate={(fId, user) => setFolders(folders.map(f => f.id === fId ? {...f, candidates: f.candidates.filter(c => c.username !== user)} : f))}
        />
      )}
    </div>
  );
}
