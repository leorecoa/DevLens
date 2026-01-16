import React, { useEffect, useRef, useState } from 'react';
import {
  Github,
  Loader2,
  ShieldAlert
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

const DEFAULT_FREE_LIMIT = 10;

export default function App() {
  /* ======================== AUTH ======================== */
  // undefined = loading | null = logged out | object = logged in
  const [sessionUser, setSessionUser] = useState<any | undefined>(undefined);

  /* ======================== INIT ======================== */
  const [isInitialized, setIsInitialized] = useState(false);

  /* ======================== DATA ======================== */
  const [sub, setSub] = useState<UserSubscription>({
    tier: 'FREE',
    creditsRemaining: DEFAULT_FREE_LIMIT,
    totalAnalyses: 0
  });

  const [folders, setFolders] = useState<PipelineFolder[]>([]);

  /* ======================== UI ======================== */
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  /* ======================== AUTH LISTENER ======================== */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionUser(data.session?.user ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ======================== CLEAN OAUTH HASH ======================== */
  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  /* ======================== INIT USER DATA ======================== */
  useEffect(() => {
    if (!sessionUser) {
      setIsInitialized(false);
      setFolders([]);
      setSub({
        tier: 'FREE',
        creditsRemaining: DEFAULT_FREE_LIMIT,
        totalAnalyses: 0
      });
      return;
    }

    if (isInitialized) return;

    const init = async () => {
      try {
        const remoteSub = await fetchUserProfile();
        const remoteFolders = await fetchFolders();

        if (remoteSub) setSub(remoteSub);
        if (remoteFolders) setFolders(remoteFolders);
      } catch (e) {
        console.warn('Supabase init deferred');
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, [sessionUser, isInitialized]);

  /* ======================== CLOUD SYNC ======================== */
  useEffect(() => {
    if (!sessionUser || !isInitialized) return;

    const timer = setTimeout(async () => {
      try {
        await syncUserProfile(sub);
        await syncFolders(folders);
      } catch (e) {
        console.error('Sync failed', e);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [sub, folders, sessionUser, isInitialized]);

  /* ======================== LOADING SCREEN ======================== */
  if (sessionUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  /* ======================== LOGIN SCREEN ======================== */
  if (!sessionUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-6">
        <h1 className="text-3xl font-bold">DevLens</h1>

        <button
          onClick={signInWithGitHub}
          className="flex items-center gap-4 px-12 py-5 bg-white text-black rounded-full"
        >
          <Github /> Sign in with GitHub
        </button>
      </div>
    );
  }

  /* ======================== APP ======================== */
  return (
    <>
      {/* Seu layout principal entra aqui */}

      <button
        onClick={signOut}
        className="fixed top-6 right-6 text-sm text-white opacity-70 hover:opacity-100"
      >
        Sign out
      </button>

      {status === AppStatus.ERROR && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-red-500 gap-4">
          <ShieldAlert size={64} />
          <p>{error}</p>
        </div>
      )}
    </>
  );
}
