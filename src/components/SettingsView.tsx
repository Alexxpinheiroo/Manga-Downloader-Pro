import React, { useState } from 'react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onChangeDirectoryClick: () => void;
  onOpenDirectLinksModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onChangeDirectoryClick,
  onOpenDirectLinksModal,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3c4a42] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#4edea3]">Ajustes de Automação</h2>
          <p className="text-xs font-mono text-[#bbcabf]">
            Configuração de diretórios, proxies, threads e formatos de saída
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDirectLinksModal}
          className="px-4 py-2 bg-[#171f33] hover:bg-[#222a3d] border border-[#3c4a42] rounded-lg text-xs font-mono text-[#4edea3] flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">link</span>
          <span>Inspecionar Assets & Imagens</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Output Directory Card */}
        <div className="bg-[#131b2e] border border-[#3c4a42] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#4edea3] border-b border-[#3c4a42] pb-2">
            <span className="material-symbols-outlined">folder</span>
            <h3 className="font-bold text-base text-[#dae2fd]">Armazenamento e Pastas</h3>
          </div>

          <div>
            <label className="text-xs font-mono text-[#bbcabf] uppercase tracking-wider block mb-1">
              Diretório Padrão de Download
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.outputDirectory}
                onChange={(e) =>
                  setFormData({ ...formData, outputDirectory: e.target.value })
                }
                className="flex-1 bg-[#0b1326] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-xs font-mono text-[#dae2fd] focus:border-[#4edea3] focus:outline-none"
              />
              <button
                type="button"
                onClick={onChangeDirectoryClick}
                className="px-4 py-2.5 bg-[#222a3d] hover:bg-[#2d3449] border border-[#3c4a42] text-xs font-mono text-[#4edea3] rounded-lg transition-colors"
              >
                Alterar
              </button>
            </div>
          </div>
        </div>

        {/* Automatic Download & Clipboard Monitoring Card */}
        <div className="bg-[#131b2e] border border-[#3c4a42] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#4edea3] border-b border-[#3c4a42] pb-2">
            <span className="material-symbols-outlined">content_paste_go</span>
            <h3 className="font-bold text-base text-[#dae2fd]">Download Automático via Área de Transferência</h3>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#dae2fd] block">
                Monitorar Área de Transferência (Clipboard Auto-Detect)
              </span>
              <p className="text-xs text-[#86948a] mt-1 max-w-xl">
                Quando ativo, o aplicativo monitora a área de transferência. Ao detectar uma URL de mangá ou capítulo copiada (ex: MangaDex, MangaLivre, ChapManga), o download será iniciado automaticamente sem requerer colagem manual.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.autoDownloadFromClipboard}
                onChange={(e) =>
                  setFormData({ ...formData, autoDownloadFromClipboard: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#222a3d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
            </label>
          </div>
        </div>

        {/* Browser Notifications Card */}
        <div className="bg-[#131b2e] border border-[#3c4a42] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#4edea3] border-b border-[#3c4a42] pb-2">
            <span className="material-symbols-outlined">notifications_active</span>
            <h3 className="font-bold text-base text-[#dae2fd]">Notificações do Navegador</h3>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#dae2fd] block">
                Notificações Nativas do Sistema/Navegador
              </span>
              <p className="text-xs text-[#86948a] mt-1 max-w-xl">
                Exibe um aviso popup no seu sistema quando a extração e o download de um capítulo forem finalizados com sucesso, mesmo se você estiver em outra aba.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.browserNotifications}
                onChange={(e) => {
                  const val = e.target.checked;
                  setFormData({ ...formData, browserNotifications: val });
                  if (val && 'Notification' in window && Notification.permission !== 'granted') {
                    Notification.requestPermission();
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#222a3d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
            </label>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!('Notification' in window)) {
                  alert('O seu navegador não possui suporte à API de Notificações.');
                  return;
                }
                Notification.requestPermission().then((perm) => {
                  if (perm === 'granted') {
                    new Notification('Manga Downloader Pro 🚀', {
                      body: 'Notificações ativadas! Você receberá um aviso assim que cada capítulo for concluído.',
                      icon: '/favicon.ico',
                    });
                  } else {
                    alert(`Permissão de Notificação: ${perm}`);
                  }
                });
              }}
              className="px-3 py-1.5 bg-[#222a3d] hover:bg-[#2d3449] border border-[#3c4a42] text-[#4edea3] text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_alert</span>
              <span>Testar Notificação do Navegador</span>
            </button>
            <span className="text-[11px] font-mono text-[#86948a]">
              Status da Permissão: {' '}
              <strong className="text-[#dae2fd]">
                {typeof window !== 'undefined' && 'Notification' in window
                  ? Notification.permission
                  : 'não suportado'}
              </strong>
            </span>
          </div>
        </div>

        {/* Downloads Performance */}
        <div className="bg-[#131b2e] border border-[#3c4a42] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#4edea3] border-b border-[#3c4a42] pb-2">
            <span className="material-symbols-outlined">speed</span>
            <h3 className="font-bold text-base text-[#dae2fd]">Performance e Concorrência</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-mono text-[#bbcabf] uppercase tracking-wider block mb-1">
                Downloads Simultâneos ({formData.concurrentDownloads})
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={formData.concurrentDownloads}
                onChange={(e) =>
                  setFormData({ ...formData, concurrentDownloads: parseInt(e.target.value) })
                }
                className="w-full accent-[#10b981]"
              />
              <span className="text-[10px] font-mono text-[#86948a]">
                Recomendado: 4 downloads paralelos para evitar bloqueios de IP.
              </span>
            </div>

            <div>
              <label className="text-xs font-mono text-[#bbcabf] uppercase tracking-wider block mb-1">
                Tentativas de Auto-Retry ({formData.retryAttempts})
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={formData.retryAttempts}
                onChange={(e) =>
                  setFormData({ ...formData, retryAttempts: parseInt(e.target.value) || 1 })
                }
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded-lg px-3 py-2 text-xs font-mono text-[#dae2fd]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#2d3449]">
            <span className="text-xs text-[#dae2fd]">Empacotamento automático para CBZ</span>
            <input
              type="checkbox"
              checked={formData.autoExtractCBZ}
              onChange={(e) => setFormData({ ...formData, autoExtractCBZ: e.target.checked })}
              className="w-4 h-4 accent-[#10b981] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Proxy Settings */}
        <div className="bg-[#131b2e] border border-[#3c4a42] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#4edea3] border-b border-[#3c4a42] pb-2">
            <span className="material-symbols-outlined">vpn_lock</span>
            <h3 className="font-bold text-base text-[#dae2fd]">Configurações de Proxy / Rede</h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#dae2fd]">Ativar Servidor Proxy</span>
            <input
              type="checkbox"
              checked={formData.proxyEnabled}
              onChange={(e) => setFormData({ ...formData, proxyEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#10b981] rounded cursor-pointer"
            />
          </div>

          {formData.proxyEnabled && (
            <div>
              <label className="text-xs font-mono text-[#bbcabf] uppercase tracking-wider block mb-1">
                Endereço do Proxy HTTP/SOCKS5
              </label>
              <input
                type="text"
                value={formData.proxyAddress}
                onChange={(e) => setFormData({ ...formData, proxyAddress: e.target.value })}
                placeholder="http://127.0.0.1:8080"
                className="w-full bg-[#0b1326] border border-[#3c4a42] rounded-lg px-3 py-2 text-xs font-mono text-[#dae2fd]"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-[#3c4a42]">
          {savedSuccess ? (
            <span className="text-xs font-mono text-[#4edea3] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Ajustes salvos com sucesso!
            </span>
          ) : (
            <span className="text-xs font-mono text-[#bbcabf]">v2.4.0-stable • Emerald Engine</span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#10b981] hover:bg-[#6ffbbe] text-[#003824] font-bold text-xs rounded-lg transition-all emerald-glow"
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};
