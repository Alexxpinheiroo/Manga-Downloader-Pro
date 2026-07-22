import React, { useState } from 'react';
import { DownloadTask } from '../types';

interface TasksViewProps {
  tasks: DownloadTask[];
  onToggleTaskPause: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
  onAddBatchTasks: (mangaTitle: string, chaptersStr: string) => void;
  onOpenDirectLinksModal: () => void;
  onClearTasks: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTaskPause,
  onCancelTask,
  onAddBatchTasks,
  onOpenDirectLinksModal,
  onClearTasks,
}) => {
  const [batchTitle, setBatchTitle] = useState('');
  const [batchChapters, setBatchChapters] = useState('100-105');
  const [selectedFormat, setSelectedFormat] = useState<'CBZ' | 'PDF' | 'ZIP' | 'RAW'>('CBZ');

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTitle.trim()) return;
    onAddBatchTasks(batchTitle, batchChapters);
    setBatchTitle('');
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#3c4a42] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#4edea3]">Gerenciador de Tarefas</h2>
          <p className="text-xs font-mono text-[#bbcabf]">
            Fila de downloads ativas, agendadas e concluídas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenDirectLinksModal}
            className="px-4 py-2 bg-[#171f33] hover:bg-[#222a3d] border border-[#3c4a42] rounded-lg text-xs font-mono text-[#4edea3] flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">image</span>
            <span>Links de Imagens</span>
          </button>

          <button
            onClick={onClearTasks}
            className="px-4 py-2 bg-[#171f33] hover:bg-red-500/20 hover:text-red-400 border border-red-500/30 rounded-lg text-xs font-mono text-red-300 flex items-center gap-2 transition-all cursor-pointer"
            title="Limpa todas as tarefas concluídas, canceladas ou com erro da fila"
          >
            <span className="material-symbols-outlined text-[18px]">clear_all</span>
            <span>Limpar Histórico da Fila</span>
          </button>
        </div>
      </div>

      {/* Batch Chapter Downloader Tool */}
      <form
        onSubmit={handleBatchSubmit}
        className="glass-panel p-6 rounded-xl border border-[#3c4a42]/60 flex flex-col gap-4 shadow-xl"
      >
        <div className="flex items-center gap-2 text-[#4edea3]">
          <span className="material-symbols-outlined">auto_awesome</span>
          <h3 className="text-sm font-bold text-[#dae2fd]">Download em Lote de Capítulos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider block mb-1">
              Nome do Mangá / Série
            </label>
            <input
              type="text"
              value={batchTitle}
              onChange={(e) => setBatchTitle(e.target.value)}
              placeholder="Ex: Hunter x Hunter"
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded-lg px-3 py-2 text-xs font-mono text-[#dae2fd] focus:border-[#4edea3] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider block mb-1">
              Capítulos (Intervalo)
            </label>
            <input
              type="text"
              value={batchChapters}
              onChange={(e) => setBatchChapters(e.target.value)}
              placeholder="Ex: 1-10 ou 1, 5, 12"
              className="w-full bg-[#0b1326] border border-[#3c4a42] rounded-lg px-3 py-2 text-xs font-mono text-[#dae2fd] focus:border-[#4edea3] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider block mb-1">
              Formato Final
            </label>
            <div className="flex gap-2">
              {(['CBZ', 'PDF', 'ZIP', 'RAW'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedFormat(fmt)}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg border transition-colors ${
                    selectedFormat === fmt
                      ? 'bg-[#10b981] text-[#003824] border-[#10b981]'
                      : 'bg-[#0b1326] text-[#bbcabf] border-[#3c4a42] hover:bg-[#222a3d]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#10b981] hover:bg-[#6ffbbe] text-[#003824] font-bold text-xs rounded-lg transition-all emerald-glow flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Adicionar Lote à Fila</span>
          </button>
        </div>
      </form>

      {/* Task Queue List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-[#dae2fd]">Fila de Downloads Ativas ({tasks.length})</h3>

        <div className="space-y-4">
          {tasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isPaused = task.status === 'Paused';

            return (
              <div
                key={task.id}
                className="bg-[#131b2e] border border-[#3c4a42] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden"
              >
                {/* Status Indicator stripe */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isCompleted
                      ? 'bg-[#10b981]'
                      : isPaused
                      ? 'bg-amber-400'
                      : 'bg-[#4edea3] animate-pulse'
                  }`}
                />

                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <img
                    src={task.coverUrl}
                    alt={task.mangaTitle}
                    className="w-14 h-20 object-cover rounded-lg border border-[#3c4a42] shrink-0"
                  />

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-base text-[#dae2fd] truncate">
                        {task.mangaTitle}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          isCompleted
                            ? 'bg-[#10b981]/20 text-[#4edea3] border-[#10b981]/30'
                            : isPaused
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            : 'bg-[#222a3d] text-[#6ffbbe] border-[#3c4a42]'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-[#4edea3]">{task.chapterName}</p>

                    <p className="text-[11px] font-mono text-[#bbcabf] truncate">
                      Caminho: {task.outputDir}
                    </p>

                    {/* Progress details */}
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-[#bbcabf]">
                        <span>
                          Páginas: {task.downloadedPages} / {task.totalPages}
                        </span>
                        <span>
                          {task.speed} • ETA: {task.eta}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-[#0b1326] rounded-full overflow-hidden border border-[#2d3449]">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            isCompleted ? 'bg-[#10b981]' : 'bg-gradient-to-r from-[#10b981] to-[#6ffbbe]'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {!isCompleted && (
                    <button
                      onClick={() => onToggleTaskPause(task.id)}
                      className="px-3 py-1.5 bg-[#222a3d] hover:bg-[#2d3449] border border-[#3c4a42] text-xs font-mono text-[#dae2fd] rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isPaused ? 'play_arrow' : 'pause'}
                      </span>
                      <span>{isPaused ? 'Retomar' : 'Pausar'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onCancelTask(task.id)}
                    className="p-2 bg-[#222a3d] hover:bg-red-500/20 hover:text-red-400 text-[#bbcabf] border border-[#3c4a42] rounded-lg transition-colors"
                    title="Remover tarefa"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
