
export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GitHubProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface Repository {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export interface SkillScore {
  skill: string;
  score: number; // 0-100
}

export interface AIAnalysis {
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Architect';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  techStack: string[];
  skillMatrix: SkillScore[];
  personalityTraits: string[];
  recommendation: string;
}

export interface ComparisonAnalysis {
  winner: string;
  rationale: string;
  suitabilityScore1: number;
  suitabilityScore2: number;
  comparisonPoints: {
    category: string;
    user1Status: string;
    user2Status: string;
  }[];
}

export interface SavedCandidate {
  username: string;
  name: string;
  avatar: string;
  seniority: string;
  addedAt: string;
}

export interface PipelineFolder {
  id: string;
  name: string;
  color: string;
  candidates: SavedCandidate[];
}

export interface UserSubscription {
  tier: 'FREE' | 'PRO';
  creditsRemaining: number;
  totalAnalyses: number;
}
