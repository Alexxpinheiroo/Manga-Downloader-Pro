import React, { useState } from 'react';
import { MangaItem } from '../types';

interface MangaReaderModalProps {
  manga: MangaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectLinks: () => void;
}

export const MangaReaderModal: React.FC<MangaReaderModalProps> = ({
  manga,
  isOpen,
  onClose,
  onOpenDirectLinks,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen || !manga) return null;

  const pages = manga.chapterPages && manga.chapterPages.length > 0
    ? manga.chapterPages
    : [
        {
          pageNumber: 1,
          imageUrl: manga.coverUrl,
          fileName: 'page_01.jpg',
        },
      ];

  const currentPage = pages[currentPageIndex] || pages[0];

  const handleCopyPageUrl = () => {
    navigator.clipboard.writeText(currentPage.imageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full h-full max-w-6xl max-h-[95vh] flex flex-col bg-[#0b1326] border border-[#3c4a42] rounded-2xl overflow-hidden shadow-2xl m-2 sm:m-4">
        {/* Top bar */}
        <div className="px-4 py-3 bg-[#131b2e] border-b border-[#3c4a42] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={manga.coverUrl}
              alt={manga.title}
              className="w-8 h-12 object-cover rounded border border-[#3c4a42]"
            />
            <div>
              <h3 className="text-sm font-bold text-[#dae2fd]">{manga.title}</h3>
              <p className="text-xs font-mono text-[#4edea3]">
                {manga.chapter} • Página {currentPageIndex + 1} de {pages.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPageUrl}
              className="px-3 py-1.5 bg-[#222a3d] hover:bg-[#2d3449] border border-[#3c4a42] text-xs font-mono text-[#4edea3] rounded-lg flex items-center gap-1.5 transition-colors"
              title="Copiar Link Direto da Imagem desta página"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedUrl ? 'check' : 'content_copy'}
              </span>
              <span className="hidden sm:inline">
                {copiedUrl ? 'Link Copiado!' : 'Copiar Link da Imagem'}
              </span>
            </button>

            <button
              onClick={onOpenDirectLinks}
              className="px-3 py-1.5 bg-[#171f33] hover:bg-[#222a3d] border border-[#3c4a42] text-xs font-mono text-[#bbcabf] hover:text-[#dae2fd] rounded-lg flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">image</span>
              <span className="hidden md:inline">Todos os Links</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#bbcabf] hover:text-[#4edea3] hover:bg-[#2d3449] rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Main image viewer stage */}
        <div className="flex-1 relative bg-[#060e20] flex items-center justify-center p-4 overflow-hidden">
          {/* Navigation left */}
          <button
            disabled={currentPageIndex === 0}
            onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
            className="absolute left-4 z-10 p-3 bg-[#131b2e]/80 hover:bg-[#10b981] hover:text-[#003824] border border-[#3c4a42] text-[#dae2fd] rounded-full disabled:opacity-30 disabled:pointer-events-none transition-all backdrop-blur-md"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          {/* Image */}
          <div className="max-h-full max-w-full flex flex-col items-center justify-center relative group">
            <img
              src={currentPage.imageUrl}
              alt={`${manga.title} - Página ${currentPageIndex + 1}`}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-[#2d3449]"
            />

            {/* Direct Link Tag overlay on hover */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-[#3c4a42] px-3 py-1.5 rounded-lg text-[10px] font-mono text-[#4edea3] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
              <span className="truncate max-w-xs">{currentPage.imageUrl}</span>
              <a
                href={currentPage.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white font-bold"
              >
                [Abrir Nova Aba]
              </a>
            </div>
          </div>

          {/* Navigation right */}
          <button
            disabled={currentPageIndex === pages.length - 1}
            onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
            className="absolute right-4 z-10 p-3 bg-[#131b2e]/80 hover:bg-[#10b981] hover:text-[#003824] border border-[#3c4a42] text-[#dae2fd] rounded-full disabled:opacity-30 disabled:pointer-events-none transition-all backdrop-blur-md"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Bottom toolbar */}
        <div className="px-6 py-3 bg-[#131b2e] border-t border-[#3c4a42] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono text-[#bbcabf]">
            <span>Formato: <strong className="text-[#4edea3]">{manga.format || 'CBZ'}</strong></span>
            <span>Tamanho: <strong className="text-[#dae2fd]">{manga.fileSize || '35 MB'}</strong></span>
            <span>Salvo em: <strong className="text-[#dae2fd]">/Downloads/Mangas/{manga.title}</strong></span>
          </div>

          {/* Page index buttons */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-xs sm:max-w-md py-1 custom-scrollbar">
            {pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPageIndex(idx)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors shrink-0 ${
                  currentPageIndex === idx
                    ? 'bg-[#10b981] text-[#003824] font-bold'
                    : 'bg-[#171f33] text-[#bbcabf] hover:bg-[#222a3d]'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
