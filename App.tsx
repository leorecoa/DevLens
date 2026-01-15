import React, { useState, useEffect } from 'react';
import { Github, Terminal, Loader2, Sparkles, Swords, Users, Target, Folders, Database, ShieldCheck, Fingerprint, Star, GitFork, Sun, Moon, Zap, Shield, Cpu, Activity, ChevronRight, Crown, Search, Wifi, Box, Globe, Lock, ShieldAlert, Laptop, FileText, AlertCircle } from 'lucide-react';
import { analyzeProfile, compareProfiles } from './services/geminiService';
import { fetchUserProfile, syncUserProfile, fetchFolders, syncFolders } from './services/supabaseService';
import { AppStatus, AIAnalysis, GitHubProfile, Repository, ComparisonAnalysis, UserSubscription, PipelineFolder, SavedCandidate } from './types';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatWidget } from './components/ChatWidget';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { PricingModal } from './components/PricingModal';
import { PipelineManager } from './components/PipelineManager';
import { NewComparisonModal } from './components/NewComparisonModal';
import { ResumeScoreModal } from './components/ResumeScoreModal';
import { InterviewQuestionsModal } from './components/InterviewQuestionsModal';

const DEFAULT_FREE_LIMIT = 10;

export default function App() {
  const [username1, setUsername1] = useState('gaearon'); 
  const [username2, setUsername2] = useState('danabramov');
  const [assessmentContext, setAssessmentContext] = useState('- We have a solid understanding of the current market.\n- We have identified key strategic priorities.\n- We have evaluated the competitive landscape.\n- We have assessed the potential risks and opportunities.');
  
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
  const [isNewComparisonModalOpen, setIsNewComparisonModalOpen] = useState(false);
  const [isResumeScoreModalOpen, setIsResumeScoreModalOpen] = useState(false);
  const [isInterviewQuestionsModalOpen, setIsInterviewQuestionsModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const remoteSub = await fetchUserProfile();
        const remoteFolders = await fetchFolders();
        if (remoteSub) setSub(remoteSub);
        if (remoteFolders) setFolders(remoteFolders || []);
      } catch (err) {
        console.warn("Supabase initial link deferred. App in local-only tactical mode.");
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const sync = async () => {
      try {
        // Ensure user profile exists before attempting to sync folders (preventing FK violation)
        await syncUserProfile(sub);
        await syncFolders(folders);
      } catch (err) {
        console.error("Sync deferred due to dependency order.");
      }
    };
    const timer = setTimeout(sync, 2000);
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
    if (!pRes.ok) throw new Error(`Subject @${user} not found in database.`);
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
    setComparison(null);
    try {
      setLoadingStage(0);
      setLoadingMessage('FETCHING GITHUB DATA');
      setLoadingSubMessage('INICIANDO CONEXÃO COM API GITHUB...');
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

  const handleCompare = async (user1: string, user2: string, context?: string) => {
    if (!user1.trim() || !user2.trim()) return;
    setIsNewComparisonModalOpen(false);
    setStatus(AppStatus.LOADING);
    setError(null);
    setAnalysis(null);
    try {
      setLoadingStage(0);
      setLoadingMessage('FETCHING GITHUB DATA');
      const [d1, d2] = await Promise.all([fetchGitHubData(user1), fetchGitHubData(user2)]);
      setProfile1(d1.p); setRepos1(d1.r);
      setProfile2(d2.p); setRepos2(d2.r);
      
      await new Promise(r => setTimeout(r, 1000));
      setLoadingStage(1);
      setLoadingMessage('AI COMPARISON');
      setLoadingSubMessage('GEMINI 3 PRO ANALISANDO VANTAGENS TÁTICAS...');
      const compResult = await compareProfiles(user1, user2, context || assessmentContext);
      setComparison(compResult);
      
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStage(2);
      setLoadingMessage('FINAL REPORT');
      setLoadingSubMessage('SINTETIZANDO VERDITO DE BATALHA...');
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

  const handleEditFolder = (id: string, name: string, color: string) => {
    setFolders(prev => prev.map(f =>
      f.id === id
        ? { ...f, name, color }
        : f
    ));
  };

  return (
    <div className={`min-h-screen selection:bg-blue-500/30 overflow-x-hidden flex flex-col grid-pattern transition-colors duration-500 ${theme === 'dark' ? 'bg-[#080b14] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* FIXED HEADER */}
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
               <span className="text-[10px] font-bold">{folders.reduce((acc, f) => acc + f.candidates.length, 0)} Salvos</span>
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
             className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.25em] flex items-center gap-2 transition-all btn-glow disabled:opacity-50 shadow-lg shadow-blue-500/30"
           >
             {status === AppStatus.LOADING ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
             Inspecionar
           </button>
        </div>
      </header>

      <main className="pt-14 flex-1 flex flex-col">
        {/* SCANNER LOADING OVERLAY */}
        {status === AppStatus.LOADING && (
          <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-700 ${theme === 'dark' ? 'bg-[#080b14]' : 'bg-slate-50'}`}>
             <div className="scanner-laser"></div>
             
             <div className="relative mb-8 scale-110">
                <div className="absolute -inset-20 border border-blue-500/10 rounded-full animate-spin-slow"></div>
                <div className="absolute -inset-16 border border-blue-500/5 rounded-full"></div>
                
                <div className={`relative w-40 h-40 rounded-full border-2 border-white/5 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-3xl shadow-[0_0_60px_rgba(59,130,246,0.15)]`}>
                   <Database size={64} className="text-blue-500 mb-2 animate-pulse" />
                   <div className="flex gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div>
                   </div>
                </div>
             </div>

             <div className="text-center space-y-3 mb-14">
                <h2 className={`text-7xl font-black italic uppercase tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{loadingMessage}</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">{loadingSubMessage}</p>
             </div>

             <div className="w-full max-w-2xl px-8 mb-14">
                <div className={`w-full h-1.5 rounded-full overflow-hidden p-[1px] ${theme === 'dark' ? 'bg-slate-900 border border-white/5 shadow-inner' : 'bg-slate-200 border border-slate-300'}`}>
                   <div 
                      className="h-full bg-blue-600 transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(59,130,246,1)] rounded-full" 
                      style={{ width: `${((loadingStage + 1) / 3) * 100}%` }}
                   ></div>
                </div>
             </div>

             <div className="flex gap-20 items-center justify-center w-full max-w-5xl px-12 border-t border-white/5 pt-16">
                {[Database, Target, ShieldCheck].map((Icon, i) => (
                   <div key={i} className={`flex flex-col items-center gap-5 transition-all duration-700 ${loadingStage >= i ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                      <div className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center transition-all ${loadingStage === i ? 'border-blue-600 bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'border-white/10 bg-slate-900/40'}`}>
                         <Icon size={28} className={loadingStage === i ? 'text-blue-500' : 'text-slate-500'} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${loadingStage === i ? 'text-white' : 'text-slate-600'}`}>
                        {i === 0 ? 'Data Retrieval' : i === 1 ? 'Neural Audit' : 'Synthesis'}
                      </span>
                   </div>
                ))}
             </div>
          </div>
        )}

        {status === AppStatus.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000 relative">
            <div className="relative mb-12 animate-float">
               <div className="absolute inset-0 bg-blue-600 blur-[150px] opacity-10 animate-pulse-slow"></div>
               <div className={`relative w-56 h-56 rounded-full border flex items-center justify-center backdrop-blur-sm group shadow-2xl transition-all ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-white/60'}`}>
                  <Github size={120} strokeWidth={1} className="text-blue-500 transition-transform group-hover:scale-105 duration-500" />
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 p-3 rounded-2xl shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-amber-500/30">
                     <Crown size={36} className="text-black" fill="currentColor" />
                  </div>
               </div>
            </div>

            <div className="text-center space-y-0 mb-10">
              <span className="text-[11px] font-black uppercase text-blue-500 tracking-[0.6em] block mb-6">Neural Sourcing Protocol</span>
              <h1 className={`text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Inteligência</h1>
              <h1 className="text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] text-blue-600 drop-shadow-[0_0_30px_rgba(37,99,235,0.3)]">Recruitment</h1>
              <h1 className={`text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Neural</h1>
            </div>

              <button onClick={handleAnalyze} className="group relative px-16 py-6 bg-blue-600 rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:scale-105 hover:bg-blue-500 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] text-white">
                Sondar Perfil
              </button>
              <button onClick={() => setIsNewComparisonModalOpen(true)} className={`px-16 py-6 border rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all flex items-center gap-4 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200 bg-white shadow-sm'}`}>
                <Swords size={20} className="transition-transform group-hover:rotate-12" />
                Batalha Tática
              </button>
              <button onClick={() => setIsResumeScoreModalOpen(true)} className={`px-16 py-6 border rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all flex items-center gap-4 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200 bg-white shadow-sm'}`}>
                <FileText size={20} className="transition-transform group-hover:rotate-12" />
                Score Resume
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
                       <div className={`border p-10 rounded-[3.5rem] flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <img src={profile1.avatar_url} className="w-40 h-40 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl relative z-10" alt="" />
                          <div className="flex-1 relative z-10">
                            <h2 className={`text-6xl font-black italic uppercase tracking-tighter leading-none mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{profile1.name || profile1.login}</h2>
                            <p className="text-blue-500 font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
                               <Github size={16} /> @{profile1.login}
                            </p>
                            <p className="italic text-base leading-relaxed border-l-4 border-blue-600/30 pl-6 text-slate-400">{profile1.bio || "No technical DNA summary available for this subject."}</p>
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
              <ShieldAlert size={64} className="text-red-500 mb-4 animate-bounce" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Neural Link Severed</h2>
              <p className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-widest">{error}</p>
              <button onClick={() => setStatus(AppStatus.IDLE)} className="mt-8 px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-xs rounded-full hover:bg-red-500/20 transition-all">Retry Mission</button>
           </div>
        )}
      </main>

      {/* FIXED FOOTER */}
      <footer className={`h-12 border-t flex items-center px-6 text-slate-500 text-[9px] font-mono uppercase tracking-widest transition-colors duration-500 ${theme === 'dark' ? 'border-white/5 bg-[#080b14]' : 'border-slate-200 bg-white'}`}>
        <div className="flex-1 flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>GEMINI_3_PRO: ACTIVE</span>
           </div>
           <div className="flex items-center gap-2">
              <GitFork size={12} className="text-slate-600" />
              <span>GITHUB_API_v4: STABLE</span>
           </div>
        </div>
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <Wifi size={12} className="text-blue-500" />
              <span>LATENCY: 89MS</span>
           </div>
           <span>© 2025 NEURAL OPERATIONS UNIT</span>
        </div>
      </footer>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      {isPipelineManagerOpen && (
        <PipelineManager
          folders={folders}
          onClose={() => setIsPipelineManagerOpen(false)}
          onCreateFolder={handleCreateFolder}
          onEditFolder={handleEditFolder}
          onDeleteFolder={(id) => setFolders(folders.filter(f => f.id !== id))}
          onRemoveCandidate={(fId, user) => setFolders(folders.map(f => f.id === fId ? {...f, candidates: f.candidates.filter(c => c.username !== user)} : f))}
        />
      )}
    </div>
  );
}
