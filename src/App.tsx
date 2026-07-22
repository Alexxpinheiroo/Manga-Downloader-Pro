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
  const [activeProgress, setActiveProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Data states (initially empty, loaded from server)
  const [mangas, setMangas] = useState<MangaItem[]>([]);
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Modal states
  const [isDirectLinksModalOpen, setIsDirectLinksModalOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [selectedReaderManga, setSelectedReaderManga] = useState<MangaItem | null>(null);
  const [lastClipboardUrl, setLastClipboardUrl] = useState<string>('');
  const [clipboardToast, setClipboardToast] = useState<string | null>(null);

  // Load initial server data and setup real-time EventSource listener
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
          setOutputDirectory(settingsData.outputDirectory);
        }
        
        const mangasRes = await fetch('/api/mangas');
        if (mangasRes.ok) {
          const mangasData = await mangasRes.json();
          setMangas(mangasData);
        }

        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
      } catch (e) {
        console.error('Error loading initial data:', e);
      }
    };
    loadInitialData();

    // EventSource (SSE) for real-time progress and logs from the backend
    const eventSource = new EventSource('/api/events');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'log') {
          setLogs(prev => [...prev, data.log]);
        } else if (data.type === 'task-new') {
          setTasks(prev => [data.task, ...prev]);
          setIsDownloading(true);
        } else if (data.type === 'task-update') {
          setTasks(prev => prev.map(t => t.id === data.task.id ? { ...t, ...data.task } : t));
          if (data.task.progress !== undefined) {
            setActiveProgress(data.task.progress);
          }
          if (data.task.status === 'Completed') {
            setIsDownloading(false);
            
            // Confetti explosion
            try {
              confetti({
                particleCount: 125,
                spread: 85,
                origin: { y: 0.6 },
                colors: ['#10b981', '#6ffbbe', '#34d399', '#3b82f6', '#f59e0b', '#ec4899'],
              });
            } catch {}

            // Send notification
            if (settings.browserNotifications && 'Notification' in window) {
              const triggerNotify = () => {
                new Notification('Manga Downloader Pro 📥', {
                  body: `O capítulo "${data.task.chapterName}" de "${data.task.mangaTitle}" foi baixado com sucesso!`,
                  icon: 'https://cdn-icons-png.flaticon.com/512/3145/3145765.png',
                });
              };
              if (Notification.permission === 'granted') {
                triggerNotify();
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(perm => {
                  if (perm === 'granted') triggerNotify();
                });
              }
            }
          } else if (data.task.status === 'Error') {
            setIsDownloading(false);
          }
        } else if (data.type === 'manga-new') {
          setMangas(prev => [data.manga, ...prev]);
        }
      } catch (e) {
        console.error('Error handling SSE message:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [settings.browserNotifications]);

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
            /manga|capitulo|chapter|read|scan|comic|mangadex|mangalivre|manganato|chap|verdinha/i.test(
              trimmed
            );

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

  // Handler: Start download from input bar by posting to the real server
  const handleStartDownload = async (rawUrl: string) => {
    // Request notification permission if enabled
    if (
      settings.browserNotifications &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao iniciar o download.');
      }
    } catch (e) {
      console.error('Error starting download:', e);
      alert('Erro de conexão ao servidor backend local.');
    }
    setUrlInput('');
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleToggleTaskPause = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const isCurrentlyPaused = task.status === 'Paused';
    try {
      const endpoint = isCurrentlyPaused ? 'resume' : 'pause';
      const res = await fetch(`/api/tasks/${taskId}/${endpoint}`, { method: 'POST' });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: isCurrentlyPaused ? 'Downloading' : 'Paused' } : t));
      }
    } catch (e) {
      console.error('Error toggling pause:', e);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    if (confirm('Deseja realmente cancelar este download?')) {
      try {
        const res = await fetch(`/api/tasks/${taskId}/cancel`, { method: 'POST' });
        if (res.ok) {
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
        }
      } catch (e) {
        console.error('Error cancelling task:', e);
      }
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Tem certeza que deseja apagar todo o histórico de downloads? Os arquivos baixados no disco serão preservados.')) {
      try {
        const res = await fetch('/api/mangas/clear', { method: 'POST' });
        if (res.ok) {
          setMangas([]);
        }
      } catch (e) {
        console.error('Error clearing history:', e);
      }
    }
  };

  const handleRemoveHistoryCovers = async () => {
    if (confirm('Deseja remover as capas e imagens salvas do histórico? As informações de texto serão preservadas.')) {
      try {
        const res = await fetch('/api/mangas/clear-covers', { method: 'POST' });
        if (res.ok) {
          setMangas(prev => prev.map(m => ({ ...m, coverUrl: '', chapterPages: [] })));
        }
      } catch (e) {
        console.error('Error clearing history covers:', e);
      }
    }
  };

  const handleClearTasks = async () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de downloads concluídos, cancelados ou com erros da fila? Downloads ativos serão preservados.')) {
      try {
        const res = await fetch('/api/tasks/clear', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setTasks(data.tasks);
          }
        }
      } catch (e) {
        console.error('Error clearing tasks:', e);
      }
    }
  };

  const handleAddBatchTasks = async (mangaTitle: string, chaptersStr: string) => {
    // Treat as raw search or name and direct to download
    handleStartDownload(mangaTitle);
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    setOutputDirectory(newSettings.outputDirectory);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (e) {
      console.error('Error saving settings:', e);
    }
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
            onClearTasks={handleClearTasks}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            mangas={mangas}
            onSelectMangaForReader={(manga) => setSelectedReaderManga(manga)}
            onOpenDirectLinksModal={() => setIsDirectLinksModalOpen(true)}
            onClearHistory={handleClearHistory}
            onRemoveHistoryCovers={handleRemoveHistoryCovers}
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
