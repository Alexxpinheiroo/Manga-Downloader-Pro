import React, { useState } from 'react';
import { MangaItem } from '../types';

interface HistoryViewProps {
  mangas: MangaItem[];
  onSelectMangaForReader: (manga: MangaItem) => void;
  onOpenDirectLinksModal: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  mangas,
  onSelectMangaForReader,
  onOpenDirectLinksModal,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3c4a42] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#4edea3]">Histórico de Downloads & Biblioteca</h2>
          <p className="text-xs font-mono text-[#bbcabf]">
            Coleção local de mangás salvos em seu armazenamento
          </p>
        </div>

        <button
          onClick={onOpenDirectLinksModal}
          className="px-4 py-2 bg-[#10b981] text-[#003824] font-bold text-xs rounded-lg emerald-glow flex items-center gap-2 hover:bg-[#6ffbbe] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">link</span>
          <span>Copiar Todos os Links de Imagens</span>
        </button>
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

      {/* Grid of Manga Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((manga) => (
          <div
            key={manga.id}
            className="bg-[#131b2e] border border-[#3c4a42] rounded-xl p-4 flex gap-4 hover:border-[#4edea3]/50 transition-all shadow-xl group"
          >
            <div
              onClick={() => onSelectMangaForReader(manga)}
              className="w-24 h-36 rounded-lg overflow-hidden bg-[#060e20] shrink-0 relative cursor-pointer border border-[#3c4a42]"
            >
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-mono text-[#4edea3]">
                {manga.format || 'CBZ'}
              </div>
            </div>

            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div className="space-y-1">
                <h4
                  onClick={() => onSelectMangaForReader(manga)}
                  className="font-bold text-base text-[#dae2fd] truncate cursor-pointer hover:text-[#4edea3]"
                >
                  {manga.title}
                </h4>
                <p className="text-xs font-mono text-[#4edea3] font-semibold">{manga.chapter}</p>
                <p className="text-[11px] text-[#bbcabf] line-clamp-2">{manga.description}</p>
              </div>

              <div className="pt-2 border-t border-[#2d3449] flex items-center justify-between text-[11px] font-mono text-[#bbcabf]">
                <span>{manga.fileSize || '35.0 MB'}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectMangaForReader(manga)}
                    className="px-2.5 py-1 bg-[#10b981] text-[#003824] font-bold rounded text-xs hover:bg-[#6ffbbe] transition-colors"
                  >
                    Ler / Ver
                  </button>
                  <a
                    href={manga.coverUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 bg-[#222a3d] text-[#4edea3] rounded border border-[#3c4a42] hover:bg-[#2d3449]"
                    title="Abrir capa em alta resolução em nova aba"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
