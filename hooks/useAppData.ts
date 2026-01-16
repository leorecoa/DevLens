import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserSubscription, PipelineFolder } from '../types';
import {
  fetchUserProfile,
  fetchFolders,
  syncUserProfile,
  syncFolders,
} from '../services/supabaseService';

const DEFAULT_FREE_LIMIT = 10;

export function useAppData(sessionUser: User | null | undefined) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [sub, setSub] = useState<UserSubscription>({
    tier: 'FREE',
    creditsRemaining: DEFAULT_FREE_LIMIT,
    totalAnalyses: 0,
  });
  const [folders, setFolders] = useState<PipelineFolder[]>([]);

  // Init User Data
  useEffect(() => {
    if (!sessionUser) {
      setIsInitialized(false);
      setFolders([]);
      setSub({
        tier: 'FREE',
        creditsRemaining: DEFAULT_FREE_LIMIT,
        totalAnalyses: 0,
      });
      return;
    }

    if (isInitialized) return;

    const init = async () => {
      try {
        console.log('Iniciando fetch do perfil e pastas do usuário...');
        const remoteSub = await fetchUserProfile(sessionUser.id);
        const remoteFolders = await fetchFolders(sessionUser.id);

        if (remoteSub) setSub(remoteSub);
        if (remoteFolders) setFolders(remoteFolders);

        console.log('Dados carregados:', { remoteSub, remoteFolders });
      } catch (e) {
        console.warn('Supabase init deferred', e);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, [sessionUser, isInitialized]);

  // Cloud Sync
  useEffect(() => {
    if (!sessionUser || !isInitialized) return;

    const timer = setTimeout(async () => {
      try {
        await syncUserProfile(sessionUser.id, sub);
        await syncFolders(sessionUser.id, folders);
      } catch (e) {
        console.error('Sync failed', e);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [sub, folders, sessionUser, isInitialized]);

  return { sub, folders, setSub, setFolders, isInitialized };
}
