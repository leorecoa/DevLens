import React from 'react';
import { PipelineFolder, SavedCandidate } from '../types';
import { X, FolderPlus, Trash2, UserMinus, User, Calendar, ExternalLink, ChevronRight } from 'lucide-react';

interface Props {
  folders: PipelineFolder[];
  onClose: () => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRemoveCandidate: (folderId: string, username: string) => void;
  onEditFolder: (id: string, name: string, color: string) => void;
}

export const PipelineManager: React.FC<Props> = ({ folders, onClose, onCreateFolder, onDeleteFolder, onRemoveCandidate, onEditFolder }) => {
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(folders[0]?.id || null);
  const [showNewFolderInput, setShowNewFolderInput] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null);
  const [editedFolderName, setEditedFolderName] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('#60a5fa');
  const activeFolder = folders.find(f => f.id === selectedFolderId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40 dark:bg-black/60 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[80vh] rounded-[3rem] shadow-2xl flex overflow-hidden animate-in zoom-in duration-300">
        
        {/* Sidebar */}
        <div className="w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pipeline Folders</h2>
             <button 
               onClick={() => setShowNewFolderInput(!showNewFolderInput)}
               className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
             >
               <FolderPlus size={18} />
             </button>
          </div>
          
          {showNewFolderInput && (
            <div className="mb-4 flex items-center gap-2">
              <input 
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder name"
                className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={() => {
                  if (newFolderName.trim()) {
                    onCreateFolder(newFolderName.trim());
                    setNewFolderName('');
                    setShowNewFolderInput(false);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg text-sm"
              >
                Save
              </button>
              <button 
                onClick={() => {
                  setNewFolderName('');
                  setShowNewFolderInput(false);
                }}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 p-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          )}
          
          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
            {folders.map(f => (
              <div key={f.id} className="flex items-center justify-between">
                {editingFolderId === f.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input 
                      type="text"
                      value={editedFolderName}
                      onChange={(e) => setEditedFolderName(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-8 h-8 rounded-lg"
                    />
                    <button 
                      onClick={() => {
                        onEditFolder(f.id, editedFolderName, selectedColor);
                        setEditingFolderId(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg text-sm"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingFolderId(null)}
                      className="bg-slate-300 hover:bg-slate-400 text-slate-800 p-2 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedFolderId === f.id ? 'bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: f.color }} />
                      <span className={`text-sm font-bold ${selectedFolderId === f.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{f.name}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${selectedFolderId === f.id ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{f.candidates.length}</span>
                  </button>
                )}
                {editingFolderId !== f.id && (
                  <button 
                    onClick={() => {
                      setEditingFolderId(f.id);
                      setEditedFolderName(f.name);
                      setSelectedColor(f.color);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button 
            onClick={onClose}
            className="mt-6 w-full py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            Close Terminal
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-8 bg-white dark:bg-slate-900/30 transition-colors duration-300">
          {activeFolder ? (
            <>
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: activeFolder.color }} />
                    {activeFolder.name} Intelligence
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {activeFolder.candidates.length} Targets Acquired
                  </p>
                </div>
                <button 
                  onClick={() => onDeleteFolder(activeFolder.id)}
                  className="p-3 text-red-500/50 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
                {activeFolder.candidates.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-300 dark:text-slate-600">
                    <User size={48} strokeWidth={1} className="mb-4 opacity-50" />
                    <p className="italic text-sm">No candidates scouted in this sector.</p>
                  </div>
                ) : (
                  activeFolder.candidates.map(c => (
                    <div key={c.username} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <img src={c.avatar} className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-700 shadow-md" alt="" />
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{c.username}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase border border-blue-500/30 px-1.5 rounded">{c.seniority}</span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 flex items-center gap-1">
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
                           className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                         >
                           <ExternalLink size={16} />
                         </a>
                         <button 
                           onClick={() => onRemoveCandidate(activeFolder.id, c.username)}
                           className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
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
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Mission Control</h3>
              <p className="text-sm italic mt-2">Select a sector to view active talent operations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};