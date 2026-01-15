
-- Users table to store authentication and subscription info
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  tier TEXT NOT NULL DEFAULT 'FREE',
  credits_remaining INTEGER NOT NULL DEFAULT 10,
  total_analyses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pipelines table to store candidate pipelines for each user
CREATE TABLE IF NOT EXISTS user_pipelines (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  folders_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analyses table to cache results from the Gemini API for single profiles
CREATE TABLE IF NOT EXISTS analyses (
  username TEXT PRIMARY KEY,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comparisons table to cache results for profile comparisons
CREATE TABLE IF NOT EXISTS comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_username TEXT NOT NULL,
  user2_username TEXT NOT NULL,
  comparison_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user1_username, user2_username)
);

-- Repository analyses table to cache results for repository analysis
CREATE TABLE IF NOT EXISTS repository_analyses (
  repo_url TEXT PRIMARY KEY,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
