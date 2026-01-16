import React, { useEffect, useRef, useState } from 'react';
import {
  Github, Terminal, Loader2, Sparkles, Swords, Users, Folders, Database,
  ShieldCheck, Sun, Moon, Activity, Crown, Search, Wifi,
  ShieldAlert, Cpu as CpuIcon
} from 'lucide-react';

import { analyzeProfile, compareProfiles } from './services/geminiService';
import {
  supabase,
  fetchUserProfile,
  fetchFolders,
  syncUserProfile,
  syncFolders,
  signInWithGitHub,
  signOut
} from './services/supabaseService';

import {
  AppStatus,
  AIAnalysis,
  GitHubProfile,
  Repository,
  ComparisonAnalysis,
  UserSubscription,
  PipelineFolder,
  SavedCandidate
} from './types';

import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { ChatWidget } from './components/ChatWidget';
import { PricingModal } from './components/PricingModal';
import { PipelineManager } from './components/PipelineManager';

const DEFAULT_FREE_LIMIT = 10;

export default function App() {
  /* ======================== AUTH ======================== */
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /* ======================== UI ======================== */
  const [theme, setTheme] = useState(() => localStorage.getItem('devlens_theme') || 'dark');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  /* ======================== DATA ======================== */
  const [sub, setSub] = useState<UserSubscription>({
    tier: 'FREE',
    creditsRemaining: DEFAULT_FREE_LIMIT,
    totalAnalyses: 0
  });

  const [folders, setFolders] = useState<PipelineFolder[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [comparison, setComparison] = useState<ComparisonAnalysis | null>(null);

  const [profile1, setProfile1] = useState<GitHubProfile | null>(null);
  const [profile2, setProfile2] = useState<GitHubProfile | null>(null);
  const [repos1, setRepos1] = useState<Repository[]>([]);
  const [repos2, setRepos2] = useState<Repository[]>([]);

  /* ======================== INPUTS ======================== */
  const [username1, setUsername1] = useState('gaearon');
  const [username2, setUsername2] = useState('danabramov');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [assessmentContext, setAssessmentContext] = useState(
    '- Priority: Senior React\n- Context: Core contributor\n'
  );

  /* ======================== TERMINAL ======================== */
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const log = (msg: string) =>
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-8));

  /* ======================== AUTH LISTENER ======================== */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionUser(data.session?.user ?? null);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_e, session) =>
        setSessionUser(session?.user ?? null)
      );

    return () => subscription.unsubscribe();
  }, []);

  /* ======================== INIT DATA ======================== */
  useEffect(() => {
    if (!sessionUser) {
      setIsInitialized(false);
      setFolders([]);
      setSub({ tier: 'FREE', creditsRemaining: DEFAULT_FREE_LIMIT, totalAnalyses: 0 });
      return;
    }

    if (isInitialized) return;

    const init = async () => {
      try {
        const remoteSub = await fetchUserProfile();
        const remoteFolders = await fetchFolders();
        if (remoteSub) setSub(remoteSub);
        if (remoteFolders) setFolders(remoteFolders);
      } catch {
        console.warn('Supabase init deferred');
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, [sessionUser]);

  /* ======================== CLOUD SYNC ======================== */
  useEffect(() => {
    if (!isInitialized || !sessionUser) return;

    const timer = setTimeout(async () => {
      try {
        await syncUserProfile(sub);
        await syncFolders(folders);
      } catch (e) {
        console.error('Sync failed', e);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [sub, folders, isInitialized, sessionUser]);

  /* ======================== THEME ======================== */
  useEffect(() => {
    localStorage.setItem('devlens_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  /* ======================== GITHUB ======================== */
  const fetchGitHub = async (user: string) => {
    log(`Fetching @${user}`);
    const [p, r] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?per_page=15&sort=updated`)
    ]);
    if (!p.ok) throw new Error(`GitHub user ${user} not found`);
    return { p: await p.json(), r: await r.json() };
  };

  /* ======================== ACTIONS ======================== */
  const handleAnalyze = async () => {
    if (!username1) return;
    if (sub.tier === 'FREE' && sub.creditsRemaining <= 0) return;

    setStatus(AppStatus.LOADING);
    setTerminalLogs([]);
    setError(null);

    try {
      const d = await fetchGitHub(username1);
      setProfile1(d.p);
      setRepos1(d.r);

      const ai = await analyzeProfile(username1);
      setAnalysis(ai);

      setSub(s => ({
        ...s,
        creditsRemaining: s.tier === 'PRO' ? s.creditsRemaining : s.creditsRemaining - 1,
        totalAnalyses: s.totalAnalyses + 1
      }));

      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      setError(e.message);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleCompare = async () => {
    if (!username1 || !username2) return;
    setStatus(AppStatus.LOADING);
    setError(null);

    try {
      const [d1, d2] = await Promise.all([
        fetchGitHub(username1),
        fetchGitHub(username2)
      ]);

      setProfile1(d1.p);
      setProfile2(d2.p);
      setRepos1(d1.r);
      setRepos2(d2.r);

      const c = await compareProfiles(username1, username2, assessmentContext);
      setComparison(c);

      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      setError(e.message);
      setStatus(AppStatus.ERROR);
    }
  };

  /* ======================== PIPELINE ======================== */
  const addToPipeline = (folderId: string, candidate: SavedCandidate) => {
    setFolders(f =>
      f.map(x =>
        x.id === folderId
          ? { ...x, candidates: [...x.candidates.filter(c => c.username !== candidate.username), candidate] }
          : x
      )
    );
  };

  /* ======================== RENDER ======================== */
  if (!sessionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <button onClick={signInWithGitHub} className="flex items-center gap-4 px-12 py-5 bg-white text-black rounded-full">
          <Github /> Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <>
      {/* TODO: mantém seu layout atual aqui */}
      {status === AppStatus.ERROR && (
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <ShieldAlert size={80} className="text-red-500" />
          <p>{error}</p>
        </div>
      )}
    </>
  );
}
