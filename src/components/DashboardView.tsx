import React, { useState, useEffect, useRef } from 'react';
import { MangaItem, LogEntry } from '../types';

interface DashboardViewProps {
  urlInput: string;
  setUrlInput: (val: string) => void;
  outputDirectory: string;
  onChangeDirectory: () => void;
  onStartDownload: (url: string) => void;
  logs: LogEntry[];
  onClearLogs: () => void;
  mangas: MangaItem[];
  onSelectMangaForReader: (manga: MangaItem) => void;
  onOpenDirectLinksModal: () => void;
  onOpenPythonScriptModal?: () => void;
  onViewAllHistory: () => void;
  activeProgress: number;
  isDownloading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  urlInput,
  setUrlInput,
  outputDirectory,
  onChangeDirectory,
  onStartDownload,
  logs,
  onClearLogs,
  mangas,
  onSelectMangaForReader,
  onOpenDirectLinksModal,
  onOpenPythonScriptModal,
  onViewAllHistory,
  activeProgress,
  isDownloading,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedTerminal, setCopiedTerminal] = useState(false);

  // Auto-scroll terminal when new log entries arrive
  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleSubmitDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onStartDownload(urlInput);
  };

  const handleCopyLogs = () => {
    const logText = logs.map((l) => `[${l.timestamp}] ${l.type}: ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Input Section Card */}
      <section className="grid grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmitDownload}
          className="col-span-12 glass-panel p-6 sm:p-8 rounded-xl flex flex-col gap-6 shadow-2xl border border-[#3c4a42]/50"
        >
          {/* Queue Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-widest text-[#bbcabf] font-semibold">
                DOWNLOAD QUEUE
              </label>
              {onOpenPythonScriptModal && (
                <button
                  type="button"
                  onClick={onOpenPythonScriptModal}
                  className="text-xs font-mono text-[#4edea3] hover:underline flex items-center gap-1 bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/30 hover:bg-[#10b981]/20 transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">terminal</span>
                  <span>Gerar Script Python (.py)</span>
                </button>
              )}
            </div>
            <div className="relative group">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Insira a URL do capítulo ou mangá aqui..."
                className="w-full h-14 bg-[#0b1326] border border-[#3c4a42] rounded-lg pl-12 pr-4 text-base text-[#dae2fd] placeholder:text-[#86948a] focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-all duration-300 font-sans"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#bbcabf] group-focus-within:text-[#4edea3] transition-colors">
                link
              </span>
            </div>
          </div>

          {/* Directory & Start button row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono uppercase tracking-widest text-[#bbcabf] font-semibold">
                OUTPUT DIRECTORY
              </label>
              <div className="flex items-center gap-2 bg-[#0b1326] border border-[#3c4a42] rounded-lg px-4 h-12">
                <span className="material-symbols-outlined text-[#bbcabf]">folder_open</span>
                <span className="text-sm font-mono text-[#dae2fd] flex-1 truncate">
                  {outputDirectory}
                </span>
                <button
                  type="button"
                  onClick={onChangeDirectory}
                  className="text-[#4edea3] hover:text-[#6ffbbe] transition-colors font-medium text-sm hover:underline"
                >
                  Alterar
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isDownloading && !urlInput.trim()}
                className="w-full h-12 bg-[#10b981] text-[#003824] font-bold rounded-lg emerald-glow hover:bg-[#6ffbbe] hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-base"
              >
                <span className="material-symbols-outlined font-bold">
                  {isDownloading ? 'sync' : 'download'}
                </span>
                <span>{isDownloading ? 'Processando Download...' : 'Iniciar Download'}</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Monitoring Section: Real-time activity */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-[#4edea3] tracking-tight">
              Atividade em Tempo Real
            </h3>
            {isDownloading && (
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#4edea3] text-[10px] font-mono border border-[#10b981]/40 animate-pulse">
                BAIXANDO
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-[#bbcabf]">
            {activeProgress}% Completo
          </span>
        </div>

        {/* Progress Bar with Gradient Flow Animation */}
        <div className="w-full h-3 bg-[#2d3449] rounded-full overflow-hidden p-0.5 border border-[#3c4a42]/50">
          <div
            className="h-full bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#6ffbbe] animate-flow rounded-full transition-all duration-300"
            style={{ width: `${Math.max(activeProgress, 2)}%` }}
          ></div>
        </div>

        {/* Terminal Log Panel */}
        <div className="bg-black/85 backdrop-blur-md rounded-xl border border-[#3c4a42] p-5 h-64 overflow-y-auto custom-scrollbar font-mono text-xs flex flex-col gap-1.5 shadow-2xl relative">
          {/* Terminal toolbar header */}
          <div className="sticky top-0 bg-black/90 pb-2 border-b border-[#2d3449] mb-2 flex items-center justify-between text-[10px] text-[#bbcabf]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#tertiary]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
              <span className="ml-2 text-[#4edea3] font-bold">Terminal Automation Log v2.4</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAutoScroll(!autoScroll)}
                className={`hover:text-[#4edea3] transition-colors ${
                  autoScroll ? 'text-[#4edea3]' : 'text-[#86948a]'
                }`}
                title="Auto Scroll"
              >
                [AutoScroll: {autoScroll ? 'ON' : 'OFF'}]
              </button>
              <button
                type="button"
                onClick={handleCopyLogs}
                className="hover:text-[#4edea3] transition-colors"
                title="Copiar logs"
              >
                {copiedTerminal ? '[Copiado!]' : '[Copiar]'}
              </button>
              <button
                type="button"
                onClick={onClearLogs}
                className="hover:text-[#ffb4ab] transition-colors"
                title="Limpar terminal"
              >
                [Limpar]
              </button>
            </div>
          </div>

          {/* Log Lines */}
          {logs.map((log) => {
            let colorClass = 'text-[#bbcabf]';
            if (log.type === 'EXEC') colorClass = 'text-[#4edea3] font-bold';
            if (log.type === 'OK') colorClass = 'text-[#45dfa4]';
            if (log.type === 'WAIT') colorClass = 'text-[#bbcabf]';
            if (log.type === 'WARN') colorClass = 'text-amber-300';
            if (log.type === 'ERROR') colorClass = 'text-[#ffb4ab] font-bold';

            return (
              <p key={log.id} className="leading-relaxed break-words">
                <span className="text-[#86948a]">[{log.timestamp}]</span>{' '}
                <span
                  className={
                    log.type === 'INFO'
                      ? 'text-[#4edea3]'
                      : log.type === 'EXEC'
                      ? 'text-[#6ffbbe]'
                      : log.type === 'OK'
                      ? 'text-[#45dfa4]'
                      : 'text-[#bbcabf]'
                  }
                >
                  {log.type}:
                </span>{' '}
                <span className={colorClass}>{log.message}</span>
              </p>
            );
          })}

          <div className="flex items-center gap-1 mt-1">
            <span className="animate-pulse h-4 w-2 bg-[#4edea3] inline-block"></span>
            <span className="text-[10px] text-[#86948a]">Aguardando novos comandos...</span>
          </div>

          <div ref={terminalEndRef} />
        </div>
      </section>

      {/* History Grid: Recent Downloads */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#3c4a42] pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-[#dae2fd]">Downloads Recentes</h3>
            <button
              onClick={onOpenDirectLinksModal}
              className="text-xs font-mono text-[#4edea3] hover:underline bg-[#171f33] border border-[#3c4a42] px-2.5 py-1 rounded-md flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">link</span>
              <span>Links de Imagens</span>
            </button>
          </div>
          <button
            onClick={onViewAllHistory}
            className="text-sm text-[#4edea3] hover:underline font-medium"
          >
            Ver tudo
          </button>
        </div>

        {/* List Table of Manga Items */}
        <div className="bg-[#131b2e] border border-[#3c4a42] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3c4a42] bg-[#0b1426] text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider">
                  <th className="px-6 py-3">Mangá / Obra</th>
                  <th className="px-6 py-3">Capítulo</th>
                  <th className="px-6 py-3">Formato</th>
                  <th className="px-6 py-3">Tamanho</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c4a42]/30 text-xs font-sans text-[#dae2fd]">
                {mangas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-[#86948a] font-mono">
                      Nenhum download concluído ainda.
                    </td>
                  </tr>
                ) : (
                  mangas.slice(0, 6).map((manga) => (
                    <tr key={manga.id} className="hover:bg-[#172136]/50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-[#dae2fd] max-w-xs truncate">
                        {manga.title}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-[#4edea3] font-semibold">
                        {manga.chapter}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 bg-[#0b1326] border border-[#3c4a42]/60 rounded text-[10px] font-mono text-[#bbcabf]">
                          {manga.format || 'RAW'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono">
                        {manga.fileSize || '---'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => onSelectMangaForReader(manga)}
                          className="px-3 py-1.5 bg-[#10b981] text-[#003824] font-bold rounded-lg text-xs hover:bg-[#6ffbbe] transition-colors flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          <span>Visualizar</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
