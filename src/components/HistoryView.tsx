import React, { useState } from 'react';
import { MangaItem } from '../types';

interface HistoryViewProps {
  mangas: MangaItem[];
  onSelectMangaForReader: (manga: MangaItem) => void;
  onOpenDirectLinksModal: () => void;
  onClearHistory: () => void;
  onRemoveHistoryCovers: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  mangas,
  onSelectMangaForReader,
  onOpenDirectLinksModal,
  onClearHistory,
  onRemoveHistoryCovers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<'ALL' | 'CBZ' | 'PDF' | 'ZIP'>('ALL');

  const filtered = mangas.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.chapter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat =
      selectedFormatFilter === 'ALL' || m.format === selectedFormatFilter;
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#3c4a42] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#4edea3]">Histórico de Downloads & Biblioteca</h2>
          <p className="text-xs font-mono text-[#bbcabf]">
            Coleção local de mangás salvos em seu armazenamento
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenDirectLinksModal}
            className="px-4 py-2 bg-[#10b981] text-[#003824] font-bold text-xs rounded-lg emerald-glow flex items-center gap-2 hover:bg-[#6ffbbe] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">link</span>
            <span>Copiar Links de Imagens</span>
          </button>

          <button
            onClick={onRemoveHistoryCovers}
            className="px-4 py-2 bg-[#171f33] hover:bg-amber-500/20 hover:text-amber-400 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2 rounded-lg transition-all cursor-pointer"
            title="Remove todas as capas e imagens dos metadados do histórico"
          >
            <span className="material-symbols-outlined text-[18px]">no_photography</span>
            <span>Remover Imagens/Capas</span>
          </button>

          <button
            onClick={onClearHistory}
            className="px-4 py-2 bg-[#171f33] hover:bg-red-500/20 hover:text-red-400 border border-red-500/30 text-xs font-mono text-red-300 flex items-center gap-2 rounded-lg transition-all cursor-pointer"
            title="Apaga todo o histórico da biblioteca"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            <span>Apagar Histórico</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-[#3c4a42]/60">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título ou capítulo..."
            className="w-full bg-[#0b1326] border border-[#3c4a42] rounded-lg pl-10 pr-4 py-2 text-xs font-sans text-[#dae2fd] focus:border-[#4edea3] focus:outline-none"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#bbcabf] text-[18px]">
            search
          </span>
        </div>

        {/* Format pill filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar">
          <span className="text-xs font-mono text-[#bbcabf] shrink-0">Formato:</span>
          {(['ALL', 'CBZ', 'PDF', 'ZIP'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormatFilter(fmt)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                selectedFormatFilter === fmt
                  ? 'bg-[#10b981] text-[#003824] font-bold'
                  : 'bg-[#171f33] text-[#bbcabf] hover:bg-[#222a3d]'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* List Table of Manga Items */}
      <div className="bg-[#131b2e] border border-[#3c4a42] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#3c4a42] bg-[#0b1426] text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider">
                <th className="px-6 py-4">Mangá / Obra</th>
                <th className="px-6 py-4">Capítulo</th>
                <th className="px-6 py-4">Formato</th>
                <th className="px-6 py-4">Tamanho</th>
                <th className="px-6 py-4">Data Download</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4a42]/30 text-xs font-sans text-[#dae2fd]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#86948a] font-mono">
                    Nenhum mangá salvo nesta categoria.
                  </td>
                </tr>
              ) : (
                filtered.map((manga) => (
                  <tr key={manga.id} className="hover:bg-[#172136]/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#dae2fd] max-w-xs truncate">
                      {manga.title}
                    </td>
                    <td className="px-6 py-4 font-mono text-[#4edea3] font-semibold">
                      {manga.chapter}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-[#0b1326] border border-[#3c4a42]/60 rounded text-[10px] font-mono text-[#bbcabf]">
                        {manga.format || 'RAW'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {manga.fileSize || '---'}
                    </td>
                    <td className="px-6 py-4 text-[#86948a] font-mono">
                      {manga.downloadedAt || 'Recente'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectMangaForReader(manga)}
                          className="px-3 py-1.5 bg-[#10b981] text-[#003824] font-bold rounded-lg text-xs hover:bg-[#6ffbbe] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          <span>Visualizar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
