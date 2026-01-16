import React, { useState } from 'react';
import { Github, Loader2, ShieldAlert } from 'lucide-react';

import { signInWithGitHub, signOut } from './services/supabaseService';
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';

import { AppStatus } from './types';
import Dashboard from './pages/Dashboard';

export default function App() {
  const sessionUser = useAuth();
  const { folders } = useAppData(sessionUser);

  // ==================== UI ====================
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  // ==================== LOADING SCREEN ====================
  if (sessionUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  // ==================== LOGIN SCREEN ====================
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

  // ==================== APP ====================
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button
        onClick={signOut}
        className="fixed top-6 right-6 text-sm text-white opacity-70 hover:opacity-100"
      >
        Sign out
      </button>

      <h1 className="text-2xl font-bold mb-4">Bem-vindo, {sessionUser.email}</h1>

      <Dashboard folders={folders} />

      {status === AppStatus.ERROR && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-red-500 gap-4">
          <ShieldAlert size={64} />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
