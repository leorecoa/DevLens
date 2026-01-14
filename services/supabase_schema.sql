-- 1. Função de Segurança para Atualização de Timestamp
-- Usa SECURITY DEFINER e define o search_path para evitar vulnerabilidades
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Tabela de Perfis de Usuário (Persistência de Créditos e Plano)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY, -- Vinculado ao ID gerado no seu frontend (localStorage ou Auth)
  tier TEXT DEFAULT 'FREE',
  credits_remaining INTEGER DEFAULT 10, -- Garante o saldo inicial de 10 créditos
  total_analyses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para manter updated_at atualizado em user_profiles
DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON public.user_profiles;
CREATE TRIGGER set_updated_at_user_profiles
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Tabela de Pipelines (Persistência de Pastas)
CREATE TABLE IF NOT EXISTS public.user_pipelines (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  folders_json JSONB DEFAULT '[]'::jsonb, -- Armazena toda a estrutura de pastas
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para manter updated_at atualizado em user_pipelines
DROP TRIGGER IF EXISTS set_updated_at_user_pipelines ON public.user_pipelines;
CREATE TRIGGER set_updated_at_user_pipelines
BEFORE UPDATE ON public.user_pipelines
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Configuração de Segurança (RLS)
-- Habilita Row Level Security nas tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pipelines ENABLE ROW LEVEL SECURITY;

-- Cria políticas de acesso
-- NOTA: Como seu app usa um ID gerado localmente (sem Supabase Auth por enquanto),
-- estas políticas são permissivas para permitir que o app funcione.
-- Se adicionar Login oficial depois, altere "true" para "auth.uid() = id".

CREATE POLICY "Permitir acesso total a perfis (Dev)" ON public.user_profiles
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso total a pipelines (Dev)" ON public.user_pipelines
FOR ALL USING (true) WITH CHECK (true);