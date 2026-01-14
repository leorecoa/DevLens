import { supabase } from './supabase';
import { PipelineFolder, UserSubscription } from '../types';

const getUserId = () => {
  let id = localStorage.getItem('devlens_instance_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('devlens_instance_id', id);
  }
  return id;
};

export const syncUserProfile = async (sub: UserSubscription) => {
  if (!supabase) return;

  const userId = getUserId();
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      tier: sub.tier,
      credits_remaining: sub.creditsRemaining,
      total_analyses: sub.totalAnalyses
    });

  if (error) {
    console.error('Supabase Sync Error (Profile):', error.message, error.details);
  }
};

export const fetchUserProfile = async (): Promise<UserSubscription | null> => {
  if (!supabase) return null;

  const userId = getUserId();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // Usar maybeSingle para não gerar erro caso o usuário seja novo

  if (error) {
    console.error('Supabase Fetch Error (Profile):', error.message);
    return null;
  }

  if (!data) return null;

  return {
    tier: data.tier,
    creditsRemaining: data.credits_remaining,
    totalAnalyses: data.total_analyses
  };
};

export const syncFolders = async (folders: PipelineFolder[]) => {
  if (!supabase) return;

  const userId = getUserId();
  const { error } = await supabase
    .from('user_pipelines')
    .upsert({
      user_id: userId,
      folders_json: folders
    });

  if (error) {
    console.error('Supabase Sync Error (Folders):', error.message, error.details);
  }
};

export const fetchFolders = async (): Promise<PipelineFolder[] | null> => {
  if (!supabase) return null;

  const userId = getUserId();
  const { data, error } = await supabase
    .from('user_pipelines')
    .select('folders_json')
    .eq('user_id', userId)
    .maybeSingle(); // Evita o erro PGRST116 (No rows found)

  if (error) {
    console.error('Supabase Fetch Error (Folders):', error.message);
    return null;
  }

  return data ? data.folders_json : null;
};
