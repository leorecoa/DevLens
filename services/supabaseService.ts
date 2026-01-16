/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';
import { PipelineFolder, UserSubscription } from '../types';

/* ======================== CONFIG ======================== */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase env vars missing');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ======================== AUTH ======================== */
export const signInWithGitHub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/* ======================== PROFILE ======================== */
/**
 * auth.uid() → users.id
 */
export const syncUserProfile = async (sub: UserSubscription) => {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) throw authError;

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      tier: sub.tier,
      credits_remaining: sub.creditsRemaining,
      total_analyses: sub.totalAnalyses
    },
    { onConflict: 'id' }
  );

  if (error) throw error;
};

export const fetchUserProfile = async (): Promise<UserSubscription | null> => {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('tier, credits_remaining, total_analyses')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    tier: data.tier,
    creditsRemaining: data.credits_remaining,
    totalAnalyses: data.total_analyses
  };
};

/* ======================== PIPELINES ======================== */
/**
 * user_pipelines.user_id = auth.uid()
 */
export const syncFolders = async (folders: PipelineFolder[]) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('user_pipelines').upsert(
    {
      user_id: user.id,
      folders_json: folders
    },
    { onConflict: 'user_id' }
  );

  if (error) throw error;
};

export const fetchFolders = async (): Promise<PipelineFolder[] | null> => {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_pipelines')
    .select('folders_json')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  return data.folders_json;
};
