import React, { useState } from 'react';
import { LOGO_URL } from '../data/mangaData';

interface HeaderProps {
  onOpenDirectLinksModal: () => void;
  onOpenSettings: () => void;
  onOpenPythonScriptModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDirectLinksModal,
  onOpenSettings,
  onOpenPythonScriptModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, title: 'Download concluído', msg: 'Solo Leveling Capítulo Final foi salvo com sucesso.', time: 'Há 12 min' },
    { id: 2, title: 'Servidor Conectado', msg: 'Conexão estabelecida com servidor de alta velocidade.', time: 'Há 30 min' },
    { id: 3, title: 'Atualização de Sistema', msg: 'Manga Downloader Pro v2.4.0-stable está ativo.', time: 'Há 1 hora' },
  ];

  return (
    <header className="flex justify-between items-center px-4 sm:px-6 w-full h-16 fixed top-0 z-50 border-b border-[#3c4a42] bg-[#0b1326]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <img
          alt="Manga Downloader Pro Logo"
          className="h-8 w-8 object-contain rounded drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          src={LOGO_URL}
        />
        <h1 className="text-xl sm:text-2xl font-bold text-[#4edea3] tracking-tight">
          Manga Downloader Pro
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Quick Link Button to inspect direct HTML images */}
        <button
          onClick={onOpenDirectLinksModal}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#171f33] hover:bg-[#222a3d] border border-[#3c4a42] rounded-full text-xs font-mono text-[#4edea3] transition-all hover:scale-[1.02]"
          title="Ver links diretos de imagens do HTML"
        >
          <span className="material-symbols-outlined text-[16px]">link</span>
          <span>Links Diretos</span>
        </button>

        {/* Python Script button */}
        {onOpenPythonScriptModal && (
          <button
            onClick={onOpenPythonScriptModal}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#10b981]/15 hover:bg-[#10b981]/25 border border-[#10b981]/40 rounded-full text-xs font-mono text-[#4edea3] transition-all hover:scale-[1.02] emerald-glow"
            title="Ver / Baixar Script Python de Web Scraping"
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span>Script Python (.py)</span>
          </button>
        )}

        {/* Server Status Pill */}
        <div className="flex items-center gap-2 bg-[#222a3d] px-3 py-1.5 rounded-full border border-[#3c4a42]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4edea3] pulse-neon"></div>
          <span className="text-xs sm:text-sm font-medium text-[#4edea3] hidden sm:inline">
            Online / Pronto
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#bbcabf] relative">
          {/* Notifications Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 hover:text-[#4edea3] transition-colors rounded-lg hover:bg-[#171f33] relative"
              title="Notificações"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#10b981]"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#131b2e] border border-[#3c4a42] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#3c4a42] mb-3">
                  <h3 className="text-sm font-bold text-[#dae2fd]">Notificações</h3>
                  <span className="text-[10px] font-mono text-[#4edea3]">3 Novas</span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 bg-[#171f33] rounded-lg border border-[#2d3449]">
                      <div className="flex justify-between items-center text-xs font-semibold text-[#4edea3]">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-[#bbcabf] font-mono">{n.time}</span>
                      </div>
                      <p className="text-xs text-[#bbcabf] mt-1">{n.msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile / Account button */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="p-1.5 hover:text-[#4edea3] transition-colors rounded-lg hover:bg-[#171f33]"
              title="Conta e Configurações"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-[#131b2e] border border-[#3c4a42] rounded-xl shadow-2xl p-3 z-50">
                <div className="p-2 border-b border-[#3c4a42] mb-2">
                  <p className="text-xs font-bold text-[#dae2fd]">Admin / Usuário Local</p>
                  <p className="text-[10px] font-mono text-[#bbcabf]">v2.4.0 Pro Edition</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    onOpenDirectLinksModal();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#bbcabf] hover:text-[#4edea3] hover:bg-[#171f33] rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">image</span>
                  <span>Copiar Links de Imagens</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#bbcabf] hover:text-[#4edea3] hover:bg-[#171f33] rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">settings</span>
                  <span>Ajustes da Conta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
