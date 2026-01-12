import { createClient } from '@supabase/supabase-js';

// Tenta obter as variáveis de ambiente (suporte para Vite e Create React App)
// Certifique-se de criar um arquivo .env na raiz do projeto com estas chaves.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;