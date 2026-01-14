
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

export default function App() {
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
        console.warn("Supabase Offline mode active.");
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  // Sync logic to prevent FK errors: Profile always before Folders
  useEffect(() => {
    if (!isInitialized) return;
    const sync = async () => {
      try {
        await syncUserProfile(sub);
        await syncFolders(folders);
      } catch (err) {
        console.error("Sync deferred");
      }
    };
    const timer = setTimeout(sync, 1000);
    return () => clearTimeout(timer);
  }, [sub, folders, isInitialized]);

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
    if (!pRes.ok) throw new Error(`Subject @${user} not found.`);
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
      const d1 = await fetchGitHubData(username1);
      setProfile1(d1.p);
      setRepos1(d1.r);
      
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStage(1);
      setLoadingMessage('AI ANALYSIS');
      setLoadingSubMessage('GEMINI 3 PRO ANALISANDO DNA TÉCNICO...');
      const aiResult = await analyzeProfile(username1);
      setAnalysis(aiResult);
      
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStage(2);
      setLoadingMessage('FINAL SYNTHESIS');
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
      const compResult = await compareProfiles(username1, username2);
      setComparison(compResult);
      
      await new Promise(r => setTimeout(r, 1000));
      setLoadingStage(2);
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
      
      <header className={`fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-xl border-b flex items-center px-6 transition-all duration-500 ${theme === 'dark' ? 'bg-[#080b14]/90 border-white/5' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center gap-3 w-1/4">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg">
            <Terminal size={14} className="text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xs font-black italic uppercase tracking-tighter transition-colors">DevLens</span>
            <span className="text-[7px] font-bold text-blue-500 uppercase tracking-widest">Neural Intel</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center gap-6">
          <button onClick={() => setIsPipelineManagerOpen(true)} className="flex items-center gap-2 group transition-all">
             <Folders size={14} className="text-slate-500 group-hover:text-blue-500" />
             <div className="flex flex-col -space-y-1 text-left">
               <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">Pipeline</span>
               <span className="text-[10px] font-bold">{folders.reduce((acc, f) => acc + f.candidates.length, 0)} Salvos</span>
             </div>
          </button>

          <button onClick={() => setIsPricingOpen(true)} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 hover:bg-amber-500/20 transition-all">
            <Crown size={12} className="text-amber-500" fill="currentColor" />
            <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Go Pro</span>
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
           <button 
             onClick={isCompareMode ? handleCompare : handleAnalyze}
             disabled={status === AppStatus.LOADING}
             className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.25em] flex items-center gap-2 transition-all shadow-lg"
           >
             {status === AppStatus.LOADING ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
             Inspecionar
           </button>
        </div>
      </header>

      <main className="pt-14 flex-1 flex flex-col">
        {status === AppStatus.LOADING && (
          <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-700 ${theme === 'dark' ? 'bg-[#080b14]' : 'bg-slate-50'}`}>
             <div className="relative mb-8 scale-110">
                <div className="absolute -inset-20 border border-blue-500/10 rounded-full animate-spin-slow"></div>
                <div className={`relative w-40 h-40 rounded-full border-2 border-white/5 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-3xl shadow-[0_0_60px_rgba(59,130,246,0.15)]`}>
                   <Database size={64} className="text-blue-500 mb-2 animate-pulse" />
                   <div className="flex gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                   </div>
                </div>
             </div>

             <div className="text-center space-y-3 mb-14">
                <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none">{loadingMessage}</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">{loadingSubMessage}</p>
             </div>

             <div className="w-full max-w-2xl px-8 mb-14">
                <div className={`w-full h-1.5 rounded-full overflow-hidden p-[1px] ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`}>
                   <div 
                      className="h-full bg-blue-600 transition-all duration-[1500ms] ease-out rounded-full" 
                      style={{ width: `${((loadingStage + 1) / 3) * 100}%` }}
                   ></div>
                </div>
             </div>

             <div className="flex gap-20 items-center justify-center w-full max-w-5xl px-12 border-t border-white/5 pt-16">
                {[Database, Target, ShieldCheck].map((Icon, i) => (
                   <div key={i} className={`flex flex-col items-center gap-5 transition-all duration-700 ${loadingStage >= i ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                      <div className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center ${loadingStage === i ? 'border-blue-600 bg-blue-600/10' : 'border-white/10'}`}>
                         <Icon size={28} className={loadingStage === i ? 'text-blue-500' : 'text-slate-500'} />
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {status === AppStatus.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
            <div className="relative mb-12 animate-float">
               <div className="absolute inset-0 bg-blue-600 blur-[150px] opacity-10"></div>
               <div className={`relative w-56 h-56 rounded-full border flex items-center justify-center backdrop-blur-sm shadow-2xl transition-all ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-white/60'}`}>
                  <Github size={120} strokeWidth={1} className="text-blue-500" />
               </div>
            </div>

            <div className="text-center mb-10">
              <span className="text-[11px] font-black uppercase text-blue-500 tracking-[0.6em] block mb-6">Neural Protocol Active</span>
              <h1 className="text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8]">Inteligência</h1>
              <h1 className="text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] text-blue-600">Recruitment</h1>
              <h1 className="text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8]">Neural</h1>
            </div>

            <div className="flex gap-8">
              <button onClick={handleAnalyze} className="px-16 py-6 bg-blue-600 rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:bg-blue-500 text-white">Sondar Perfil</button>
              <button onClick={() => setIsCompareMode(!isCompareMode)} className="px-16 py-6 border border-slate-500/30 rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all">Batalha Tática</button>
            </div>
            {isCompareMode && (
              <div className="mt-8 animate-in slide-in-from-top-4">
                 <input 
                   value={username2}
                   onChange={(e) => setUsername2(e.target.value)}
                   placeholder="TARGET 2 USERNAME"
                   className={`border rounded-full py-3 px-8 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
                 />
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
                       <div className={`border p-10 rounded-[3.5rem] flex flex-col md:flex-row gap-10 items-center md:items-start transition-all ${theme === 'dark' ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-200'}`}>
                          <img src={profile1.avatar_url} className="w-40 h-40 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl" alt="" />
                          <div className="flex-1">
                            <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-3">{profile1.name || profile1.login}</h2>
                            <p className="text-blue-500 font-black uppercase text-sm tracking-widest mb-6">@{profile1.login}</p>
                            <p className="italic text-base leading-relaxed border-l-4 border-blue-600/30 pl-6 text-slate-400">{profile1.bio || "No technical DNA summary available."}</p>
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
              <ShieldAlert size={64} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-black uppercase italic">Neural Uplink Failed</h2>
              <p className="text-slate-500 mt-2">{error}</p>
              <button onClick={() => setStatus(AppStatus.IDLE)} className="mt-6 text-blue-500 font-black uppercase text-xs">Retry Protocol</button>
           </div>
        )}
      </main>

      <footer className={`h-12 border-t flex items-center px-6 text-slate-500 text-[9px] font-mono uppercase tracking-widest transition-colors ${theme === 'dark' ? 'border-white/5 bg-[#080b14]' : 'border-slate-200 bg-white'}`}>
        <div className="flex-1 flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>GEMINI_3_PRO: ACTIVE</span>
           </div>
           <span>LATENCY: 89MS</span>
        </div>
        <span>© 2025 NEURAL OPERATIONS UNIT</span>
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
