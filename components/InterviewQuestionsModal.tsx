import React, { useState } from 'react';
import { Terminal, X, Loader2 } from 'lucide-react';
import { generateInterviewQuestions } from '../services/geminiService';
import { InterviewQuestions } from '../types';

interface InterviewQuestionsModalProps {
  username: string;
  onClose: () => void;
}

export const InterviewQuestionsModal: React.FC<InterviewQuestionsModalProps> = ({ username, onClose }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }
    setLoading(true);
    setError(null);
    setInterviewQuestions(null);
    try {
      const questions = await generateInterviewQuestions(username, jobDescription);
      setInterviewQuestions(questions);
    } catch (err) {
      console.error('Error generating interview questions:', err);
      setError('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg w-full max-w-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-3">
          <Terminal size={24} className="text-purple-500" /> Generate Interview Questions
        </h3>

        <div className="mb-6">
          <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="E.g., 'Senior Frontend Engineer with expertise in React, TypeScript, and AWS.'"
          ></textarea>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <button
          onClick={handleGenerateQuestions}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-[15px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Terminal size={20} /> Generate Questions
            </>
          )}
        </button>

        {interviewQuestions && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Generated Questions</h4>
            {interviewQuestions.questions.length > 0 ? (
              <ul className="space-y-4">
                {interviewQuestions.questions.map((q, index) => (
                  <li key={index} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{q.question}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Topic:</span> {q.topic} | <span className="font-medium">Difficulty:</span> {q.difficulty}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No questions generated. Try a different job description.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};