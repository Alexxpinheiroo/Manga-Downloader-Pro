import React, { useState } from 'react';

interface DirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDirectory: string;
  onSelectDirectory: (newPath: string) => void;
}

export const DirectoryModal: React.FC<DirectoryModalProps> = ({
  isOpen,
  onClose,
  currentDirectory,
  onSelectDirectory,
}) => {
  const [selectedPath, setSelectedPath] = useState(currentDirectory);
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const presets = [
    '/Downloads/Mangas',
    '/Downloads/MangaDownloader',
    '/Documents/MangaLibrary',
    '/Volumes/ExternalStorage/Mangas',
    '/home/user/MangaCollection',
  ];

  const handleSave = () => {
    const finalPath = customInput.trim() || selectedPath;
    onSelectDirectory(finalPath);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#131b2e] border border-[#3c4a42] rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]">
          <div className="flex items-center gap-2 text-[#4edea3]">
            <span className="material-symbols-outlined">folder_open</span>
            <h3 className="text-lg font-bold text-[#dae2fd]">Selecionar Diretório de Saída</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#bbcabf] hover:text-[#4edea3] hover:bg-[#2d3449] rounded-lg"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-xs text-[#bbcabf]">
          Escolha o local no seu dispositivo onde os capítulos baixados (imagens, CBZ ou PDF) serão salvos.
        </p>

        {/* Current Path Display */}
        <div className="bg-[#0b1326] p-3 rounded-lg border border-[#3c4a42] font-mono text-xs text-[#4edea3] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#bbcabf]">folder</span>
          <span className="truncate">{selectedPath}</span>
        </div>

        {/* Presets list */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-[#bbcabf]">
            Diretórios Sugeridos
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
            {presets.map((path) => (
              <button
                key={path}
                onClick={() => {
                  setSelectedPath(path);
                  setCustomInput('');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs flex items-center justify-between transition-colors ${
                  selectedPath === path
                    ? 'bg-[#10b981]/20 border border-[#10b981] text-[#4edea3]'
                    : 'bg-[#171f33] text-[#bbcabf] hover:bg-[#222a3d] border border-[#2d3449]'
                }`}
              >
                <span>{path}</span>
                {selectedPath === path && (
                  <span className="material-symbols-outlined text-sm">check</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-1">
          <label className="text-xs font-mono uppercase tracking-wider text-[#bbcabf]">
            Caminho Personalizado
          </label>
          <input
            type="text"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              if (e.target.value.trim()) setSelectedPath(e.target.value.trim());
            }}
            placeholder="/meu/caminho/manga"
            className="w-full bg-[#0b1326] border border-[#3c4a42] rounded-lg px-3 py-2 text-xs font-mono text-[#dae2fd] focus:border-[#4edea3] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3c4a42]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#bbcabf] text-xs font-mono rounded-lg border border-[#3c4a42]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#10b981] hover:bg-[#6ffbbe] text-[#003824] font-bold text-xs rounded-lg transition-all emerald-glow"
          >
            Confirmar Alteração
          </button>
        </div>
      </div>
    </div>
  );
};
