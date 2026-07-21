import React, { useState } from 'react';
import { MangaItem } from '../types';
import { LOGO_URL } from '../data/mangaData';

interface DirectImageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  mangas: MangaItem[];
}

export const DirectImageLinksModal: React.FC<DirectImageLinksModalProps> = ({
  isOpen,
  onClose,
  mangas,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ title: string; url: string } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'covers' | 'logo'>('all');

  if (!isOpen) return null;

  const allImages = [
    {
      id: 'logo-img',
      type: 'logo',
      name: 'Logo do Manga Downloader Pro',
      url: LOGO_URL,
      htmlTag: `<img src="${LOGO_URL}" alt="Manga Downloader Pro Logo" className="h-8 w-8 object-contain" />`,
    },
    ...mangas.map((m) => ({
      id: m.id,
      type: 'covers',
      name: `${m.title} - ${m.chapter}`,
      url: m.coverUrl,
      htmlTag: `<img src="${m.coverUrl}" alt="${m.title} ${m.chapter}" className="w-full h-full object-cover" />`,
    })),
  ];

  const filteredImages = allImages.filter(
    (img) => filterType === 'all' || img.type === filterType
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#131b2e] border border-[#3c4a42] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#3c4a42] flex items-center justify-between bg-[#171f33]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#10b981]/10 rounded-lg text-[#4edea3]">
              <span className="material-symbols-outlined">link</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#dae2fd]">Links Diretos das Imagens do HTML</h3>
              <p className="text-xs font-mono text-[#bbcabf]">
                Copie os URLs das capas e recursos visuais do sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#bbcabf] hover:text-[#4edea3] hover:bg-[#2d3449] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-[#3c4a42] bg-[#0b1326] flex items-center gap-3">
          <span className="text-xs font-mono text-[#bbcabf]">Filtrar:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
              filterType === 'all'
                ? 'bg-[#10b981] text-[#003824] font-bold'
                : 'bg-[#171f33] text-[#bbcabf] hover:text-[#dae2fd]'
            }`}
          >
            Todos ({allImages.length})
          </button>
          <button
            onClick={() => setFilterType('covers')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
              filterType === 'covers'
                ? 'bg-[#10b981] text-[#003824] font-bold'
                : 'bg-[#171f33] text-[#bbcabf] hover:text-[#dae2fd]'
            }`}
          >
            Capas ({mangas.length})
          </button>
          <button
            onClick={() => setFilterType('logo')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
              filterType === 'logo'
                ? 'bg-[#10b981] text-[#003824] font-bold'
                : 'bg-[#171f33] text-[#bbcabf] hover:text-[#dae2fd]'
            }`}
          >
            Logo
          </button>
        </div>

        {/* Image links list */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="bg-[#171f33] border border-[#2d3449] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#3c4a42] transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  onClick={() => setSelectedImage({ title: img.name, url: img.url })}
                  className="w-14 h-20 rounded-lg overflow-hidden bg-[#060e20] shrink-0 cursor-pointer group relative border border-[#3c4a42]"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-white text-sm">visibility</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#dae2fd] truncate">{img.name}</span>
                    <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[10px] font-mono text-[#4edea3] border border-[#3c4a42]">
                      {img.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#bbcabf] truncate mt-1 max-w-md select-all bg-[#0b1326] px-2 py-1 rounded border border-[#2d3449]">
                    {img.url}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => handleCopy(img.url, `url-${img.id}`)}
                  className="px-3 py-1.5 bg-[#222a3d] hover:bg-[#2d3449] text-[#4edea3] text-xs font-mono rounded-lg border border-[#3c4a42] flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedId === `url-${img.id}` ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedId === `url-${img.id}` ? 'Copiado!' : 'Copiar URL'}</span>
                </button>

                <button
                  onClick={() => handleCopy(img.htmlTag, `tag-${img.id}`)}
                  className="px-3 py-1.5 bg-[#222a3d] hover:bg-[#2d3449] text-[#bbcabf] hover:text-[#dae2fd] text-xs font-mono rounded-lg border border-[#3c4a42] flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">code</span>
                  <span>{copiedId === `tag-${img.id}` ? 'Copiado!' : 'HTML'}</span>
                </button>

                <a
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#4edea3] rounded-lg border border-[#10b981]/30 transition-colors"
                  title="Abrir imagem direta em nova aba"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3c4a42] bg-[#0b1326] flex items-center justify-between text-xs font-mono text-[#bbcabf]">
          <span>Todas as URLs apontam para imagens hospedadas e otimizadas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#10b981] text-[#003824] font-bold rounded-lg hover:bg-[#6ffbbe] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Image Zoom Preview Overlay */}
      {selectedImage && (
        <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[80vh] flex flex-col items-center gap-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white bg-[#171f33] rounded-full hover:bg-[#2d3449]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-h-[70vh] rounded-lg shadow-2xl border border-[#3c4a42] object-contain"
            />
            <p className="text-sm font-bold text-[#dae2fd] font-mono">{selectedImage.title}</p>
          </div>
        </div>
      )}
    </div>
  );
};
