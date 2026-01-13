import React, { useState, useEffect } from 'react';
import { Github, Terminal, Loader2, Sparkles, Swords, Users, Crown, Shield, ClipboardList, X, Target, Folders, Cpu, Database, Network, Binary, ShieldCheck, Activity, Fingerprint, Layers } from 'lucide-react';
import { analyzeProfile, compareProfiles } from './services/geminiService';
import { supabase } from './services/supabase';
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
  const [loadingStage, setLoadingStage] = useState(0); 
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

  const [folders, setFolders] = useState<PipelineFolder[]>([]);
  const [isFoldersLoading, setIsFoldersLoading] = useState(true);

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPipelineManagerOpen, setIsPipelineManagerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('devlens_sub', JSON.stringify(sub));
  }, [sub]);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!supabase) {
        setIsFoldersLoading(false);
        return;
      }
      
      const { data, error } = await supabase.from('folders').select('*');
      if (!error && data) {
        setFolders(data);
      }
      setIsFoldersLoading(false);
    };
    fetchFolders();
  }, []);

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
        setLoadingMessage('Estabelecendo Conexão');
        setLoadingSubMessage('Mapeando identidades via nós do GitHub...');
        
        const [d1, d2] = await Promise.all([
          fetchGitHubData(username1),
          fetchGitHubData(username2)
        ]);
        
        setProfile1(d1.p);
        setRepos1(d1.r);
        setProfile2(d2.p);
        setRepos2(d2.r);
        
        setLoadingStage(1);
        setLoadingMessage('Simulação de Combate');
        setLoadingSubMessage('Redes neurais calculando superioridade estratégica...');
        const compResult = await compareProfiles(username1, username2, jdInput);
        setComparison(compResult);
      } else {
        setLoadingStage(0);
        setLoadingMessage('Buscando Intel');
        setLoadingSubMessage('Acessando árvores de repositórios e histórico...');
        const d1 = await fetchGitHubData(username1);
        setProfile1(d1.p);
        setRepos1(d1.r);
        
        setLoadingStage(1);
        setLoadingMessage('Decodificação Neural');
        setLoadingSubMessage('Gemini 3 sondando matriz de habilidades e senioridade...');
        const aiResult = await analyzeProfile(username1);
        setAnalysis(aiResult);
      }
      
      setLoadingStage(2);
      setLoadingMessage('Finalizando Dossiê');
      setLoadingSubMessage('Empacotando inteligência criptografada...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSub(prev => ({
        ...prev,
        creditsRemaining: prev.tier === 'PRO' ? prev.creditsRemaining : Math.max(0, prev.creditsRemaining - 1),
        totalAnalyses: prev.totalAnalyses + 1
      }));
      
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Falha crítica durante a sonda neural.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleCreateFolder = async (name: string) => {
    const newFolder: PipelineFolder = {
      id: Date.now().toString(),
      name,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      candidates: []
    };

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      // Se tiver usuário, vincula o ID, senão tenta inserir (o RLS pode bloquear se não tiver user)
      const folderToInsert = user ? { ...newFolder, user_id: user.id } : newFolder;
      
      const { error } = await supabase.from('folders').insert([folderToInsert]);
      if (error) {
        console.error('Erro ao criar pasta:', error);
        return;
      }
    }
    setFolders([...folders, newFolder]);
  };

  const handleDeleteFolder = async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from('folders').delete().eq('id', id);
      if (error) {
        console.error('Erro ao deletar pasta:', error);
        return;
      }
    }
    setFolders(folders.filter(f => f.id !== id));
  };

  const handleAddToPipeline = async (folderId: string, candidate: SavedCandidate) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder || folder.candidates.some(c => c.username === candidate.username)) return;

    const updatedCandidates = [...folder.candidates, candidate];

    if (supabase) {
      const { error } = await supabase.from('folders').update({ candidates: updatedCandidates }).eq('id', folderId);
      if (error) console.error('Erro ao atualizar pipeline:', error);
    }

    setFolders(folders.map(f => f.id === folderId ? { ...f, candidates: updatedCandidates } : f));
  };

  const handleRemoveCandidate = async (folderId: string, username: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const updatedCandidates = folder.candidates.filter(c => c.username !== username);

    if (supabase) {
      const { error } = await supabase.from('folders').update({ candidates: updatedCandidates }).eq('id', folderId);
      if (error) console.error('Erro ao remover candidato:', error);
    }

    setFolders(folders.map(f => f.id === folderId ? { ...f, candidates: updatedCandidates } : f));
  };

  const renderLoadingScreen = () => {
    return <GranularLoadingScreen stage={loadingStage} message={loadingMessage} subMessage={loadingSubMessage} isBattle={isCompareMode} />;
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
                    {isFoldersLoading ? (
                      <Loader2 size={12} className="animate-spin text-slate-500" />
                    ) : (
                      `${folders.reduce((acc, f) => acc + f.candidates.length, 0)} Salvos`
                    )}
                  </span>
                </div>
              </button>
              <div className="h-8 w-px bg-slate-800"></div>
              <button 
                onClick={() => setIsPricingOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${sub.tier === 'PRO' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black'}`}
              >
                {sub.tier === 'PRO' ? <Shield size={12} fill="currentColor" /> : <Crown size={12} fill="currentColor" />}
                {sub.tier === 'PRO' ? 'Ativo Pro' : 'Go Pro'}
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
                  placeholder="Perfil Principal"
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
                      placeholder="Perfil Oponente"
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
                title="Alternar Batalha"
              >
                <Users size={18} />
              </button>
              {isCompareMode && (
                <button 
                  onClick={() => setIsJdOpen(!isJdOpen)}
                  className={`p-2.5 rounded-xl border transition-all ${jdInput ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  title="Anexar Vaga"
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
                {isCompareMode ? 'Batalha' : 'Inspecionar'}
              </button>
            </div>
          </div>
        </div>
        
        {isCompareMode && isJdOpen && (
          <div className="max-w-7xl mx-auto mt-4 animate-in slide-in-from-top duration-300">
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col gap-3 backdrop-blur-md">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Target size={12} /> Payload de Contexto de Vaga
                 </p>
                 <button onClick={() => setIsJdOpen(false)}><X size={14} className="text-slate-500 hover:text-white" /></button>
               </div>
               <textarea 
                  value={jdInput}
                  onChange={(e) => setJdInput(e.target.value)}
                  placeholder="Cole a descrição da vaga para análise de fit especializado..."
                  className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-yellow-500 custom-scrollbar"
               />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative">
        {status === AppStatus.LOADING && renderLoadingScreen()}

        {status === AppStatus.ERROR && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in duration-300">
            <Fingerprint className="text-red-500 mb-6" size={64} />
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Mau funcionamento do sistema</h2>
            <p className="text-slate-400 max-w-md text-sm mb-8 italic">{error}</p>
            <button onClick={handleAnalyze} className="bg-slate-800 border border-slate-700 px-10 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-all">Tentar Novamente</button>
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
                            Conta {sub.tier}
                         </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <img src={profile1.avatar_url} className="w-36 h-36 rounded-[2.5rem] shadow-2xl border-4 border-slate-700 group-hover:scale-105 transition-transform duration-500" alt="" />
                        <div className="flex-1">
                          <h2 className="text-5xl font-black text-white mb-2 italic uppercase tracking-tighter leading-none">{profile1.name || profile1.login}</h2>
                          <p className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">
                             <Github size={20} /> @{profile1.login}
                          </p>
                          <p className="text-slate-300 text-lg leading-relaxed italic border-l-4 border-blue-500/30 pl-6">{profile1.bio || "Sujeito operando em silêncio de rádio (Sem bio)."}</p>
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
          <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Capa Background Visuals */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 bg-grid-slate-700/[0.05] [mask-image:radial-gradient(white,transparent)]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-12 max-w-5xl px-6">
              <div className="relative group">
                <div className="bg-blue-600/10 p-12 rounded-[5rem] border border-blue-500/10 shadow-[0_0_50px_rgba(37,99,235,0.1)] relative">
                  <Github className="text-blue-500 group-hover:scale-110 transition-all duration-1000" size={120} strokeWidth={1} />
                  <div className="absolute -bottom-6 -right-6 bg-yellow-500 p-6 rounded-[2.5rem] shadow-2xl border-8 border-[#0b0f1a]">
                    <Crown className="text-black" size={48} fill="currentColor" />
                  </div>
                </div>
                {/* Orbital Ring */}
                <div className="absolute inset-0 -m-8 border-2 border-slate-800 rounded-[6rem] animate-spin-slow opacity-20 border-dashed"></div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.8em]">Protocolo de Recrutamento Neural</p>
                  <h2 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">
                    Inteligência <br/> <span className="text-blue-500">Recruitment</span> <br/> Neural
                  </h2>
                </div>
                <p className="text-slate-400 text-2xl leading-relaxed italic max-w-3xl mx-auto font-medium">
                  Sonde perfis do GitHub com Gemini 3. Audite habilidades, preveja senioridade e compare DNA técnico através de árvores de repositórios públicos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 pt-4">
                <button 
                  onClick={handleAnalyze} 
                  className="group relative bg-blue-600 hover:bg-blue-500 px-16 py-8 rounded-[2.5rem] font-black text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-6 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Sparkles size={32} className="group-hover:rotate-12 transition-transform" />
                  Sondar Setor
                </button>
                <button 
                  onClick={() => setIsCompareMode(true)} 
                  className="bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 px-16 py-8 rounded-[2.5rem] font-black text-white uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-6 group"
                >
                  <Swords size={32} className="text-slate-500 group-hover:text-red-500 transition-colors" />
                  Batalha Tática
                </button>
              </div>

              <div className="pt-20 flex items-center gap-12 text-slate-700">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50">Powered By</span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center"><Cpu size={16} className="text-blue-500" /></div>
                    <span className="text-xs font-bold uppercase tracking-tighter">Gemini 3 Pro</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50">Data Uplink</span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center"><Network size={16} /></div>
                    <span className="text-xs font-bold uppercase tracking-tighter">GitHub REST v4</span>
                  </div>
                </div>
              </div>
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

      <footer className="py-12 border-t border-slate-800 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.6em] bg-slate-900/30 no-print">
        DevLens // Advanced Neural Sourcing Unit // Gemini 3 Logic Engine Active
      </footer>
    </div>
  );
}

// Internal Granular Loading Screen Component
const GranularLoadingScreen = ({ stage, message, subMessage, isBattle }: { stage: number, message: string, subMessage: string, isBattle: boolean }) => {
  const [logMessages, setLogMessages] = useState<string[]>([]);
  
  const fetchLogs = ["Mapeando Endpoints da API...", "Solicitando autorização do nó...", "Extraindo histórico de contribuição...", "Analisando nós da árvore do repositório...", "Decodificando fragmentos de metadados do usuário..."];
  const aiLogs = ["Inicializando Motor Lógico Gemini 3...", "Realizando análise de padrões AST...", "Medindo métricas de consistência de commit...", "Sintetizando matrizes de habilidades...", "Projetando trajetórias de senioridade..."];
  const battleLogs = ["Estabelecendo link neural competitivo...", "Calculando desempenho lado a lado...", "Medindo paridade de DNA técnico...", "Executando algoritmos de adequação...", "Determinando vencedor estratégico..."];
  const finalizeLogs = ["Empacotando inteligência criptografada...", "Gerando dossiês de relatórios...", "Otimizando buffers de visualização...", "Finalizando dossiês executivos...", "Pronto para implantação."];

  useEffect(() => {
    let currentLogs = stage === 0 ? fetchLogs : stage === 1 ? (isBattle ? battleLogs : aiLogs) : finalizeLogs;
    let idx = 0;
    const interval = setInterval(() => {
      setLogMessages(prev => [...prev.slice(-4), currentLogs[idx]]);
      idx = (idx + 1) % currentLogs.length;
    }, 800);
    return () => clearInterval(interval);
  }, [stage, isBattle]);

  const stages = [
    { name: 'Extração de Dados', icon: Database, color: 'text-blue-500', accent: 'bg-blue-500/10' },
    { name: isBattle ? 'Simulação de Batalha' : 'Auditoria Neural', icon: isBattle ? Swords : Cpu, color: isBattle ? 'text-red-500' : 'text-purple-500', accent: isBattle ? 'bg-red-500/10' : 'bg-purple-500/10' },
    { name: 'Síntese', icon: ShieldCheck, color: 'text-emerald-500', accent: 'bg-emerald-500/10' }
  ];

  const currentStage = stages[stage] || stages[0];
  const progressPercent = ((stage + 1) / 3) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-4xl mx-auto px-6 space-y-12 animate-in fade-in duration-500">
      {/* Central Tactical Visualizer */}
      <div className="relative group">
        <div className={`absolute inset-0 rounded-full border border-slate-800 animate-pulse-ring scale-150 opacity-10`}></div>
        <div className="absolute inset-0 rounded-full border-2 border-slate-700 animate-spin opacity-30" style={{ animationDuration: '15s' }}></div>
        
        <div className="relative z-10 w-72 h-72 rounded-full bg-[#0d1424] border-4 border-slate-800 shadow-[0_0_100px_rgba(37,99,235,0.1)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-grid-slate-700/[0.1] [mask-image:radial-gradient(white,transparent)]"></div>
          </div>
          
          <div className="flex flex-col items-center gap-8 relative z-10">
            <div className={`transition-all duration-1000 transform ${stage === 1 ? 'scale-110 rotate-12' : 'scale-100'}`}>
               <currentStage.icon 
                 className={`${currentStage.color} ${stage === 1 ? 'animate-bounce' : stage === 2 ? 'animate-pulse' : 'animate-pulse'}`} 
                 size={100} 
                 strokeWidth={1.5}
               />
            </div>
            <div className="flex gap-3">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-700 ${i === stage ? `${currentStage.color} scale-125 shadow-[0_0_15px_currentColor]` : 'bg-slate-800'}`}></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative Orbital Elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 border border-slate-800 rounded-2xl flex items-center justify-center bg-slate-900/40 backdrop-blur-xl">
          <Binary size={32} className="text-slate-600" />
        </div>
        <div className="absolute -bottom-10 -left-10 w-20 h-20 border border-slate-800 rounded-2xl flex items-center justify-center bg-slate-900/40 backdrop-blur-xl">
          <Layers size={32} className="text-slate-600" />
        </div>
      </div>

      {/* Primary Message Area */}
      <div className="text-center w-full space-y-8">
        <div className="space-y-4">
          <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">
            {message}
          </h2>
          <p className="text-slate-500 text-sm font-black uppercase tracking-[0.5em] h-6">
            {subMessage}
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-blue-500" />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Protocolo Ativo</span>
            </div>
            <span className="text-sm font-black text-blue-400 uppercase tracking-widest">{Math.round(progressPercent)}% Sincronização Completa</span>
          </div>
          
          <div className="h-4 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
             <div 
               className={`h-full bg-gradient-to-r ${stage === 1 && isBattle ? 'from-red-700 via-red-500 to-yellow-500' : 'from-blue-700 via-blue-400 to-emerald-400'} rounded-full transition-all duration-1000 ease-in-out relative`}
               style={{ width: `${progressPercent}%` }}
             >
               <div className="absolute inset-0 bg-white/20 animate-data-flow"></div>
             </div>
          </div>
        </div>

        {/* Real-time Operational Console */}
        <div className="bg-[#080c14] border border-slate-800 rounded-[2rem] p-8 text-left backdrop-blur-3xl relative overflow-hidden group max-w-3xl mx-auto shadow-2xl">
          <div className={`absolute top-0 left-0 w-2 h-full ${stage === 1 && isBattle ? 'bg-red-500' : 'bg-blue-600'}`}></div>
          <div className="flex gap-8 items-start">
            <div className={`p-5 rounded-2xl ${currentStage.accent} ${currentStage.color} shrink-0`}>
              <Terminal size={32} />
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Neural Terminal v4.5.1</p>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-[10px] font-mono text-slate-600 uppercase">Latência: 12ms</span>
                 </div>
              </div>
              <div className="space-y-2 h-32 overflow-hidden flex flex-col justify-end">
                {logMessages.map((log, i) => (
                  <p key={i} className={`text-xs font-mono transition-all duration-500 ${i === logMessages.length - 1 ? 'text-blue-400 translate-x-1' : 'text-slate-600 opacity-50'}`}>
                    <span className="text-slate-800 mr-2">{'>'}</span> {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Stepper Component */}
        <div className="flex items-center justify-between px-10 max-w-3xl mx-auto pt-6">
          {stages.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-1000 ${
                  i < stage ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
                  i === stage ? `bg-blue-600/10 border-blue-500 ${currentStage.color} shadow-[0_0_50px_rgba(37,99,235,0.3)] scale-110` :
                  'bg-slate-900 border-slate-800 text-slate-700'
                }`}>
                  {i < stage ? <ShieldCheck size={40} /> : <s.icon size={36} />}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-700 ${i <= stage ? 'text-slate-300' : 'text-slate-700'}`}>
                  {s.name}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className="flex-1 h-1 bg-slate-800 relative mx-6 rounded-full overflow-hidden">
                  {i < stage && <div className="absolute inset-0 bg-emerald-500"></div>}
                  {i === stage && <div className="absolute inset-0 bg-blue-500 animate-data-flow"></div>}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;