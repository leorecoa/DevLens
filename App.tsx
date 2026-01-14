
import React, { useState, useEffect } from 'react';
import { Github, Terminal, Loader2, Sparkles, Swords, Users, Target, Folders, Database, ShieldCheck, Fingerprint, Star, GitFork, Sun, Moon, Zap, Shield, Cpu, Activity, ChevronRight, Crown, Search, Wifi, Box, Globe, Lock, ShieldAlert, Laptop } from 'lucide-react';
import { analyzeProfile, compareProfiles } from './services/geminiService';
import { fetchUserProfile, syncUserProfile, fetchFolders, syncFolders } from './services/supabaseService';
import { AppStatus, AIAnalysis, GitHubProfile, Repository, ComparisonAnalysis, UserSubscription, PipelineFolder, SavedCandidate } from './types';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatWidget } from './components/ChatWidget';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { PricingModal } from './components/PricingModal';
import { PipelineManager } from './components/PipelineManager';

const DEFAULT_FREE_LIMIT = 10;

function App() {
  const [username1, setUsername1] = useState('gaearon'); 
  const [username2, setUsername2] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);
  
  const [theme, setTheme] = useState(() => localStorage.getItem('devlens_theme') || 'dark');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [loadingMessage, setLoadingMessage] = useState('FETCHING GITHUB DATA');
  const [loadingSubMessage, setLoadingSubMessage] = useState('ACESSANDO ÁRVORES DE REPOSITÓRIOS E HISTÓRICO...');
  const [loadingStage, setLoadingStage] = useState(0); 
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

  useEffect(() => {
    const init = async () => {
      try {
        const remoteSub = await fetchUserProfile();
        const remoteFolders = await fetchFolders();
        if (remoteSub) setSub(remoteSub);
        if (remoteFolders) setFolders(remoteFolders || []);
      } catch (err) {
        console.warn("Supabase Uplink Interrupted. Offline mode active.");
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isInitialized) syncUserProfile(sub);
  }, [sub, isInitialized]);

  useEffect(() => {
    if (isInitialized) syncFolders(folders, sub);
  }, [folders, isInitialized]);

  useEffect(() => {
    localStorage.setItem('devlens_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const fetchGitHubData = async (user: string) => {
    const [pRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=15`)
    ]);
    if (!pRes.ok) throw new Error(`Subject @${user} not found in global database.`);
    return { p: await pRes.json(), r: await rRes.json() };
  };

  const handleAnalyze = async () => {
    if (!username1.trim()) return;
    if (sub.creditsRemaining <= 0 && sub.tier === 'FREE') {
      setIsPricingOpen(true);
      return;
    }
    setStatus(AppStatus.LOADING);
    setError(null);
    try {
      setLoadingStage(0);
      setLoadingMessage('FETCHING GITHUB DATA');
      setLoadingSubMessage('ACESSANDO ÁRVORES DE REPOSITÓRIOS E HISTÓRICO...');
      const d1 = await fetchGitHubData(username1);
      setProfile1(d1.p);
      setRepos1(d1.r);
      
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStage(1);
      setLoadingMessage('AI ANALYSIS');
      setLoadingSubMessage('GEMINI 2.0 FLASH ANALISANDO DNA TÉCNICO...');
      const aiResult = await analyzeProfile(username1);
      setAnalysis(aiResult);
      
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStage(2);
      setLoadingMessage('FINAL SYNTHESIS');
      setLoadingSubMessage('COMPILANDO RELATÓRIO ESTRATÉGICO FINAL...');
      setSub(prev => ({
        ...prev,
        creditsRemaining: prev.tier === 'PRO' ? prev.creditsRemaining : Math.max(0, prev.creditsRemaining - 1),
        totalAnalyses: prev.totalAnalyses + 1
      }));
      
      await new Promise(r => setTimeout(r, 1000)); 
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      setError(e.message);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleCompare = async () => {
    if (!username1.trim() || !username2.trim()) return;
    setStatus(AppStatus.LOADING);
    try {
      setLoadingStage(0);
      setLoadingMessage('FETCHING GITHUB DATA');
      const [d1, d2] = await Promise.all([fetchGitHubData(username1), fetchGitHubData(username2)]);
      setProfile1(d1.p); setRepos1(d1.r);
      setProfile2(d2.p); setRepos2(d2.r);
      
      await new Promise(r => setTimeout(r, 1000));
      setLoadingStage(1);
      setLoadingMessage('AI ANALYSIS');
      setLoadingSubMessage('GEMINI 2.0 FLASH COMPARANDO CANDIDATOS...');
      const compResult = await compareProfiles(username1, username2);
      setComparison(compResult);
      
      await new Promise(r => setTimeout(r, 1000));
      setLoadingStage(2);
      setLoadingMessage('FINAL SYNTHESIS');
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

  return (
    <div className={`min-h-screen selection:bg-blue-500/30 overflow-x-hidden flex flex-col grid-pattern transition-colors duration-500 ${theme === 'dark' ? 'bg-[#080b14] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-xl border-b flex items-center px-6 transition-all duration-500 ${theme === 'dark' ? 'bg-[#080b14]/90 border-white/5' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center gap-3 w-1/4">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
            <Terminal size={14} className="text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className={`text-xs font-black italic tracking-tighter uppercase leading-none transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>DevLens</span>
            <span className="text-[7px] font-bold text-blue-500 uppercase tracking-widest">Neural Intelligence Unit</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center gap-6">
          <button onClick={() => setIsPipelineManagerOpen(true)} className="flex items-center gap-2 group transition-all">
             <Folders size={14} className={`transition-colors ${theme === 'dark' ? 'text-slate-500 group-hover:text-blue-500' : 'text-slate-400 group-hover:text-blue-600'}`} />
             <div className="flex flex-col -space-y-1 text-left">
               <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">Pipeline</span>
               <span className={`text-[10px] font-bold transition-colors ${theme === 'dark' ? 'text-white group-hover:text-blue-400' : 'text-slate-700 group-hover:text-blue-600'}`}>{folders.reduce((acc, f) => acc + f.candidates.length, 0)} Salvos</span>
             </div>
          </button>

          <button onClick={() => setIsPricingOpen(true)} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 hover:bg-amber-500/20 transition-all group">
            <Crown size={12} className="text-amber-500 transition-transform group-hover:scale-110" fill="currentColor" />
            <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Go Pro</span>
          </button>

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
            <input 
              type="text"
              value={username1}
              onChange={(e) => setUsername1(e.target.value)}
              placeholder="TARGET USERNAME"
              className={`w-full border rounded-full py-1.5 pl-9 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all ${theme === 'dark' ? 'bg-slate-900/60 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
            />
          </div>
        </div>

        <div className="w-1/4 flex justify-end gap-3 items-center">
           <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
           </button>
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

      {/* CORE VIEWPORT */}
      <main className="pt-14 flex-1 flex flex-col">
        
        {/* TELA DE LOADING RECONSTRUÍDA - EXATAMENTE COMO NA IMAGEM */}
        {status === AppStatus.LOADING && (
          <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-700 ${theme === 'dark' ? 'bg-[#080b14]' : 'bg-slate-50'}`}>
             
             {/* Central Iconography with Orbitals */}
             <div className="relative mb-8 scale-110">
                <div className="absolute -inset-20 border border-blue-500/10 rounded-full animate-spin-slow"></div>
                <div className="absolute -inset-16 border border-blue-500/5 rounded-full"></div>
                
                {/* Orbital Floating Icons */}
                <div className="absolute -top-12 -right-12 bg-slate-950/80 border border-white/10 p-2.5 rounded-xl shadow-2xl animate-float">
                   <Zap size={20} className="text-amber-500" fill="currentColor" />
                </div>
                <div className="absolute -bottom-10 -left-10 bg-slate-950/80 border border-white/10 p-2.5 rounded-xl shadow-2xl animate-float" style={{animationDelay: '1.5s'}}>
                   <span className="text-[10px] font-mono font-black text-blue-500">01 10</span>
                </div>

                {/* Main Circle Housing the Database Icon */}
                <div className={`relative w-40 h-40 rounded-full border-2 border-white/5 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-3xl shadow-[0_0_60px_rgba(59,130,246,0.15)] transition-all duration-1000`}>
                   <Database size={64} className="text-blue-500 mb-2 animate-pulse" />
                   <div className="flex gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div>
                   </div>
                </div>
             </div>

             {/* Brutalist Hero Titles */}
             <div className="text-center space-y-3 mb-14">
                <h2 className={`text-7xl font-black italic uppercase tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                   {loadingMessage}
                </h2>
                <p className={`text-[11px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                   {loadingSubMessage}
                </p>
             </div>

             {/* Progress Bar Container */}
             <div className="w-full max-w-2xl px-8 mb-14">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-blue-600/10 p-1.5 rounded-lg border border-blue-500/20">
                        <Search size={14} className="text-blue-500" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Operation: {loadingMessage}</span>
                   </div>
                   <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">
                      {Math.round(((loadingStage + 1) / 3) * 100)}% Link Synced
                   </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden p-[1px] ${theme === 'dark' ? 'bg-slate-900 border border-white/5 shadow-inner' : 'bg-slate-200 border border-slate-300'}`}>
                   <div 
                      className="h-full bg-blue-600 transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(59,130,246,1)] rounded-full" 
                      style={{ width: `${((loadingStage + 1) / 3) * 100}%` }}
                   ></div>
                </div>
             </div>

             {/* Console Window Mockup */}
             <div className="w-full max-w-xl bg-[#030712] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="px-5 py-3 border-b border-white/5 bg-slate-900/30 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Terminal size={12} className="text-blue-500" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Console Uplink Active</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></div>
                      <span className="text-[9px] font-mono text-slate-600 tracking-widest uppercase">ID: DL-INT-X01</span>
                   </div>
                </div>
                <div className="p-10 font-mono text-[11px] h-32 overflow-hidden">
                   <div className="flex gap-4 items-start">
                      <span className="text-blue-600 font-bold">{'>'}</span>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-400 animate-pulse">Waiting for next packet...</span>
                        {loadingStage >= 1 && <span className="text-emerald-500/70">DATA_STREAM_VERIFIED: GITHUB_NODES_ACQUIRED</span>}
                        {loadingStage >= 2 && <span className="text-blue-500/70">NEURAL_SYNAPSE: ANALYSIS_SYNCHRONIZED</span>}
                      </div>
                   </div>
                </div>
             </div>

             {/* Bottom Progress Stepper with Squares */}
             <div className="flex gap-20 items-center justify-center w-full max-w-5xl px-12 border-t border-white/5 pt-16">
                {/* Stage 1 */}
                <div className={`flex flex-col items-center gap-5 transition-all duration-700 ${loadingStage >= 0 ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                   <div className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center transition-all ${loadingStage === 0 ? 'border-blue-600 bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'border-white/10 bg-slate-900/40'}`}>
                      <Database size={28} className={loadingStage === 0 ? 'text-blue-500' : 'text-slate-500'} />
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2"></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${loadingStage === 0 ? 'text-white' : 'text-slate-600'}`}>Fetching Github Data</span>
                   </div>
                </div>

                <div className="h-[1px] w-14 bg-white/5"></div>

                {/* Stage 2 */}
                <div className={`flex flex-col items-center gap-5 transition-all duration-700 ${loadingStage >= 1 ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                   <div className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center transition-all ${loadingStage === 1 ? 'border-blue-600 bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'border-white/10 bg-slate-900/40'}`}>
                      <Target size={28} className={loadingStage === 1 ? 'text-blue-500' : 'text-slate-500'} />
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2"></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${loadingStage === 1 ? 'text-white' : 'text-slate-600'}`}>AI Analysis</span>
                   </div>
                </div>

                <div className="h-[1px] w-14 bg-white/5"></div>

                {/* Stage 3 */}
                <div className={`flex flex-col items-center gap-5 transition-all duration-700 ${loadingStage >= 2 ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                   <div className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center transition-all ${loadingStage === 2 ? 'border-blue-600 bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'border-white/10 bg-slate-900/40'}`}>
                      <ShieldCheck size={28} className={loadingStage === 2 ? 'text-blue-500' : 'text-slate-500'} />
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2"></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${loadingStage === 2 ? 'text-white' : 'text-slate-600'}`}>Final Synthesis</span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {status === AppStatus.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000 relative">
            <div className="relative mb-12 animate-float">
               <div className="absolute inset-0 bg-blue-600 blur-[150px] opacity-10 animate-pulse-slow"></div>
               <div className={`relative w-56 h-56 rounded-full border flex items-center justify-center backdrop-blur-sm group shadow-2xl transition-all ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-white/60 shadow-blue-500/5'}`}>
                  <Github size={120} strokeWidth={1} className="text-blue-500 transition-transform group-hover:scale-105 duration-500" />
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 p-3 rounded-2xl shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-amber-500/30">
                     <Crown size={36} className="text-black" fill="currentColor" />
                  </div>
               </div>
            </div>

            <div className="text-center space-y-0 mb-10 max-w-5xl">
              <span className="text-[11px] font-black uppercase text-blue-500 tracking-[0.6em] block mb-6">Protocolo de Recrutamento Neural</span>
              <h1 className={`text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Inteligência
              </h1>
              <h1 className="text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] text-blue-600 drop-shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                Recruitment
              </h1>
              <h1 className={`text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Neural
              </h1>
            </div>

            <p className={`text-lg md:text-xl max-w-3xl text-center font-medium italic mb-14 leading-relaxed transition-colors ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Audite habilidades, preveja senioridade e compare DNA técnico através da plataforma definitiva de inteligência de talentos.
            </p>

            <div className="flex flex-col md:flex-row gap-8">
              <button onClick={handleAnalyze} className="group relative px-16 py-6 bg-blue-600 rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:scale-105 hover:bg-blue-500 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-4">
                  <Sparkles size={20} className="text-white animate-pulse" />
                  Sondar Setor
                </div>
              </button>

              <button onClick={() => { setIsCompareMode(true); setStatus(AppStatus.IDLE); }} className={`px-16 py-6 border rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all flex items-center gap-4 text-slate-400 hover:text-white group ${theme === 'dark' ? 'border-white/10 bg-slate-900/40' : 'border-slate-200 bg-white shadow-sm hover:bg-slate-900 hover:text-white'}`}>
                <Swords size={20} className="transition-transform group-hover:rotate-12" />
                Batalha Tática
              </button>
            </div>
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
                       <div className={`border p-10 rounded-[3.5rem] flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden group transition-all ${theme === 'dark' ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <img src={profile1.avatar_url} className="w-40 h-40 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl relative z-10" alt="" />
                          <div className="flex-1 relative z-10">
                            <h2 className={`text-6xl font-black italic uppercase tracking-tighter leading-none mb-3 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{profile1.name || profile1.login}</h2>
                            <p className="text-blue-500 font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
                               <Github size={16} /> @{profile1.login}
                            </p>
                            <p className={`italic text-base leading-relaxed border-l-4 border-blue-600/30 pl-6 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{profile1.bio || "Subject has not provided biographical intelligence data."}</p>
                          </div>
                          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                            <Github size={200} className={theme === 'dark' ? 'text-white' : 'text-slate-900'} />
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
      </main>

      {/* FOOTER */}
      <footer className={`h-12 border-t flex items-center px-6 transition-colors duration-500 ${theme === 'dark' ? 'border-white/5 bg-[#080b14] text-slate-500' : 'border-slate-200 bg-white text-slate-400'}`}>
        <div className="flex-1 flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-mono uppercase tracking-widest">GEMINI_2.0_FLASH: ACTIVE</span>
           </div>
           <div className="flex items-center gap-2">
              <GitFork size={12} className={theme === 'dark' ? 'text-slate-600' : 'text-slate-300'} />
              <span className="text-[9px] font-mono uppercase tracking-widest">GITHUB_API_v4: STABLE</span>
           </div>
        </div>
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <Wifi size={12} className="text-blue-500" />
              <span className="text-[9px] font-mono uppercase tracking-widest">LATENCY: 124MS</span>
           </div>
           <span className="text-[9px] font-mono uppercase tracking-widest">© 2025 NEURAL OPERATIONS UNIT</span>
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

export default App;
