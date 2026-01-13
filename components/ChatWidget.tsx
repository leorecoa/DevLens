import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, X, Terminal, Sparkles } from 'lucide-react';
import { chatAboutProfile } from '../services/geminiService';

interface Props {
  username: string;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export const ChatWidget: React.FC<Props> = ({ username }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Tactical AI initialized. How can I assist with your evaluation of @${username}?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await chatAboutProfile(username, userMsg, "User is inquiring about GitHub candidate strengths and fitting.");
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to neural uplink. Please retry." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] h-full flex flex-col shadow-2xl dark:shadow-none overflow-hidden transition-colors duration-300">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-2 rounded-lg">
              <Terminal size={16} className="text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Subject AI Assistant</p>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase italic">@ {username}</h4>
            </div>
         </div>
         <Sparkles size={14} className="text-blue-500 animate-pulse" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/20 dark:bg-transparent">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white font-bold rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-tl-none border border-slate-100 dark:border-slate-700'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl flex items-center gap-2 border border-slate-100 dark:border-slate-700 shadow-sm">
              <Loader2 size={12} className="animate-spin text-blue-600 dark:text-blue-500" />
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about subject skills..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-12 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};