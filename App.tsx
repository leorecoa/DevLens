
import React, { useState, useEffect } from 'react';
import { Github, Terminal, Loader2, Sparkles, Swords, Users, Crown, Shield, ClipboardList, X, Target, Folders, Cpu, Database, Binary, ShieldCheck, Activity, Fingerprint, Layers, Star, GitFork, ChevronRight, FileDown, Linkedin, Twitter, Link, Network, Sun, Moon, Zap, Search, Code, Cpu as Core, Boxes, ZapOff } from 'lucide-react';
import { analyzeProfile, compareProfiles } from './services/geminiService';
import { AppStatus, AIAnalysis, GitHubProfile, Repository, ComparisonAnalysis, UserSubscription, PipelineFolder, SavedCandidate } from './types';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatWidget } from './components/ChatWidget';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { PricingModal } from './components/PricingModal';
import { PipelineManager } from './components/PipelineManager';

const FREE_LIMIT = 10;

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

  const [sub, setSub] = useState<UserSubscription>(() => {
    try {
      const saved = localStorage.getItem('devlens_sub');
      return saved ? JSON.parse(saved) : { tier: 'FREE', creditsRemaining: FREE_LIMIT, totalAnalyses: 0 };
    } catch {
      return { tier: 'FREE', creditsRemaining: FREE_LIMIT, totalAnalyses: 0 };
    }
  });

  const [folders, setFolders] = useState<PipelineFolder[]>(() => {
    try {
      const saved = localStorage.getItem('devlens_pipeline');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPipelineManagerOpen, setIsPipelineManagerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('devlens_sub', JSON.stringify(sub));
  }, [sub]);

  useEffect(() => {
    localStorage.setItem('devlens_pipeline', JSON.stringify(folders));
  }, [folders]);

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
    if (isCompareMode && !username2.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    setComparison(null);
    setAnalysis(null);
    
    try {
      setLoadingStage(0);
      setLoadingMessage('Fetching GitHub Data');
      setLoadingSubMessage('Mapeando identidades via nós do GitHub...');
      
      if (isCompareMode) {
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
      } else {
        const d1 = await fetchGitHubData(username1);
        setProfile1(d1.p);
        setRepos1(d1.r);
        
        setLoadingStage(1);
        setLoadingMessage('AI Analysis');
        setLoadingSubMessage('Gemini 3 sondando matriz de habilidades e senioridade...');
        const aiResult = await analyzeProfile(username1);
        setAnalysis(aiResult);
      }
      
      setLoadingStage(2);
      setLoadingMessage('Final Synthesis');
      setLoadingSubMessage('Empacotando inteligência criptografada...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSub((prev: UserSubscription) => ({
        ...prev,
        creditsRemaining: prev.tier === 'PRO' ? prev.creditsRemaining : Math.max(0, prev.creditsRemaining - 1),
        totalAnalyses: prev.totalAnalyses + 1
      }));
      
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      console.error('Análise falhou:', e);
      setError(e.message || 'Falha crítica na sonda neural. Verifique sua conexão.');
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
    setFolders(folders.filter((f: PipelineFolder) => f.id !== id));
  };

  const handleAddToPipeline = (folderId: string, candidate: SavedCandidate) => {
    setFolders(folders.map((f: PipelineFolder) => {
      if (f.id === folderId) {
        if (f.candidates.some((c: SavedCandidate) => c.username === candidate.username)) return f;
        return { ...f, candidates: [...f.candidates, candidate] };
      }
      return f;
    }));
  };

  const handleRemoveCandidate = (folderId: string, username: string) => {
    setFolders(folders.map((f: PipelineFolder) => {
      if (f.id === folderId) {
        return { ...f, candidates: f.candidates.filter((c: SavedCandidate) => c.username !== username) };
      }
      return f;
    }));
  };

  const renderLoadingScreen = () => {
    return <GranularLoadingScreen stage={loadingStage} message={loadingMessage} subMessage={loadingSubMessage} isBattle={isCompareMode} />;
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

            <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setIsPipelineManagerOpen(true)}
                className="flex flex-col items-start group"
              >
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Talent Pipeline</span>
                <div className="flex items-center gap-2">
                  <Folders size={14} className="text-blue-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {folders.reduce((acc: number, f: PipelineFolder) => acc + f.candidates.length, 0)} Salvos
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full max-w-2xl">
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Github size={16} />
                </div>
                <input 
                  type="text"
                  value={username1}
                  onChange={(e) => setUsername1(e.target.value)}
                  placeholder="Perfil Principal"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              {isCompareMode && (
                <>
                  <Swords className="text-slate-400 dark:text-slate-600 shrink-0 animate-pulse" size={16} />
                  <div className="relative flex-1 animate-in slide-in-from-right duration-300">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <Github size={16} />
                    </div>
                    <input 
                      type="text"
                      value={username2}
                      onChange={(e) => setUsername2(e.target.value)}
                      placeholder="Perfil Oponente"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-violet-600" />}
              </button>
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`p-2.5 rounded-xl border transition-all shadow-sm ${isCompareMode ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                <Users size={18} />
              </button>
              <button 
                onClick={handleAnalyze} 
                disabled={status === AppStatus.LOADING}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {status === AppStatus.LOADING ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {isCompareMode ? 'Batalha' : 'Inspecionar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative">
        {status === AppStatus.LOADING && renderLoadingScreen()}

        {status === AppStatus.ERROR && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in duration-300">
            <Fingerprint className="text-red-500 mb-6" size={64} />
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Erro no Sistema</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md text-sm mb-8 italic">{error}</p>
            <button onClick={handleAnalyze} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-10 py-4 rounded-2xl text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">Tentar Novamente</button>
          </div>
        )}

        {status === AppStatus.SUCCESS && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {isCompareMode && comparison && profile1 && profile2 ? (
              <ComparisonDashboard comparison={comparison} p1={profile1} p2={profile2} r1={repos1} r2={repos2} />
            ) : (
              analysis && profile1 && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-8 space-y-8">
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm transition-colors duration-300">
                      <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <img src={profile1.avatar_url} className="w-36 h-36 rounded-[2.5rem] shadow-2xl border-4 border-white dark:border-slate-700 group-hover:scale-105 transition-transform duration-500" alt="" />
                        <div className="flex-1">
                          <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-2 italic uppercase tracking-tighter leading-none">{profile1.name || profile1.login}</h2>
                          <p className="text-blue-600 dark:text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">
                             <Github size={20} /> @{profile1.login}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic border-l-4 border-blue-500/30 pl-6">{profile1.bio || "Sem bio inteligível encontrada."}</p>
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
          <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-12 max-w-5xl px-6">
              <div className="relative group">
                <div className="bg-white dark:bg-blue-600/10 p-12 rounded-[5rem] border border-slate-200 dark:border-blue-500/10 shadow-2xl relative transition-colors">
                  <Github className="text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-all duration-1000" size={120} strokeWidth={1} />
                  <div className="absolute -bottom-6 -right-6 bg-yellow-500 p-6 rounded-[2.5rem] shadow-2xl border-8 border-slate-50 dark:border-[#0b0f1a]">
                    <Crown className="text-black" size={48} fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.8em]">Protocolo de Recrutamento Neural</p>
                <h2 className="text-8xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-[0.8]">
                  DevLens <br/> <span className="text-blue-600 dark:text-blue-500">Intelligence</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-2xl leading-relaxed italic max-w-3xl mx-auto font-medium">
                  Sonde perfis do GitHub com Gemini 3. Audite habilidades e compare DNA técnico através de árvores de repositórios públicos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 pt-4">
                <button 
                  onClick={handleAnalyze} 
                  className="bg-blue-600 hover:bg-blue-500 px-16 py-8 rounded-[2.5rem] font-black text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-6 group"
                >
                  <Sparkles size={32} className="group-hover:rotate-12 transition-transform" />
                  Sondar Perfil
                </button>
              </div>
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

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-700 text-[10px] font-black uppercase tracking-[0.6em] bg-white/30 dark:bg-slate-900/30 no-print transition-colors duration-300">
        DevLens // Logic Engine: Gemini 3 Pro
      </footer>
    </div>
  );
}

const GranularLoadingScreen = ({ stage, message, subMessage, isBattle }: { stage: number, message: string, subMessage: string, isBattle: boolean }) => {
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [dots, setDots] = useState('');

  const extractionLogs = [
    "Establishing handshake with GitHub...",
    "Retrieving profile metadata...",
    "Extracting contribution heatmap...",
    "Querying repo forest nodes..."
  ];

  const processingLogs = isBattle ? [
    "Initializing competitive neural link...",
    "Calculating technical DNA parity...",
    "Simulating workload scenarios..."
  ] : [
    "Booting Gemini 3 Logic Engine...",
    "Performing AST pattern recognition...",
    "Auditing commit consistency metrics..."
  ];

  const finalizationLogs = [
    "Compressing findings...",
    "Generating report summary...",
    "Data handshake complete."
  ];

  useEffect(() => {
    const dotInterval = setInterval(() => setDots(prev => prev.length >= 3 ? '' : prev + '.'), 500);
    let currentLogs = stage === 0 ? extractionLogs : stage === 1 ? processingLogs : finalizationLogs;
    let idx = 0;
    const logInterval = setInterval(() => {
      setLogMessages((prev) => [...prev.slice(-3), currentLogs[idx]]);
      idx = (idx + 1) % currentLogs.length;
    }, 1000);
    return () => { clearInterval(dotInterval); clearInterval(logInterval); };
  }, [stage, isBattle]);

  const stages = [
    { name: 'Extração', icon: Database, color: 'text-blue-500' },
    { name: isBattle ? 'Combate' : 'Auditoria', icon: isBattle ? Swords : Core, color: isBattle ? 'text-red-500' : 'text-purple-500' },
    { name: 'Solidificação', icon: ShieldCheck, color: 'text-emerald-500' }
  ];

  const currentStage = stages[stage] || stages[0];
  const progressPercent = ((stage + 1) / 3) * 100;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-[#0b0f1a] flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-700 transition-colors">
      <div className="relative">
        <div className={`relative z-10 w-72 h-72 rounded-full bg-white dark:bg-[#0d1424] border-4 border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700`}>
          <div className="flex flex-col items-center gap-6 relative z-10">
            <currentStage.icon className={`${currentStage.color} animate-pulse`} size={90} />
            <div className="flex gap-3">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${i === stage ? `${currentStage.color} scale-125` : 'bg-slate-200 dark:bg-slate-800'}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center w-full space-y-8">
        <h2 className="text-6xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">{message}</h2>
        <div className="max-w-3xl mx-auto w-full space-y-4">
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full overflow-hidden p-1">
             <div className={`h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">{subMessage}{dots}</p>
        </div>

        <div className="bg-white/50 dark:bg-[#080c14]/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 text-left max-w-2xl mx-auto shadow-2xl">
          <div className="space-y-2 h-24 overflow-hidden flex flex-col justify-end">
            {logMessages.map((log, i) => (
              <p key={i} className={`text-[11px] font-mono ${i === logMessages.length - 1 ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-600 opacity-40'}`}>
                {'>'} {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
