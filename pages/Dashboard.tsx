import React from 'react';
import { PipelineFolder } from '../types';

const FolderItem = ({ name, fileCount }: { name: string; fileCount: number }) => (
  <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
    <div className="flex items-center">
      <img src="/folders-icon.svg" alt="Folder" className="h-6 w-6 mr-3 text-indigo-400" />
      <span className="font-medium text-white">{name}</span>
    </div>
    <span className="text-sm text-gray-400">{fileCount} files</span>
  </div>
);

const AnalysisCard = ({ title, description, lastRun }: { title: string; description: string; lastRun: string }) => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm mb-4">{description}</p>
    <div className="text-xs text-gray-500">
      <span>Last run: </span>
      <span>{lastRun}</span>
    </div>
  </div>
);


interface DashboardProps {
  folders: PipelineFolder[];
}

const Dashboard = ({ folders }: DashboardProps) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Pastas Recentes</h2>
        <div className="grid gap-4">
          {folders.map((folder, index) => (
            <FolderItem key={index} name={folder.path || folder.name} fileCount={folder.fileCount || 0} />
          ))}
          {folders.length === 0 && <p className="text-gray-500">Nenhuma pasta analisada ainda.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Análises em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnalysisCard
            title="Análise de Complexidade"
            description="Mede a complexidade ciclomática do código."
            lastRun="Ontem às 15:30"
          />
          <AnalysisCard
            title="Detecção de Duplicação"
            description="Encontra blocos de código duplicados no projeto."
            lastRun="Hoje às 10:00"
          />
          <AnalysisCard
            title="Qualidade do Código (Lint)"
            description="Verifica a conformidade com as regras de estilo."
            lastRun="Há 2 horas"
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
