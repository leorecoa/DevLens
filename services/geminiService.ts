
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, ComparisonAnalysis } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    seniority: { type: Type.STRING, description: "Junior, Mid, Senior, Lead, or Architect" },
    summary: { type: Type.STRING, description: "A high-level technical summary of the candidate" },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
    skillMatrix: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          score: { type: Type.NUMBER }
        },
        required: ["skill", "score"]
      }
    },
    personalityTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendation: { type: Type.STRING, description: "Hiring recommendation" }
  },
  required: ["seniority", "summary", "strengths", "weaknesses", "techStack", "skillMatrix", "personalityTraits", "recommendation"]
};

const COMPARISON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    winner: { type: Type.STRING, description: "Username of the person who is a better fit" },
    rationale: { type: Type.STRING, description: "Detailed reasoning for the choice" },
    suitabilityScore1: { type: Type.NUMBER, description: "0-100 score for user 1" },
    suitabilityScore2: { type: Type.NUMBER, description: "0-100 score for user 2" },
    comparisonPoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          user1Status: { type: Type.STRING },
          user2Status: { type: Type.STRING }
        },
        required: ["category", "user1Status", "user2Status"]
      }
    }
  },
  required: ["winner", "rationale", "suitabilityScore1", "suitabilityScore2", "comparisonPoints"]
};

// Use gemini-1.5-flash for fast technical auditing and extraction tasks
export async function analyzeProfile(username: string): Promise<AIAnalysis> {
  const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Chave da API (VITE_GOOGLE_API_KEY) não encontrada. Verifique o arquivo .env e reinicie o servidor.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `Analyze the GitHub profile of user "${username}". Assume you have accessed their repositories and contribution history. Provide a deep technical audit of their coding style, consistency, stack specialization, and seniority level.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao processar resposta da IA (Análise):", error);
    throw new Error("Falha ao interpretar a resposta da IA.");
  }
}

// Use gemini-1.5-flash for comparative reasoning tasks with lower latency
export async function compareProfiles(user1: string, user2: string, jd?: string): Promise<ComparisonAnalysis> {
  const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Chave da API (VITE_GOOGLE_API_KEY) não encontrada. Verifique o arquivo .env e reinicie o servidor.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const prompt = jd
    ? `Compare GitHub users "${user1}" and "${user2}" specifically for the following job description: "${jd}". Determine who is the better fit based on their public work and skills.`
    : `Compare GitHub users "${user1}" and "${user2}". Who is the more senior/versatile engineer? Analyze their strengths relative to each other.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: COMPARISON_SCHEMA
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao processar resposta da IA (Comparação):", error);
    throw new Error("Falha ao interpretar a comparação da IA.");
  }
}

// Use gemini-1.5-flash for high-frequency Q&A tasks
export async function chatAboutProfile(username: string, question: string, context: string): Promise<string> {
  const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    return "Erro: Chave de API não configurada. Verifique o .env.";
  }
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `The user is asking about GitHub profile @${username}. 
    Context: ${context}
    Question: ${question}
    
    Answer concisely as a technical recruiter/lead engineer.`,
  });

  return response.text || '';
}
