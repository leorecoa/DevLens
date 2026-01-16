-- DevLens Database Schema
-- Dialect: PostgreSQL

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------
-- Table `users`
-- Stores user account information.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table `projects`
-- Stores information about the code repositories to be analyzed.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  git_url VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table `pipelines`
-- Manages different analysis configurations or pipelines.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  config JSONB, -- Stores pipeline configuration, e.g., steps, tools
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table `analyses`
-- Stores the results of each analysis run.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., pending, in_progress, completed, failed
  summary JSONB, -- Stores high-level metrics and results
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- -----------------------------------------------------
-- Table `analysis_results`
-- Stores detailed findings from an analysis.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  file_path VARCHAR(1024),
  line_number INT,
  severity VARCHAR(50), -- e.g., critical, high, medium, low, info
  type VARCHAR(100), -- e.g., 'security', 'code_smell', 'complexity'
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- Table `comparisons`
-- Stores data for comparing different analyses.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  base_analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  compare_analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  result JSONB, -- Stores the comparison output
  created_at TIMESTAMTz DEFAULT NOW()
);

-- -----------------------------------------------------
-- Indexes for performance
-- -----------------------------------------------------
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_pipelines_project_id ON pipelines(project_id);
CREATE INDEX idx_analyses_project_id ON analyses(project_id);
CREATE INDEX idx_analysis_results_analysis_id ON analysis_results(analysis_id);
CREATE INDEX idx_comparisons_project_id ON comparisons(project_id);
