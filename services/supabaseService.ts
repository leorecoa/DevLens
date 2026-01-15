
import { createClient } from '@supabase/supabase-js';
import { PipelineFolder, UserSubscription } from '../types';

// Função auxiliar para obter variáveis de ambiente de forma segura em ambientes Vite/Node
const getEnv = (key: string): string => {
  // @ts-ignore
  return (typeof process !== 'undefined' && process.env && process.env[key]) || 
         // @ts-ignore
         (import.meta.env && import.meta.env[key]) || 
         '';
};

const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://ubqmetsmfvzmagwlnzfm.supabase.co';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'sb_publishable_7H4TOD_RSu7Osny2chEjDg_n8N7a3Mj';

if (!SUPABASE_URL || SUPABASE_URL === 'UNDEFINED') {
  console.error("ERRO CRÍTICO: SUPABASE_URL não detectada. Verifique as variáveis de ambiente.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Returns the current authenticated user ID or a fallback local ID.
 */
export const getUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) return session.user.id;

  let id = localStorage.getItem('devlens_instance_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('devlens_instance_id', id);
  }
  return id;
};

/**
 * Initiates GitHub OAuth sign-in flow.
 */
export const signInWithGitHub = async () => {
  console.log("Iniciando Neural Auth Protocol via GitHub...");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
      // Garante que o usuário veja a tela de autorização caso tenha problemas
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  });
  
  if (error) {
    console.error("Falha no Uplink de Autenticação:", error.message);
    throw error;
  }
};

/**
 * Signs the current user out.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  localStorage.removeItem('devlens_instance_id');
  window.location.reload(); // Limpa o estado da aplicação
};

export const syncUserProfile = async (sub: UserSubscription) => {
  const userId = await getUserId();
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
  const userId = await getUserId();
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
  const userId = await getUserId();
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
  const userId = await getUserId();
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
