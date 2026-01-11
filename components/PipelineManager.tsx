
import React from 'react';
import { PipelineFolder, SavedCandidate } from '../types';
import { X, FolderPlus, Trash2, UserMinus, User, Calendar, ExternalLink, ChevronRight } from 'lucide-react';

interface Props {
  folders: PipelineFolder[];
  onClose: () => void;
  onDeleteFolder: (id: string) => void;
  onRemoveCandidate: (folderId: string, username: string) => void;
}

export const PipelineManager: React.FC<Props> = ({ folders, onClose, onDeleteFolder, onRemoveCandidate }) => {
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(folders[0]?.id || null);
  const activeFolder = folders.find(f => f.id === selectedFolderId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-5xl h-[80vh] rounded-[3rem] shadow-2xl flex overflow-hidden animate-in zoom-in duration-300">
        
        {/* Sidebar */}
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Pipeline Folders</h2>
             <button className="text-blue-400 hover:text-blue-300">
               <FolderPlus size={18} />
             </button>
          </div>
          
          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
            {folders.map(f => (
              <button 
                key={f.id}
                onClick={() => setSelectedFolderId(f.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedFolderId === f.id ? 'bg-slate-800 shadow-lg' : 'hover:bg-slate-800/50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className={`text-sm font-bold ${selectedFolderId === f.id ? 'text-white' : 'text-slate-500'}`}>{f.name}</span>
                </div>
                <span className="text-[10px] font-black bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{f.candidates.length}</span>
              </button>
            ))}
          </div>
          
          <button 
            onClick={onClose}
            className="mt-6 w-full py-4 rounded-2xl border border-slate-800 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all"
          >
            Close Terminal
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-8 bg-slate-900/30">
          {activeFolder ? (
            <>
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeFolder.color }} />
                    {activeFolder.name} Intelligence
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    {activeFolder.candidates.length} Targets Acquired
                  </p>
                </div>
                <button 
                  onClick={() => onDeleteFolder(activeFolder.id)}
                  className="p-3 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
                {activeFolder.candidates.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-600">
                    <User size={48} strokeWidth={1} className="mb-4 opacity-20" />
                    <p className="italic text-sm">No candidates scouted in this sector.</p>
                  </div>
                ) : (
                  activeFolder.candidates.map(c => (
                    <div key={c.username} className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all">
                      <div className="flex items-center gap-4">
                        <img src={c.avatar} className="w-12 h-12 rounded-xl border-2 border-slate-700" alt="" />
                        <div>
                          <h4 className="text-sm font-black text-white uppercase italic">{c.username}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-blue-500 uppercase border border-blue-500/30 px-1.5 rounded">{c.seniority}</span>
                            <span className="text-[9px] font-bold text-slate-600 flex items-center gap-1">
                              <Calendar size={10} /> {new Date(c.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <a 
                           href={`https://github.com/${c.username}`} 
                           target="_blank" 
                           rel="noreferrer"
                           className="p-2 text-slate-400 hover:text-white"
                         >
                           <ExternalLink size={16} />
                         </a>
                         <button 
                           onClick={() => onRemoveCandidate(activeFolder.id, c.username)}
                           className="p-2 text-red-400 hover:text-red-300"
                         >
                           <UserMinus size={16} />
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Mission Control</h3>
              <p className="text-sm italic mt-2">Select a sector to view active talent operations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
