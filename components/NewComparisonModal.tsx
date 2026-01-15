import React, { useState } from 'react';
import { X, Swords, Loader2 } from 'lucide-react';

interface NewComparisonModalProps {
  onClose: () => void;
  onCompare: (user1: string, user2: string, jd?: string) => void;
  loading: boolean;
  error: string | null;
}

export const NewComparisonModal: React.FC<NewComparisonModalProps> = ({ onClose, onCompare, loading, error }) => {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user1.trim() && user2.trim()) {
      onCompare(user1.trim(), user2.trim(), jobDescription.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-3">
          <Swords size={24} className="text-blue-500" /> New Comparison
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user1" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              GitHub Username 1
            </label>
            <input
              type="text"
              id="user1"
              value={user1}
              onChange={(e) => setUser1(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., octocat"
            />
          </div>
          <div>
            <label htmlFor="user2" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              GitHub Username 2
            </label>
            <input
              type="text"
              id="user2"
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., defunkt"
            />
          </div>
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Optional: Job Description (for context)
            </label>
            <textarea
              id="jobDescription"
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 'Senior Software Engineer specializing in distributed systems...'"
            ></textarea>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-[15px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
            disabled={loading || !user1.trim() || !user2.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Comparing...
              </>
            ) : (
              <>
                <Swords size={20} /> Start Comparison
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};