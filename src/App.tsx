import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { DirectImageLinksModal } from './components/DirectImageLinksModal';
import { DirectoryModal } from './components/DirectoryModal';
import { MangaReaderModal } from './components/MangaReaderModal';
import { PythonScriptModal } from './components/PythonScriptModal';
import { Footer } from './components/Footer';

import {
  INITIAL_MANGAS,
  INITIAL_LOGS,
  INITIAL_TASKS,
  DEFAULT_SETTINGS,
} from './data/mangaData';
import { MangaItem, LogEntry, DownloadTask, AppSettings } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'tasks' | 'history' | 'settings'>('dashboard');
  const [outputDirectory, setOutputDirectory] = useState('/Downloads/Mangas');
  const [urlInput, setUrlInput] = useState('');
  const [activeProgress, setActiveProgress] = useState(45);
  const [isDownloading, setIsDownloading] = useState(false);

  // Data states
  const [mangas, setMangas] = useState<MangaItem[]>(INITIAL_MANGAS);
  const [tasks, setTasks] = useState<DownloadTask[]>(INITIAL_TASKS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Modal states
  const [isDirectLinksModalOpen, setIsDirectLinksModalOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [selectedReaderManga, setSelectedReaderManga] = useState<MangaItem | null>(null);
  const [lastClipboardUrl, setLastClipboardUrl] = useState<string>('');
  const [clipboardToast, setClipboardToast] = useState<string | null>(null);

  // Clipboard Auto-Download Listener Effect
  useEffect(() => {
    if (!settings.autoDownloadFromClipboard) return;

    const checkClipboard = async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) return;
        const text = await navigator.clipboard.readText();
        const trimmed = text ? text.trim() : '';

        if (
          trimmed &&
          (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
          trimmed !== lastClipboardUrl
        ) {
          const isMangaUrl =
            /manga|capitulo|chapter|read|scan|comic|mangadex|mangalivre|manganato|chap/i.test(
              trimmed
            ) ||
            trimmed.includes('chapter') ||
            trimmed.includes('manga');

          if (isMangaUrl) {
            setLastClipboardUrl(trimmed);
            setClipboardToast(`📋 URL do Mangá capturada da área de transferência!`);
            setTimeout(() => setClipboardToast(null), 4500);
            setUrlInput(trimmed);
            handleStartDownload(trimmed);
          }
        }
      } catch {
        // Clipboard read permission might be deferred by browser
      }
    };

    const interval = setInterval(checkClipboard, 2500);
    window.addEventListener('focus', checkClipboard);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkClipboard);
    };
  }, [settings.autoDownloadFromClipboard, lastClipboardUrl]);

  // Timer interval for realistic downloading simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDownloading) {
      interval = setInterval(() => {
        setActiveProgress((prev) => {
          if (prev >= 100) {
            setIsDownloading(false);
            // Append completion log
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            setLogs((l) => [
              ...l,
              {
                id: String(Date.now()),
                timestamp: timeStr,
                type: 'OK',
                message: 'Download finalizado! Arquivo verificado e salvo com sucesso [100%].',
              },
            ]);

            // Update downloading task to completed
            setTasks((tList) =>
              tList.map((t) => (t.status === 'Downloading' ? { ...t, status: 'Completed', progress: 100 } : t))
            );

            // Trigger festive confetti explosion on 100% completion
            try {
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#10b981', '#6ffbbe', '#34d399', '#3b82f6', '#f59e0b', '#ec4899'],
              });
            } catch {
              // Ignore if canvas not supported
            }

            // Send Browser Notification
            if (settings.browserNotifications && 'Notification' in window) {
              const triggerNotify = () => {
                try {
                  new Notification('Manga Downloader Pro 📥', {
                    body: 'Capítulo baixado e salvo com sucesso! Todas as páginas foram extraídas.',
                    icon: 'https://cdn-icons-png.flaticon.com/512/3145/3145765.png',
                  });
                } catch {
                  // Fallback if blocked
                }
              };

              if (Notification.permission === 'granted') {
                triggerNotify();
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then((perm) => {
                  if (perm === 'granted') triggerNotify();
                });
              }
            }

            return 100;
          }
          return prev + 5;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isDownloading, settings.browserNotifications]);

  // Handler: Start download from input bar
  const handleStartDownload = (rawUrl: string) => {
    // Request notification permission on first interaction if enabled
    if (
      settings.browserNotifications &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Detect or parse title
    let detectedTitle = 'Mangá Customizado';
    let chapterName = 'Capítulo Novo';

    if (rawUrl.toLowerCase().includes('one-piece') || rawUrl.toLowerCase().includes('onepiece')) {
      detectedTitle = 'One Piece';
      chapterName = 'Capítulo 1101';
    } else if (rawUrl.toLowerCase().includes('naruto')) {
      detectedTitle = 'Naruto: Next Generations';
      chapterName = 'Capítulo 81';
    } else if (rawUrl.toLowerCase().includes('bleach')) {
      detectedTitle = 'Bleach: Thousand-Year Blood War';
      chapterName = 'Capítulo Special';
    } else if (rawUrl.trim().length > 0) {
      const parts = rawUrl.split('/');
      const lastPart = parts[parts.length - 1] || parts[parts.length - 2] || 'Capítulo';
      detectedTitle = lastPart.replace(/-/g, ' ').toUpperCase() || 'Mangá Desconhecido';
    }

    // Add log entries
    const newLogs: LogEntry[] = [
      { id: String(Date.now() + 1), timestamp: timeStr, type: 'INFO', message: `Analisando URL: ${rawUrl}` },
      { id: String(Date.now() + 2), timestamp: timeStr, type: 'INFO', message: `Fonte identificada: ${detectedTitle}` },
      { id: String(Date.now() + 3), timestamp: timeStr, type: 'EXEC', message: `Iniciando extração de imagens de ${chapterName}...` },
      { id: String(Date.now() + 4), timestamp: timeStr, type: 'OK', message: `Baixando página 1.jpg... [OK]` },
    ];

    setLogs((prev) => [...prev, ...newLogs]);
    setActiveProgress(10);
    setIsDownloading(true);

    // Add new download task
    const newTask: DownloadTask = {
      id: `task-${Date.now()}`,
      mangaTitle: detectedTitle,
      chapterName: chapterName,
      url: rawUrl,
      progress: 10,
      speed: '14.2 MB/s',
      status: 'Downloading',
      downloadedPages: 1,
      totalPages: 18,
      eta: '00:15s',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wVPLgNML81wM9VkJG4kIfGc0CWxYcc-E2JDSJ9KluFiEJMpiaHvlqTVssLkGDtjz7pQokL30GXUcr1im2Q4nDXW9-H4lBfraywf0LyTrSLaKX8VxsrGPef6olKD1xruhW2mlV7BNVe-XmhcKhbuAbankEvZU-OBb5WL-8rhB5DYVI7C0L1j-Ptu1taWS6ojez5tcFVb21Tyc8KyryJuxEoU1gbU4F7_ErNqOTjs9jEZjdYAS35NEuw',
      outputDir: `${outputDirectory}/${detectedTitle}`,
    };

    setTasks((prev) => [newTask, ...prev]);

    // Add to Recent Mangas
    const newManga: MangaItem = {
      id: `manga-${Date.now()}`,
      title: detectedTitle,
      chapter: chapterName,
      status: 'Baixando',
      coverUrl: newTask.coverUrl,
      author: 'Autor Desconhecido',
      description: `Capítulo recentemente adicionado à biblioteca de automação via ${rawUrl}`,
      format: 'CBZ',
      fileSize: '32.1 MB',
      downloadedAt: now.toISOString().slice(0, 16).replace('T', ' '),
      pagesCount: 18,
      chapterPages: [
        {
          pageNumber: 1,
          imageUrl: newTask.coverUrl,
          fileName: 'page_001.jpg',
        },
      ],
    };

    setMangas((prev) => [newManga, ...prev]);
    setUrlInput('');
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleToggleTaskPause = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newStatus = t.status === 'Paused' ? 'Downloading' : 'Paused';
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const handleCancelTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddBatchTasks = (mangaTitle: string, chaptersStr: string) => {
    const newTask: DownloadTask = {
      id: `batch-${Date.now()}`,
      mangaTitle: mangaTitle,
      chapterName: `Lote Capítulos (${chaptersStr})`,
      url: `https://mangadex.org/batch/${mangaTitle}`,
      progress: 0,
      speed: '0 KB/s',
      status: 'Queued',
      downloadedPages: 0,
      totalPages: 120,
      eta: 'Aguardando na Fila',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm5TTbGJoSnIhJ4ZIbfhB2u4nbBttlOvrEFrsJ5bZD1opL0-rA55W8JkBvd3lsuvaAME7uj24CSAWPxcdsY23jo0Kq2Y7uWHNVglj3c79Afl9s4O1lS3qErxCqQVy9KYZvj-kiTqmnbNpQPO2ZE3z2icy9FZvZUrqfkzSSGFGnG6lMeyjX208PHoZg29Dydigj7HpeEdPA10O_m5FDt7nJWHmzrM4qBYAtxBTaT5Z-CM_Ac7QKvJtfLg',
      outputDir: `${outputDirectory}/${mangaTitle}`,
    };
    setTasks((prev) => [...prev, newTask]);
    setCurrentTab('tasks');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setOutputDirectory(newSettings.outputDirectory);
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans antialiased selection:bg-[#10b981]/30">
      {/* Top Bar Header */}
      <Header
        onOpenDirectLinksModal={() => setIsDirectLinksModalOpen(true)}
        onOpenSettings={() => setCurrentTab('settings')}
        onOpenPythonScriptModal={() => setIsPythonModalOpen(true)}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        storagePercent={82}
      />

      {/* Main Canvas View Area */}
      <main className="md:ml-[280px] pt-20 pb-12 px-4 sm:px-6 md:px-8 max-w-[1440px] min-h-[calc(100vh-60px)]">
        {currentTab === 'dashboard' && (
          <DashboardView
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            outputDirectory={outputDirectory}
            onChangeDirectory={() => setIsDirectoryModalOpen(true)}
            onStartDownload={handleStartDownload}
            logs={logs}
            onClearLogs={handleClearLogs}
            mangas={mangas}
            onSelectMangaForReader={(manga) => setSelectedReaderManga(manga)}
            onOpenDirectLinksModal={() => setIsDirectLinksModalOpen(true)}
            onOpenPythonScriptModal={() => setIsPythonModalOpen(true)}
            onViewAllHistory={() => setCurrentTab('history')}
            activeProgress={activeProgress}
            isDownloading={isDownloading}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onToggleTaskPause={handleToggleTaskPause}
            onCancelTask={handleCancelTask}
            onAddBatchTasks={handleAddBatchTasks}
            onOpenDirectLinksModal={() => setIsDirectLinksModalOpen(true)}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            mangas={mangas}
            onSelectMangaForReader={(manga) => setSelectedReaderManga(manga)}
            onOpenDirectLinksModal={() => setIsDirectLinksModalOpen(true)}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onChangeDirectoryClick={() => setIsDirectoryModalOpen(true)}
            onOpenDirectLinksModal={() => setIsDirectLinksModalOpen(true)}
          />
        )}
      </main>

      {/* Global Application Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Direct Image Links Modal */}
      <DirectImageLinksModal
        isOpen={isDirectLinksModalOpen}
        onClose={() => setIsDirectLinksModalOpen(false)}
        mangas={mangas}
      />

      {/* Directory Selector Modal */}
      <DirectoryModal
        isOpen={isDirectoryModalOpen}
        onClose={() => setIsDirectoryModalOpen(false)}
        currentDirectory={outputDirectory}
        onSelectDirectory={(newPath) => {
          setOutputDirectory(newPath);
          setSettings((prev) => ({ ...prev, outputDirectory: newPath }));
        }}
      />

      {/* Reader & Page Inspector Modal */}
      <MangaReaderModal
        manga={selectedReaderManga}
        isOpen={!!selectedReaderManga}
        onClose={() => setSelectedReaderManga(null)}
        onOpenDirectLinks={() => {
          setSelectedReaderManga(null);
          setIsDirectLinksModalOpen(true);
        }}
      />

      {/* Python Script Generator Modal */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        defaultUrl={urlInput || 'https://mangadex.org/chapter/exemplo-123'}
        defaultDir={outputDirectory}
      />

      {/* Floating Clipboard Auto-Download Toast */}
      {clipboardToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-[#131b2e] border-2 border-[#10b981] rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 max-w-md emerald-glow">
          <div className="p-2 bg-[#10b981]/20 rounded-lg text-[#4edea3]">
            <span className="material-symbols-outlined text-[20px]">content_paste_go</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#dae2fd]">Download Automático Disparado!</h4>
            <p className="text-[11px] font-mono text-[#bbcabf] truncate">{clipboardToast}</p>
          </div>
          <button
            onClick={() => setClipboardToast(null)}
            className="text-[#86948a] hover:text-[#dae2fd] text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Persistent Status Badge for Clipboard Monitoring when active */}
      {settings.autoDownloadFromClipboard && !clipboardToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-40 bg-[#131b2e]/90 backdrop-blur border border-[#10b981]/40 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2 text-[11px] font-mono text-[#4edea3]">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping"></span>
          <span>Clipboard Monitor Ativo</span>
          <button
            onClick={() => {
              const sampleUrl = 'https://mangadex.org/chapter/one-piece-1101';
              navigator.clipboard.writeText(sampleUrl);
              setLastClipboardUrl('');
              setClipboardToast('Testando cópia de URL: ' + sampleUrl);
              handleStartDownload(sampleUrl);
            }}
            title="Simular cópia de URL de teste"
            className="ml-1 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#4edea3] px-2 py-0.5 rounded-full text-[10px]"
          >
            Simular Cópia
          </button>
        </div>
      )}
    </div>
  );
}
