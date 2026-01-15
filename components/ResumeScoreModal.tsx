import React, { useState } from 'react';
import { FileText, X, Loader2 } from 'lucide-react';
import { scoreResume } from '../services/geminiService';
import { ResumeScore } from '../types';

interface ResumeScoreModalProps {
  onClose: () => void;
}

export const ResumeScoreModal: React.FC<ResumeScoreModalProps> = ({ onClose }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScoreResume = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume text and a job description.');
      return;
    }
    setLoading(true);
    setError(null);
    setResumeScore(null);
    try {
      const score = await scoreResume(resumeText, jobDescription);
      setResumeScore(score);
    } catch (err) {
      console.error('Error scoring resume:', err);
      setError('Failed to score resume. Please try again.');
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
          <FileText size={24} className="text-emerald-500" /> Score Resume
        </h3>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="resumeText" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Resume Text
            </label>
            <textarea
              id="resumeText"
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Paste the candidate's resume text here..."
            ></textarea>
          </div>
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Paste the job description here..."
            ></textarea>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          onClick={handleScoreResume}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-[15px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Scoring...
            </>
          ) : (
            <>
              <FileText size={20} /> Score Resume
            </>
          )}
        </button>

        {resumeScore && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Resume Score: {resumeScore.score}/100</h4>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{resumeScore.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Pros</h5>
                <ul className="space-y-2 list-disc list-inside">
                  {resumeScore.pros.map((pro, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-300">{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Cons</h5>
                <ul className="space-y-2 list-disc list-inside">
                  {resumeScore.cons.map((con, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-300">{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};