
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
  }, [sessionUser, isInitialized]);

  // Cloud Sync
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
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-8));
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
      setLoadingProgress(15);
      setLoadingMessage('FETCHING GITHUB DATA');
      setLoadingSubMessage('ACESSANDO ÁRVORES DE REPOSITÓRIOS...');
      addLog("Initializing Neural Sourcing Protocol v4.0.8");
      
      const d1 = await fetchGitHubData(username1);
      setProfile1(d1.p);
      setRepos1(d1.r);
      setLoadingProgress(35);
      
      await new Promise(r => setTimeout(r, 600));
      setLoadingStage(1);
      setLoadingMessage('NEURAL AI AUDIT');
      setLoadingSubMessage('GEMINI 3 PRO: DECRYPTING CODING DNA...');
      addLog("Telemetry burst sent to Gemini Logic Engine...");
      setLoadingProgress(55);
      
      const aiResult = await analyzeProfile(username1);
      setAnalysis(aiResult);
      addLog("Analysis payload received. Processing skill matrix...");
      setLoadingProgress(75);
      
      await new Promise(r => setTimeout(r, 600));
      setLoadingStage(2);
      setLoadingMessage('TACTICAL SYNTHESIS');
      setLoadingSubMessage('COMPILANDO DOSSIÊ DE INTELIGÊNCIA...');
      addLog("Evaluating seniority vectors and tech stack DNA...");
      setLoadingProgress(90);
      
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
      setLoadingProgress(15);
      setLoadingMessage('BATTLE DATA ACQUISITION');
      setLoadingSubMessage('SYNCHRONIZING DUAL GITHUB TARGETS...');
      addLog(`Engaging Dual Mode: @${username1} vs @${username2}`);
      
      const [d1, d2] = await Promise.all([fetchGitHubData(username1), fetchGitHubData(username2)]);
      setProfile1(d1.p); setRepos1(d1.r);
      setProfile2(d2.p); setRepos2(d2.r);
      setLoadingProgress(40);
      
      await new Promise(r => setTimeout(r, 600));
      setLoadingStage(1);
      setLoadingMessage('AI BATTLE SIMULATION');
      setLoadingSubMessage('GEMINI 3 PRO: CALCULANDO VANTAGEM TÁTICA...');
      addLog("Injecting mission context into Gemini Reasoning Engine...");
      setLoadingProgress(65);
      
      const compResult = await compareProfiles(username1, username2, assessmentContext);
      setComparison(compResult);
      addLog("Comparison matrix finalized. Determining winner...");
      setLoadingProgress(85);
      
      await new Promise(r => setTimeout(r, 600));
      setLoadingStage(2);
      setLoadingMessage('VERDICT SYNTHESIS');
      setLoadingSubMessage('SINTETIZANDO RELATÓRIO DE COMANDO...');
      addLog("Formulating tactical rationale for selection...");
      setLoadingProgress(95);
      
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

  // --- LOGIN SCREEN (DARK-OPS HIGH FIDELITY) ---
  if (!sessionUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 grid-pattern bg-[#080b14] text-white overflow-hidden relative">
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
         <button onClick={signInWithGitHub} className="group relative px-16 py-6 bg-white text-black rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:scale-105 hover:bg-slate-100 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] flex items-center gap-6 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
           <Github size={24} fill="currentColor" />
           Sign in with GitHub
         </button>
         <div className="mt-20 flex gap-12 items-center opacity-30 grayscale">
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
    <div className={`min-h-screen selection:bg-blue-500/30 overflow-x-hidden flex flex-col grid-pattern transition-colors duration-500 bg-[#080b14] text-white`}>
      
      {/* HEADER - REFINED TO MATCH SCREENSHOT */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl border-b border-white/5 flex items-center px-8 bg-[#080b14]/90">
        <div className="flex items-center gap-4 w-1/4">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
            <Terminal size={18} className="text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-sm font-black italic uppercase tracking-tighter leading-none">DevLens</span>
            <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Neural Intelligence Engine</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center gap-6">
          <button onClick={() => setIsPipelineManagerOpen(true)} className="flex items-center gap-2 group transition-all">
             <div className="flex flex-col -space-y-1 text-right">
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Talent Pipeline</span>
               <span className="text-[11px] font-bold text-white flex items-center gap-1"><Folders size={12} className="text-blue-500" /> {folders.reduce((acc, f) => acc + f.candidates.length, 0)} Salvos</span>
             </div>
          </button>

          <button onClick={() => setIsPricingOpen(true)} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-1.5 hover:bg-amber-500/20 transition-all group">
            <Crown size={12} className="text-amber-500 transition-transform group-hover:scale-110" fill="currentColor" />
            <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Go Pro</span>
          </button>

          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text"
              value={username1}
              onChange={(e) => setUsername1(e.target.value)}
              placeholder="gaearon"
              className="w-full border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all bg-slate-900/60 text-white"
            />
          </div>

          <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-500/10 transition-colors text-slate-400">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="h-8 w-px bg-white/10 mx-2"></div>

          <div className="flex items-center gap-3">
              <button onClick={signOut} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all text-slate-400 hover:text-red-400">
                <Users size={18} />
              </button>
          </div>

          <button 
             onClick={isCompareMode ? handleCompare : handleAnalyze}
             disabled={status === AppStatus.LOADING}
             className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 transition-all btn-glow disabled:opacity-50 shadow-lg shadow-blue-500/30"
           >
             {status === AppStatus.LOADING ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
             Inspecionar
          </button>
        </div>
      </header>

      <main className="pt-16 flex-1 flex flex-col relative">
        {/* LOADING STATE */}
        {status === AppStatus.LOADING && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-700 bg-[#080b14]">
             <div className="scanner-laser"></div>
             <div className="relative mb-16 scale-110">
                <div className="absolute -inset-24 border border-blue-500/10 rounded-full animate-spin-slow"></div>
                <div className="absolute -inset-16 border border-blue-500/5 rounded-full animate-spin-reverse opacity-40"></div>
                <div className={`relative w-48 h-48 rounded-full border-2 border-white/5 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-3xl shadow-[0_0_80px_rgba(59,130,246,0.15)] transition-all duration-1000 ${loadingStage === 1 ? 'scale-110 shadow-blue-500/30' : ''}`}>
                   {loadingStage === 0 && <Database size={72} className="text-blue-500 animate-pulse" />}
                   {loadingStage === 1 && <CpuIcon size={72} className="text-blue-500 animate-pulse" />}
                   {loadingStage === 2 && <ShieldCheck size={72} className="text-blue-500 animate-pulse" />}
                   <div className="mt-4 flex flex-col items-center">
                      <div className="flex gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${loadingStage >= 0 ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700'}`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${loadingStage >= 1 ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700'}`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${loadingStage >= 2 ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700'}`}></div>
                      </div>
                      <span className="text-[8px] font-black text-blue-500/50 uppercase tracking-[0.3em] mt-3">Tactical Stage {loadingStage + 1}</span>
                   </div>
                </div>
             </div>
             <div className="text-center space-y-4 mb-16 z-10">
                <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-white">{loadingMessage}</h2>
                <div className="flex items-center justify-center gap-6">
                  <div className="h-px w-20 bg-blue-500/20"></div>
                  <p className="text-[13px] font-black uppercase tracking-[0.6em] text-blue-500 animate-pulse">{loadingSubMessage}</p>
                  <div className="h-px w-20 bg-blue-500/20"></div>
                </div>
             </div>
             <div className="w-full max-w-3xl px-12 mb-12">
                <div className="flex justify-between mb-2 px-1">
                  <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest">Neural Sync</span>
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{Math.round(loadingProgress)}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden p-[1.5px] relative bg-slate-900 border border-white/5 shadow-inner">
                   <div className="h-full bg-gradient-to-r from-blue-800 via-blue-500 to-blue-400 transition-all duration-[800ms] ease-out shadow-[0_0_25px_rgba(59,130,246,0.6)] rounded-full relative z-10" style={{ width: `${loadingProgress}%` }}>
                     <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                   </div>
                </div>
             </div>
             <div className="w-full max-w-2xl bg-black/60 backdrop-blur-xl rounded-3xl border border-white/5 p-6 font-mono text-[10px] overflow-hidden transition-all duration-500">
                <div ref={terminalRef} className="space-y-1.5 text-blue-400/80 h-32 overflow-hidden flex flex-col justify-end">
                   {terminalLogs.map((log, i) => (
                     <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                       <span className="text-blue-600 font-black opacity-50 shrink-0 select-none">#</span>
                       <span className="break-all tracking-tight leading-none">{log}</span>
                     </div>
                   ))}
                   <div className="flex gap-3 animate-pulse">
                      <span className="text-blue-600 font-black">#</span>
                      <span className="w-2 h-3 bg-blue-500/50"></span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* IDLE STATE - REPLICATING THE SCREENSHOT EXACTLY */}
        {status === AppStatus.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000 relative">
            <div className="relative mb-16 animate-float">
               <div className="absolute inset-0 bg-blue-600 blur-[180px] opacity-10 animate-pulse-slow"></div>
               <div className="relative w-72 h-72 rounded-full border border-white/5 flex items-center justify-center backdrop-blur-sm group shadow-2xl transition-all bg-white/[0.01]">
                  <Github size={160} strokeWidth={0.5} className="text-blue-500/30 transition-transform group-hover:scale-105 duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Github size={100} strokeWidth={1} className="text-blue-600" />
                  </div>
                  <div className="absolute bottom-6 -right-2 bg-amber-500 p-4 rounded-3xl shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-amber-500/40">
                     <Crown size={42} className="text-black" fill="currentColor" />
                  </div>
               </div>
            </div>

            <div className="text-center space-y-0 mb-12 max-w-5xl">
              <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.8em] block mb-10 animate-pulse">Protocolo de Recrutamento Neural</span>
              <div className="flex flex-col items-center -space-y-6 md:-space-y-10">
                <h1 className="text-7xl md:text-[9.5rem] font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.1)]">Inteligência</h1>
                <h1 className="text-7xl md:text-[9.5rem] font-black italic uppercase tracking-tighter leading-none text-blue-600 drop-shadow-[0_0_80px_rgba(37,99,235,0.4)]">Recruitment</h1>
                <h1 className="text-7xl md:text-[9.5rem] font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.1)]">Neural</h1>
              </div>
              <p className="mt-14 text-slate-400 font-medium italic text-lg md:text-xl tracking-tight max-w-3xl mx-auto leading-relaxed opacity-80">
                Sonde perfis do GitHub com Gemini 3. Audite habilidades, preveja senioridade e compare DNA técnico através de árvores de repositórios públicos.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-10 z-10 mt-6">
              <button onClick={handleAnalyze} className="group relative px-16 py-6 bg-blue-600 rounded-3xl text-[12px] font-black uppercase tracking-[0.5em] transition-all hover:scale-105 hover:bg-blue-500 shadow-[0_25px_70px_-15px_rgba(37,99,235,0.6)] text-white flex items-center gap-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Sparkles size={20} className="animate-pulse" />
                Sondar Perfil
              </button>
              <button onClick={() => setIsCompareMode(!isCompareMode)} className="group px-16 py-6 border border-white/10 rounded-3xl text-[12px] font-black uppercase tracking-[0.5em] hover:bg-white/5 transition-all flex items-center gap-6 bg-white/[0.01] text-slate-400 hover:text-white hover:border-white/20 shadow-xl">
                <Swords size={20} className="transition-transform group-hover:rotate-12" />
                Batalha Tática
              </button>
            </div>
            
            {isCompareMode && (
              <div className="mt-16 animate-in slide-in-from-top-10 flex flex-col gap-8 w-full max-w-3xl bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0"></div>
                 <div className="flex gap-8 items-center">
                   <div className="flex-1 space-y-2">
                     <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Alvo Primário</label>
                     <input value={username1} onChange={(e) => setUsername1(e.target.value)} placeholder="gaearon" className="w-full border rounded-2xl py-5 px-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all bg-slate-900/60 border-white/5 text-white" />
                   </div>
                   <div className="text-blue-500/30 font-black italic text-xl tracking-tighter mt-6">VS</div>
                   <div className="flex-1 space-y-2">
                     <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Alvo Secundário</label>
                     <input value={username2} onChange={(e) => setUsername2(e.target.value)} placeholder="danabramov" className="w-full border rounded-2xl py-5 px-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all bg-slate-900/60 border-white/5 text-white" />
                   </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-3 ml-2">
                      <FileText size={16} className="text-blue-500" /> Mission Briefing (Job / Context)
                    </label>
                    <textarea value={assessmentContext} onChange={(e) => setAssessmentContext(e.target.value)} className="w-full h-40 bg-slate-900/80 border border-white/5 rounded-3xl p-8 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none transition-all custom-scrollbar" placeholder="Paste technical requirements or assessment goals..." />
                 </div>
                 <button onClick={handleCompare} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.4em] text-[12px] rounded-3xl transition-all shadow-2xl shadow-blue-500/40">
                   Iniciar Engajamento AI
                 </button>
              </div>
            )}

            {/* Bottom Status Indicators */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 opacity-40">
               <div className="flex items-center gap-4 px-8 py-3 rounded-2xl border border-white/5 bg-white/[0.01]">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Powered By</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Gemini 3 Pro</span>
                  </div>
               </div>
               <div className="flex items-center gap-4 px-8 py-3 rounded-2xl border border-white/5 bg-white/[0.01]">
                  <GitFork size={16} className="text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Data Uplink</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">GitHub Rest v4</span>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === AppStatus.SUCCESS && (
          <div className="max-w-[1400px] mx-auto w-full p-8 pb-24 animate-in slide-in-from-bottom-10 duration-700">
             {isCompareMode && comparison && profile1 && profile2 ? (
                <ComparisonDashboard comparison={comparison} p1={profile1} p2={profile2} r1={repos1} r2={repos2} />
             ) : (
                analysis && profile1 && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                       <div className="border border-white/5 p-12 rounded-[4rem] flex flex-col md:flex-row gap-12 items-center md:items-start relative overflow-hidden transition-all bg-slate-900/40 backdrop-blur-xl">
                          <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                            <Github size={200} />
                          </div>
                          <div className="relative group">
                             <div className="absolute inset-0 bg-blue-500 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                             <img src={profile1.avatar_url} className="w-48 h-48 rounded-[3.5rem] border-4 border-slate-800 shadow-2xl relative z-10" alt="" />
                          </div>
                          <div className="flex-1 relative z-10">
                            <h2 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6 text-white">{profile1.name || profile1.login}</h2>
                            <div className="flex flex-wrap gap-4 mb-10">
                              <p className="text-blue-500 font-black uppercase text-lg tracking-[0.3em] flex items-center gap-3">
                                <Github size={22} /> @{profile1.login}
                              </p>
                              {profile1.location && (
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 border border-white/5 px-4 py-1.5 rounded-full bg-white/[0.01]">
                                  <Globe size={14} className="text-blue-400" /> {profile1.location}
                                </p>
                              )}
                            </div>
                            <p className="italic text-xl leading-relaxed border-l-4 border-blue-600/60 pl-10 text-slate-300 font-medium py-2">
                              "{profile1.bio || "Neural DNA summary missing for this subject profile."}"
                            </p>
                          </div>
                       </div>
                       <AnalysisDashboard 
                         analysis={analysis} repositories={repos1} isPro={sub.tier === 'PRO'} onUpgradeClick={() => setIsPricingOpen(true)}
                         username={profile1.login} folders={folders} onAddToPipeline={handleAddToPipeline} onCreateFolder={handleCreateFolder}
                       />
                    </div>
                    <div className="xl:col-span-4 h-fit sticky top-28">
                       <ChatWidget username={profile1.login} />
                    </div>
                  </div>
                )
             )}
          </div>
        )}

        {/* ERROR STATE */}
        {status === AppStatus.ERROR && (
           <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse"></div>
                <ShieldAlert size={100} className="text-red-500 relative z-10 animate-bounce" />
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Neural Link Severed</h2>
              <p className="text-slate-500 mt-4 font-bold uppercase text-sm tracking-[0.4em]">{error}</p>
              <button onClick={() => setStatus(AppStatus.IDLE)} className="mt-12 px-16 py-5 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-xs rounded-3xl hover:bg-red-500/20 transition-all tracking-[0.5em] shadow-2xl">Retry Mission</button>
           </div>
        )}
      </main>

      <footer className="h-14 border-t border-white/5 flex items-center px-10 text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] bg-[#080b14] relative z-40">
        <div className="flex-1 flex items-center gap-14">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]"></div>
              <span>DEVLENS // ADVANCED NEURAL SOURCING UNIT</span>
           </div>
        </div>
        <div className="flex items-center gap-14">
           <div className="flex items-center gap-3">
              <Wifi size={14} className="text-blue-500" />
              <span>GEMINI 3 LOGIC ENGINE ACTIVE</span>
           </div>
        </div>
      </footer>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      {isPipelineManagerOpen && (
        <PipelineManager 
          folders={folders} onClose={() => setIsPipelineManagerOpen(false)} 
          onDeleteFolder={(id) => setFolders(folders.filter(f => f.id !== id))}
          onRemoveCandidate={(fId, user) => setFolders(folders.map(f => f.id === fId ? {...f, candidates: f.candidates.filter(c => c.username !== user)} : f))}
        />
      )}
    </div>
  );
}
