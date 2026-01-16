import { createClient } from '@supabase/supabase-js';
import { UserSubscription, PipelineFolder } from '../types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);


// ==================== AUTH ====================
export const signInWithGitHub = async () => {
  await supabase.auth.signInWithOAuth({ provider: 'github' });
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

// ==================== USER PROFILE ====================
export const fetchUserProfile = async (userId: string): Promise<UserSubscription | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserSubscription;
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return null;
  }
};

export const syncUserProfile = async (userId: string, profile: UserSubscription) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([{ id: userId, ...profile }]);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao sincronizar perfil do usuário:', err);
    return null;
  }
};

// ==================== FOLDERS ====================
export const fetchFolders = async (userId: string): Promise<PipelineFolder[]> => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar pastas:', err);
    return [];
  }
};

export const syncFolders = async (userId: string, folders: PipelineFolder[]) => {
  try {
    const updates = folders.map(folder => ({ ...folder, user_id: userId }));
    const { data, error } = await supabase
      .from('folders')
      .upsert(updates);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao sincronizar pastas:', err);
    return [];
  }
};
