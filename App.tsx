import React, { useState, useEffect } from 'react';
import { Github, Terminal, Loader2, Sparkles, Swords, Users, Crown, Shield, ClipboardList, X, Target, Folders, Cpu, Database, Binary, ShieldCheck, Activity, Fingerprint, Layers, Star, GitFork, ChevronRight, FileDown, Linkedin, Twitter, Link, Network, Sun, Moon, Zap, Search, Code, Cpu as Core, Boxes, ZapOff } from 'lucide-react';
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
  const [jdInput, setJdInput] = useState('');
  
  const [theme, setTheme] = useState(() => localStorage.getItem('devlens_theme') || 'dark');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingSubMessage, setLoadingSubMessage] = useState('');
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

  // Inicialização: Hidratação a partir do Supabase
  useEffect(() => {
    const initData = async () => {
      try {
        const remoteSub = await fetchUserProfile();
        const remoteFolders = await fetchFolders();
        
        if (remoteSub) setSub(remoteSub);
        if (remoteFolders) setFolders(remoteFolders);
      } catch (err) {
        console.warn("Could not hydrate data from Supabase, using local defaults.");
      } finally {
        setIsInitialized(true);
      }
    };
    initData();
  }, []);

  // Persistência reativa no Supabase (apenas APÓS inicialização para não sobrescrever o que vem do banco)
  useEffect(() => {
    if (isInitialized) {
      syncUserProfile(sub);
    }
  }, [sub, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      syncFolders(folders);
    }
  }, [folders, isInitialized]);

  useEffect(() => {
    localStorage.setItem('devlens_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const fetchGitHubData = async (user: string) => {
    const [pRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=15`)
    ]);
    if (!pRes.ok) throw new Error(`Usuário @${user} não encontrado no GitHub.`);
    return { p: await pRes.json(), r: await rRes.json() };
  };

  const handleAnalyze = async () => {
    if (!username1.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    setComparison(null);
    setAnalysis(null);
    
    try {
      setLoadingStage(0);
      setLoadingMessage('Fetching GitHub Data');
      setLoadingSubMessage('Mapeando identidades via nós do GitHub...');
      
      const d1 = await fetchGitHubData(username1);
      setProfile1(d1.p);
      setRepos1(d1.r);
      
      setLoadingStage(1);
      setLoadingMessage('AI Analysis');
      setLoadingSubMessage('Gemini 3 sondando matriz de habilidades e senioridade...');
      const aiResult = await analyzeProfile(username1);
      setAnalysis(aiResult);
      
      setLoadingStage(2);
      setLoadingMessage('Final Synthesis');
      setLoadingSubMessage('Empacotando inteligência criptografada...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSub((prev) => ({
        ...prev,
        creditsRemaining: prev.tier === 'PRO' ? prev.creditsRemaining : Math.max(0, prev.creditsRemaining - 1),
        totalAnalyses: prev.totalAnalyses + 1
      }));
      
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      console.error('Análise falhou:', e);
      setError(e.message || 'Falha crítica na sonda neural.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleCompare = async () => {
    if (!username1.trim() || !username2.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    setComparison(null);
    setAnalysis(null);
    
    try {
      setLoadingStage(0);
      setLoadingMessage('Gathering Intelligence');
      setLoadingSubMessage('Sincronizando dados dos dois candidatos...');
      
      const [d1, d2] = await Promise.all([
        fetchGitHubData(username1),
        fetchGitHubData(username2)
      ]);
      
      setProfile1(d1.p);
      setRepos1(d1.r);
      setProfile2(d2.p);
      setRepos2(d2.r);
      
      setLoadingStage(1);
      setLoadingMessage('Comparison Simulation');
      setLoadingSubMessage('Redes neurais calculando superioridade estratégica...');
      const compResult = await compareProfiles(username1, username2, jdInput);
      setComparison(compResult);
      
      setLoadingStage(2);
      setLoadingMessage('Final Synthesis');
      setLoadingSubMessage('Gerando relatório tático de combate...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSub((prev) => ({
        ...prev,
        creditsRemaining: prev.tier === 'PRO' ? prev.creditsRemaining : Math.max(0, prev.creditsRemaining - 1),
        totalAnalyses: prev.totalAnalyses + 1
      }));
      
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      console.error('Comparação falhou:', e);
      setError(e.message || 'Erro ao comparar perfis.');
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

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-[#0b0f1a] text-slate-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                <Terminal className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white italic uppercase">DevLens</h1>
                <p className="text-[10px] text-blue-500 dark:text-blue-400 font-black uppercase tracking-[0.2em]">Neural Intelligence Engine</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsPipelineManagerOpen(true)}
              className="hidden lg:flex flex-col items-start group pl-6 border-l border-slate-200 dark:border-slate-800"
            >
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Talent Pipeline</span>
              <div className="flex items-center gap-2">
                <Folders size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {folders.reduce((acc, f) => acc + f.candidates.length, 0)} Ativos
                </span>
              </div>
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full max-w-2xl">
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Github size={16} />
                </div>
                <input 
                  type="text"
                  value={username1}
                  onChange={(e) => setUsername1(e.target.value)}
                  placeholder="Username Principal"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              {isCompareMode && (
                <>
                  <Swords className="text-slate-400 dark:text-slate-600 shrink-0" size={16} />
                  <div className="relative flex-1 animate-in slide-in-from-right duration-300">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Github size={16} />
                    </div>
                    <input 
                      type="text"
                      value={username2}
                      onChange={(e) => setUsername2(e.target.value)}
                      placeholder="Oponente"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`p-2 rounded-xl border transition-all ${isCompareMode ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
              >
                <Users size={18} />
              </button>
              <button 
                onClick={isCompareMode ? handleCompare : handleAnalyze} 
                disabled={status === AppStatus.LOADING}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest text-[10px]"
              >
                {status === AppStatus.LOADING ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                {isCompareMode ? 'Battle' : 'Inspect'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {status === AppStatus.LOADING && (
          <GranularLoadingScreen stage={loadingStage} message={loadingMessage} subMessage={loadingSubMessage} isBattle={isCompareMode} />
        )}

        {status === AppStatus.ERROR && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <Fingerprint className="text-red-500 mb-6" size={64} />
            <h2 className="text-2xl font-black mb-2 uppercase italic">Acesso Negado / Erro</h2>
            <p className="text-slate-500 mb-8 max-w-md">{error}</p>
            <button onClick={() => setStatus(AppStatus.IDLE)} className="bg-slate-200 dark:bg-slate-800 px-8 py-3 rounded-xl font-black uppercase text-xs">Voltar</button>
          </div>
        )}

        {status === AppStatus.SUCCESS && (
          <div className="space-y-8">
            {isCompareMode && comparison && profile1 && profile2 ? (
              <ComparisonDashboard comparison={comparison} p1={profile1} p2={profile2} r1={repos1} r2={repos2} />
            ) : (
              analysis && profile1 && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-8 space-y-8">
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                      <div className="flex flex-col md:flex-row gap-8">
                        <img src={profile1.avatar_url} className="w-32 h-32 rounded-[2.5rem] shadow-2xl border-4 border-white dark:border-slate-700" alt="" />
                        <div className="flex-1">
                          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 italic uppercase tracking-tighter">{profile1.name || profile1.login}</h2>
                          <p className="text-blue-600 dark:text-blue-400 font-bold mb-4 flex items-center gap-2">
                             <Github size={18} /> @{profile1.login}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 text-sm italic border-l-4 border-blue-500/30 pl-4">{profile1.bio || "No bio intel found."}</p>
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
                  <div className="xl:col-span-4 h-fit sticky top-28">
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
          <div className="h-[70vh] flex flex-col items-center justify-center text-center">
            <div className="bg-blue-600/10 p-10 rounded-[4rem] mb-8">
              <Github className="text-blue-600 dark:text-blue-500" size={100} strokeWidth={1} />
            </div>
            <h2 className="text-6xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter mb-4">DevLens Intelligence</h2>
            <p className="text-slate-500 text-xl max-w-2xl italic">Advanced Neural Sourcing Protocol. Audit developer coding DNA through repository forest nodes.</p>
            <div className="flex gap-4 mt-12">
               <button onClick={handleAnalyze} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20">Iniciar Sonda</button>
               <button onClick={() => setIsPricingOpen(true)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs">Upgrade Protocol</button>
            </div>
          </div>
        )}
      </main>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      {isPipelineManagerOpen && (
        <PipelineManager 
          folders={folders}
          onClose={() => setIsPipelineManagerOpen(false)}
          onDeleteFolder={handleDeleteFolder}
          onRemoveCandidate={handleRemoveCandidate}
        />
      )}
    </div>
  );
}

const GranularLoadingScreen = ({ stage, message, subMessage, isBattle }: { stage: number, message: string, subMessage: string, isBattle: boolean }) => {
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [dots, setDots] = useState('');

  const extractionLogs = ["Establishing handshake...", "Retrieving metadata...", "Extracting heatmap...", "Querying repo forest..."];
  const processingLogs = isBattle ? ["Initializing competitive link...", "Calculating DNA parity...", "Simulating workload..."] : ["Booting Logic Engine...", "Performing AST recognition...", "Auditing consistency..."];
  const finalizationLogs = ["Compressing findings...", "Generating summary...", "Handshake complete."];

  useEffect(() => {
    const dotInterval = setInterval(() => setDots(prev => prev.length >= 3 ? '' : prev + '.'), 500);
    let currentLogs = stage === 0 ? extractionLogs : stage === 1 ? processingLogs : finalizationLogs;
    let idx = 0;
    const logInterval = setInterval(() => {
      setLogMessages((prev) => [...prev.slice(-3), currentLogs[idx]]);
      idx = (idx + 1) % currentLogs.length;
    }, 800);
    return () => { clearInterval(dotInterval); clearInterval(logInterval); };
  }, [stage, isBattle]);

  const stages = [
    { name: 'Extração', icon: Database, color: 'text-blue-500' },
    { name: isBattle ? 'Combate' : 'Auditoria', icon: isBattle ? Swords : ShieldCheck, color: isBattle ? 'text-red-500' : 'text-purple-500' },
    { name: 'Solidificação', icon: ShieldCheck, color: 'text-emerald-500' }
  ];

  const currentStage = stages[stage] || stages[0];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-[#0b0f1a] flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-700">
      <div className="w-64 h-64 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
        <currentStage.icon className={`${currentStage.color} animate-pulse`} size={80} />
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black italic uppercase">{message}</h2>
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">{subMessage}{dots}</p>
        <div className="bg-white/50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left w-64 h-32 overflow-hidden mx-auto font-mono text-[10px]">
           {logMessages.map((log, i) => (
             <p key={i} className={i === logMessages.length - 1 ? 'text-blue-500' : 'opacity-40'}>{'>'} {log}</p>
           ))}
        </div>
      </div>
    </div>
  );
};

export default App;import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;  
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Configuração do Supabase ausente ou incompleta. Verifique seu arquivo .env');
}