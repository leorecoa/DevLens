-- This script contains the necessary SQL commands to set up the database schema for the DevLens project on Supabase.

-- Drop tables in reverse order of dependency to avoid errors if they already exist.
DROP TABLE IF EXISTS public.user_pipelines;
DROP TABLE IF EXISTS public.users;


-- Create the users table to store subscription and usage info.
-- This table holds one record per user, identified by a client-generated UUID.
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  tier TEXT NOT NULL DEFAULT 'FREE',
  credits_remaining INTEGER NOT NULL DEFAULT 10,
  total_analyses INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Stores user-specific data like subscription tier and analysis credits.';
COMMENT ON COLUMN public.users.id IS 'Unique identifier for the user, generated client-side.';


-- Create the user_pipelines table to store saved candidates.
-- This table uses a JSONB column to flexibly store folder structures and candidates.
CREATE TABLE public.user_pipelines (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  folders_json JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_pipelines IS 'Stores the pipeline folders and saved candidates for each user.';
COMMENT ON COLUMN public.user_pipelines.user_id IS 'Foreign key referencing the user this pipeline belongs to.';
COMMENT ON COLUMN public.user_pipelines.folders_json IS 'JSON object containing the array of folders and their candidates.';


/*
-- OPTIONAL: ROW LEVEL SECURITY (RLS)
-- The following policies are for a setup with proper Supabase authentication (e.g., user logins).
-- The current app uses a client-side ID and would require a more complex setup to be secure with RLS.
-- For a production environment, implementing real user authentication is strongly recommended.

-- 1. Enable RLS on the tables
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_pipelines ENABLE ROW LEVEL SECURITY;

-- 2. Create policies that allow users to only access/modify their own data
-- CREATE POLICY "Allow users to manage their own profile"
-- ON public.users
-- FOR ALL
-- USING (id = auth.uid())
-- WITH CHECK (id = auth.uid());

-- CREATE POLICY "Allow users to manage their own pipeline"
-- ON public.user_pipelines
-- FOR ALL
-- USING (user_id = auth.uid())
-- WITH CHECK (user_id = auth.uid());
*/
