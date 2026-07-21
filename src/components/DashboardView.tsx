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
  const [selectedMangaForQuickLink, setSelectedMangaForQuickLink] = useState<MangaItem | null>(null);

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
      <section className="flex flex-col gap-6">
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

        {/* 6 Manga Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {mangas.map((manga) => (
            <div
              key={manga.id}
              className="group relative flex flex-col gap-2 cursor-pointer"
            >
              <div
                onClick={() => onSelectMangaForReader(manga)}
                className="aspect-[2/3] w-full rounded-lg overflow-hidden relative shadow-xl border border-[#3c4a42]/40 bg-[#131b2e]"
              >
                <img
                  src={manga.coverUrl}
                  alt={manga.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 glass-panel rounded text-[10px] font-bold text-[#4edea3] flex items-center gap-1 uppercase tracking-tighter shadow">
                  <span className="material-symbols-filled text-[12px]">check_circle</span>
                  <span>{manga.status}</span>
                </div>

                {/* Quick inspect image trigger on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity p-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMangaForReader(manga);
                    }}
                    className="px-3 py-1.5 bg-[#10b981] text-[#003824] font-bold rounded-lg text-xs shadow hover:bg-[#6ffbbe]"
                  >
                    Ler / Abrir
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMangaForQuickLink(manga);
                    }}
                    className="px-2 py-1 bg-[#171f33]/90 text-[#4edea3] text-[10px] font-mono rounded border border-[#3c4a42] hover:bg-[#222a3d]"
                  >
                    Link da Imagem
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <h4
                  onClick={() => onSelectMangaForReader(manga)}
                  className="font-bold text-sm text-[#dae2fd] truncate hover:text-[#4edea3] transition-colors"
                >
                  {manga.title}
                </h4>
                <p className="text-xs font-mono text-[#bbcabf]">{manga.chapter}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Image Link Modal Popup for a single manga */}
      {selectedMangaForQuickLink && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-[#3c4a42] rounded-xl p-6 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b border-[#3c4a42] pb-3">
              <h4 className="font-bold text-base text-[#dae2fd]">
                Direct Cover URL: {selectedMangaForQuickLink.title}
              </h4>
              <button
                onClick={() => setSelectedMangaForQuickLink(null)}
                className="text-[#bbcabf] hover:text-[#4edea3]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={selectedMangaForQuickLink.coverUrl}
                alt={selectedMangaForQuickLink.title}
                className="w-16 h-24 object-cover rounded border border-[#3c4a42]"
              />
              <div className="flex-1 space-y-2 overflow-hidden">
                <p className="text-xs font-mono text-[#4edea3] break-all bg-[#0b1326] p-2 rounded border border-[#2d3449]">
                  {selectedMangaForQuickLink.coverUrl}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMangaForQuickLink.coverUrl);
                      alert('URL da capa copiada com sucesso!');
                    }}
                    className="px-3 py-1.5 bg-[#10b981] text-[#003824] font-bold rounded text-xs"
                  >
                    Copiar URL
                  </button>
                  <a
                    href={selectedMangaForQuickLink.coverUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#222a3d] text-[#dae2fd] rounded text-xs border border-[#3c4a42]"
                  >
                    Abrir Imagem Directa
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
