import { createClient } from '@supabase/supabase-js';
import { PipelineFolder, UserSubscription } from '../types';

// Use environment variables from process.env with the provided keys as default fallbacks.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ubqmetsmfvzmagwlnzfm.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_7H4TOD_RSu7Osny2chEjDg_n8N7a3Mj';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'UNDEFINED') {
  console.warn("Supabase credentials might be missing or invalid. Check your environment variables.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const getUserId = () => {
  let id = localStorage.getItem('devlens_instance_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('devlens_instance_id', id);
  }
  return id;
};

export const syncUserProfile = async (sub: UserSubscription) => {
  const userId = getUserId();
  const { error } = await supabase
    .from('users')
    .upsert({ 
      id: userId, 
      tier: sub.tier, 
      credits_remaining: sub.creditsRemaining, 
      total_analyses: sub.totalAnalyses 
    }, { onConflict: 'id' });
  
  if (error) {
    console.error('Supabase Sync Error (Profile):', error.message);
    throw error;
  }
};

export const fetchUserProfile = async (): Promise<UserSubscription | null> => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
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
  const userId = getUserId();
  const { error } = await supabase
    .from('user_pipelines')
    .upsert({ 
      user_id: userId, 
      folders_json: folders 
    }, { onConflict: 'user_id' });
  
  if (error) {
    console.error('Supabase Sync Error (Folders):', error.message);
    throw error;
  }
};

export const fetchFolders = async (): Promise<PipelineFolder[] | null> => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('user_pipelines')
    .select('folders_json')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Supabase Fetch Error (Folders):', error.message);
    return null;
  }
  
  return data ? data.folders_json : null;
};
