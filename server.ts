import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const MANGAS_FILE = path.join(__dirname, 'mangas.json');
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// Helper to load JSON files safely
function loadJson<T>(file: string, defaultValue: T): T {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
  }
  return defaultValue;
}

// Helper to save JSON files safely
function saveJson<T>(file: string, data: T): void {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${file}:`, e);
  }
}

// Ensure default folders and files exist
if (!fs.existsSync(SETTINGS_FILE)) {
  saveJson(SETTINGS_FILE, {
    outputDirectory: path.join(__dirname, 'downloads'),
    concurrentDownloads: 4,
    maxThreads: 8,
    autoExtractCBZ: false,
    autoDownloadFromClipboard: true,
    browserNotifications: true,
    proxyEnabled: false,
    proxyAddress: 'http://127.0.0.1:8080',
    retryAttempts: 3,
    preferredQuality: 'Original',
    serverStatus: 'Online',
    theme: 'Emerald Dark',
    accessToken: ''
  });
}
if (!fs.existsSync(MANGAS_FILE)) saveJson(MANGAS_FILE, []);
if (!fs.existsSync(TASKS_FILE)) saveJson(TASKS_FILE, []);

// In-memory list of active SSE clients
let sseClients: any[] = [];

interface TaskState {
  isPaused: boolean;
  isCancelled: boolean;
}
const activeTasks = new Map<string, TaskState>();

// Helper to broadcast events to all frontend clients
function broadcastEvent(type: string, data: any) {
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  });
}

function logToClient(type: 'INFO' | 'EXEC' | 'OK' | 'WAIT' | 'WARN' | 'ERROR', message: string) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  const logEntry = { id: String(Date.now() + Math.random()), timestamp, type, message };
  
  // Save to persistent logs file if desired, or just broadcast
  broadcastEvent('log', { log: logEntry });
  console.log(`[${type}] ${message}`);
}

// Image URL resolver logic extracted from verdinha.wtf source code
function resolveImageUrl(src: string, chapterData: any, pageData?: any): string {
  if (!src) return '';
  if (src.startsWith('http')) return src;

  const scanId = chapterData.scan_id || 1;
  const obrId = chapterData.obr_id || 0;
  const capNumero = chapterData.cap_numero !== undefined && chapterData.cap_numero !== null ? String(chapterData.cap_numero) : '';
  const isPageWp = pageData && typeof pageData === 'object' && (!!pageData.is_wp || !!pageData.mime);
  const isWp = !!chapterData.is_wp || isPageWp;

  const baseCdn = 'https://cdn.verdinha.wtf';
  const isWpType = src.startsWith('uploads/') || src.startsWith('wp-content/') || src.startsWith('manga_') || src.startsWith('WP-manga');

  if (isWpType || isWp) {
    let relativePath = src;
    if (src.startsWith('WP-manga')) {
      relativePath = `wp-content/uploads/${src}`;
    } else if (src.startsWith('uploads/')) {
      relativePath = `wp-content/${src}`;
    } else if (src.startsWith('manga_')) {
      relativePath = `wp-content/uploads/WP-manga/data/${src}`;
    } else if (!src.startsWith('wp-content/')) {
      relativePath = `wp-content/uploads/WP-manga/data${src.startsWith('/') ? '' : '/'}${src}`;
    }
    const finalUrl = `${baseCdn}/${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
    return finalUrl.replace(/([^:])\/\/\/+/g, '$1/').replace(/([^:])\/\/+/g, '$1/');
  }

  const pathPrefix = pageData && typeof pageData === 'object' && pageData.path 
    ? pageData.path 
    : `scans/${scanId}/obras/${obrId}/capitulos/${capNumero}`;

  const finalUrl = `${baseCdn}/${pathPrefix.endsWith('/') || src.startsWith('/') ? '' : '/'}${pathPrefix}/${src}`;
  return finalUrl.replace(/([^:])\/\/\/+/g, '$1/').replace(/([^:])\/\/+/g, '$1/');
}

function resolveObraCoverUrl(src: string, scanId: number, obrId: number, isWp: boolean): string {
  if (!src) return '';
  if (src.startsWith('http')) return src;

  const baseCdn = 'https://cdn.verdinha.wtf';
  const isWpType = src.startsWith('uploads/') || src.startsWith('wp-content/') || src.startsWith('manga_') || src.startsWith('WP-manga');

  if (isWpType || isWp) {
    let relativePath = src;
    if (src.startsWith('WP-manga')) {
      relativePath = `wp-content/uploads/${src}`;
    } else if (src.startsWith('uploads/')) {
      relativePath = `wp-content/${src}`;
    } else if (src.startsWith('manga_')) {
      relativePath = `wp-content/uploads/WP-manga/data/${src}`;
    } else if (!src.startsWith('wp-content/')) {
      relativePath = `wp-content/uploads/WP-manga/data${src.startsWith('/') ? '' : '/'}${src}`;
    }
    const finalUrl = `${baseCdn}/${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
    return finalUrl.replace(/([^:])\/\/\/+/g, '$1/').replace(/([^:])\/\/+/g, '$1/');
  }

  const relativePath = `scans/${scanId}/obras/${obrId}`;
  const finalUrl = `${baseCdn}/${relativePath}/${src}`;
  return finalUrl.replace(/([^:])\/\/\/+/g, '$1/').replace(/([^:])\/\/+/g, '$1/');
}

// Helper function to download file
function downloadFile(url: string, dest: string, headers: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    file.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });

    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        ...headers
      }
    };

    const req = https.get(options, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    req.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Download engine
async function downloadChapterTask(chapterId: string, outputBaseDir: string, accessToken: string, autoExtractCBZ: boolean): Promise<boolean> {
  const taskId = `task-${Date.now()}`;
  activeTasks.set(taskId, { isPaused: false, isCancelled: false });
  logToClient('INFO', `Iniciando download do capítulo ID ${chapterId}`);

  // Fetch chapter metadata from Verdinha API
  const apiHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  };
  if (accessToken) {
    apiHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  let chapterData: any;
  try {
    const apiUrl = `https://api.verdinha.wtf/capitulos/${chapterId}`;
    const response = await fetch(apiUrl, { headers: apiHeaders });
    
    if (response.status === 403) {
      logToClient('ERROR', `Acesso negado para o capítulo ${chapterId}. Certifique-se de que colou seu Token de Acesso VIP nas Configurações.`);
      broadcastEvent('task-update', {
        task: {
          id: taskId,
          status: 'Error',
          eta: 'Erro de Autenticação (403)'
        }
      });
      activeTasks.delete(taskId);
      return false;
    }
    
    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    chapterData = await response.json();
  } catch (err: any) {
    logToClient('ERROR', `Erro ao buscar metadados do capítulo ${chapterId}: ${err.message}`);
    activeTasks.delete(taskId);
    return false;
  }

  const mangaTitle = chapterData.obra?.obr_nome || 'Manga Desconhecido';
  const chapterNum = chapterData.cap_numero !== undefined ? `Capitulo ${chapterData.cap_numero}` : 'Capitulo Novo';
  const pages: any[] = chapterData.cap_paginas || [];

  if (pages.length === 0) {
    logToClient('WARN', `O capítulo ${chapterNum} não possui páginas disponíveis.`);
    activeTasks.delete(taskId);
    return false;
  }

  logToClient('INFO', `Metadados carregados: "${mangaTitle}" - ${chapterNum} (${pages.length} páginas)`);

  // Clean directory names
  const cleanMangaTitle = mangaTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
  const cleanChapterName = chapterNum.replace(/[\\/:*?"<>|]/g, '_').trim();

  const finalFolder = path.join(outputBaseDir, cleanMangaTitle, cleanChapterName);
  fs.mkdirSync(finalFolder, { recursive: true });

  // Resolve the actual manga cover url
  const scanId = chapterData.scan_id || 1;
  const obrId = chapterData.obr_id || 0;
  const isWp = !!chapterData.is_wp;
  const obrImagem = chapterData.obra?.obr_imagem || '';
  const coverUrl = obrImagem ? resolveObraCoverUrl(obrImagem, scanId, obrId, isWp) : '';

  // Initialize task in frontend
  const initialTask = {
    id: taskId,
    mangaTitle: cleanMangaTitle,
    chapterName: cleanChapterName,
    url: `https://verdinha.wtf/?tab=lendo#/capitulo/${chapterId}`,
    progress: 5,
    speed: '0 MB/s',
    status: 'Downloading' as const,
    downloadedPages: 0,
    totalPages: pages.length,
    eta: 'Calculando...',
    coverUrl: coverUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wVPLgNML81wM9VkJG4kIfGc0CWxYcc-E2JDSJ9KluFiEJMpiaHvlqTVssLkGDtjz7pQokL30GXUcr1im2Q4nDXW9-H4lBfraywf0LyTrSLaKX8VxsrGPef6olKD1xruhW2mlV7BNVe-XmhcKhbuAbankEvZU-OBb5WL-8rhB5DYVI7C0L1j-Ptu1taWS6ojez5tcFVb21Tyc8KyryJuxEoU1gbU4F7_ErNqOTjs9jEZjdYAS35NEuw',
    outputDir: finalFolder
  };

  // Save task to tasks.json and broadcast new task
  const allTasks = loadJson<any[]>(TASKS_FILE, []);
  allTasks.unshift(initialTask);
  saveJson(TASKS_FILE, allTasks);
  broadcastEvent('task-new', { task: initialTask });

  const downloadedPagesList: any[] = [];
  let successCount = 0;

  const downloadHeaders = {
    'Referer': `https://verdinha.wtf/`
  };

  // Download the actual cover first as 'capa'
  if (coverUrl) {
    try {
      const coverExt = path.extname(new URL(coverUrl).pathname) || '.jpg';
      const coverDest = path.join(finalFolder, `capa${coverExt}`);
      logToClient('EXEC', `Baixando a capa real da obra ("${mangaTitle}")...`);
      await downloadFile(coverUrl, coverDest, downloadHeaders);
      logToClient('OK', `Capa real salva com sucesso como: capa${coverExt}`);
    } catch (e: any) {
      logToClient('WARN', `Não foi possível obter a capa real da obra: ${e.message}`);
    }
  }

  const startTime = Date.now();

  for (let idx = 0; idx < pages.length; idx++) {
    // Check cancellation
    if (activeTasks.get(taskId)?.isCancelled) {
      logToClient('WARN', `Download do capítulo ${chapterNum} foi cancelado pelo usuário.`);
      const currentTasks = loadJson<any[]>(TASKS_FILE, []);
      const idxT = currentTasks.findIndex(t => t.id === taskId);
      if (idxT !== -1) {
        currentTasks[idxT].status = 'Cancelled';
        currentTasks[idxT].eta = 'Cancelado';
        saveJson(TASKS_FILE, currentTasks);
      }
      broadcastEvent('task-update', { task: { id: taskId, status: 'Cancelled', eta: 'Cancelado' } });
      activeTasks.delete(taskId);
      return false;
    }

    // Check pause state
    while (activeTasks.get(taskId)?.isPaused) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (activeTasks.get(taskId)?.isCancelled) {
        break; // Break pause loop
      }
    }

    // Recheck cancellation
    if (activeTasks.get(taskId)?.isCancelled) {
      logToClient('WARN', `Download do capítulo ${chapterNum} foi cancelado pelo usuário.`);
      const currentTasks = loadJson<any[]>(TASKS_FILE, []);
      const idxT = currentTasks.findIndex(t => t.id === taskId);
      if (idxT !== -1) {
        currentTasks[idxT].status = 'Cancelled';
        currentTasks[idxT].eta = 'Cancelado';
        saveJson(TASKS_FILE, currentTasks);
      }
      broadcastEvent('task-update', { task: { id: taskId, status: 'Cancelled', eta: 'Cancelado' } });
      activeTasks.delete(taskId);
      return false;
    }

    const rawPage = pages[idx];
    const pageSrc = typeof rawPage === 'string' ? rawPage : rawPage.src;
    if (!pageSrc) continue;

    const pageUrl = resolveImageUrl(pageSrc, chapterData, rawPage);
    const ext = path.extname(new URL(pageUrl).pathname) || '.jpg';
    
    // Naming logic:
    // First page index 0 is saved as 1, index 1 as 2, etc.
    const fileName = `${idx + 1}${ext}`;
    const destPath = path.join(finalFolder, fileName);

    logToClient('EXEC', `Baixando página: ${fileName}...`);
    
    try {
      await downloadFile(pageUrl, destPath, downloadHeaders);
      successCount++;
      logToClient('OK', `Baixando página: ${fileName}... [OK]`);
      
      downloadedPagesList.push({
        pageNumber: idx + 1,
        imageUrl: pageUrl,
        fileName: fileName
      });
    } catch (e: any) {
      logToClient('ERROR', `Erro ao baixar página ${fileName}: ${e.message}`);
    }

    // Update progress
    const progress = Math.round(((idx + 1) / pages.length) * 100);
    const speed = ((successCount * 1.5) / ((Date.now() - startTime) / 1000 || 1)).toFixed(1) + ' MB/s';
    
    const elapsed = (Date.now() - startTime) / 1000;
    const remainingPages = pages.length - (idx + 1);
    const avgTimePerPage = elapsed / (idx + 1);
    const etaSecs = Math.round(remainingPages * avgTimePerPage);
    const eta = etaSecs > 60 ? `${Math.floor(etaSecs / 60)}m ${etaSecs % 60}s` : `${etaSecs}s`;

    // Update task object
    const updatedTask = {
      ...initialTask,
      progress,
      downloadedPages: successCount,
      speed,
      eta: progress === 100 ? 'Concluído' : eta,
      status: (progress === 100 ? 'Completed' : 'Downloading') as any
    };

    // Save to task history
    const currentTasks = loadJson<any[]>(TASKS_FILE, []);
    const taskIdx = currentTasks.findIndex(t => t.id === taskId);
    if (taskIdx !== -1) {
      currentTasks[taskIdx] = updatedTask;
      saveJson(TASKS_FILE, currentTasks);
    }
    broadcastEvent('task-update', { task: updatedTask });
  }

  // Handle CBZ wrapping if enabled
  let finalFormat: 'CBZ' | 'PDF' | 'ZIP' | 'RAW' = 'RAW';
  let finalSizeStr = '0 MB';

  if (autoExtractCBZ && successCount > 0) {
    try {
      logToClient('INFO', `Compactando capítulo em formato CBZ...`);
      // We dynamically import adm-zip to compress files to CBZ
      const AdmZip = (await import('adm-zip')).default;
      const zip = new AdmZip();
      
      // Read all downloaded images and add to zip
      const files = fs.readdirSync(finalFolder);
      files.forEach(f => {
        zip.addLocalFile(path.join(finalFolder, f));
      });

      const cbzPath = path.join(path.dirname(finalFolder), `${cleanChapterName}.cbz`);
      zip.writeZip(cbzPath);

      // Delete the raw images folder
      fs.rmSync(finalFolder, { recursive: true, force: true });
      logToClient('OK', `Arquivo CBZ criado com sucesso em: ${cbzPath}`);
      
      finalFormat = 'CBZ';
      const stats = fs.statSync(cbzPath);
      finalSizeStr = (stats.size / (1024 * 1024)).toFixed(1) + ' MB';
    } catch (e: any) {
      logToClient('WARN', `Não foi possível criar o arquivo CBZ: ${e.message}. Mantendo pasta de imagens em RAW.`);
      finalFormat = 'RAW';
      // Calculate folder size
      let totalSize = 0;
      if (fs.existsSync(finalFolder)) {
        fs.readdirSync(finalFolder).forEach(f => {
          totalSize += fs.statSync(path.join(finalFolder, f)).size;
        });
      }
      finalSizeStr = (totalSize / (1024 * 1024)).toFixed(1) + ' MB';
    }
  } else {
    // Calculate folder size for RAW download
    let totalSize = 0;
    if (fs.existsSync(finalFolder)) {
      fs.readdirSync(finalFolder).forEach(f => {
        totalSize += fs.statSync(path.join(finalFolder, f)).size;
      });
    }
    finalSizeStr = (totalSize / (1024 * 1024)).toFixed(1) + ' MB';
  }

  logToClient('OK', `Download do capítulo finalizado com sucesso! [100%]`);

  // Add to Recent Mangas list
  const newManga = {
    id: `manga-${Date.now()}`,
    title: cleanMangaTitle,
    chapter: cleanChapterName,
    status: 'Salvo' as const,
    coverUrl: initialTask.coverUrl,
    author: chapterData.obra?.obr_autor || 'Autor Desconhecido',
    description: chapterData.obra?.obr_sinopse || `Capítulo baixado da URL via automação.`,
    format: finalFormat,
    fileSize: finalSizeStr,
    downloadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    pagesCount: successCount,
    chapterPages: downloadedPagesList
  };

  const allMangas = loadJson<any[]>(MANGAS_FILE, []);
  allMangas.unshift(newManga);
  saveJson(MANGAS_FILE, allMangas);
  broadcastEvent('manga-new', { manga: newManga });

  activeTasks.delete(taskId);
  return true;
}

// Scrape entire manga obra (all chapters)
async function downloadObraTask(obraSlug: string, outputBaseDir: string, accessToken: string, autoExtractCBZ: boolean): Promise<boolean> {
  logToClient('INFO', `Buscando capítulos da obra: "${obraSlug}"`);

  const apiHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  };
  if (accessToken) {
    apiHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const apiUrl = `https://api.verdinha.wtf/obras/${obraSlug}`;
    const response = await fetch(apiUrl, { headers: apiHeaders });
    
    if (response.status === 403) {
      logToClient('ERROR', `Acesso negado para a obra ${obraSlug}. Forneça um Token de Acesso VIP nas Configurações.`);
      return false;
    }
    
    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    const obraData = await response.json();
    const chapters: any[] = obraData.capitulos || [];
    
    logToClient('INFO', `Obra "${obraData.obr_nome}" carregada. Encontrados ${chapters.length} capítulos.`);
    
    if (chapters.length === 0) {
      logToClient('WARN', `Esta obra não possui capítulos para download.`);
      return true;
    }

    // Sort chapters in ascending order (older first)
    const sortedChapters = [...chapters].sort((a, b) => (a.cap_numero || 0) - (b.cap_numero || 0));
    
    logToClient('INFO', `Iniciando download em lote de ${sortedChapters.length} capítulos...`);

    for (const chap of sortedChapters) {
      const success = await downloadChapterTask(String(chap.cap_id), outputBaseDir, accessToken, autoExtractCBZ);
      if (!success) {
        logToClient('WARN', `Download em lote de "${obraData.obr_nome}" interrompido pelo usuário.`);
        return false;
      }
      // Tiny delay between chapters
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    logToClient('OK', `Download em lote de "${obraData.obr_nome}" concluído com sucesso!`);
    return true;
  } catch (err: any) {
    logToClient('ERROR', `Erro ao buscar capítulos da obra "${obraSlug}": ${err.message}`);
    return false;
  }
}

// Scrape entire genre/category of mangas
async function downloadGenreTask(genreId: string, outputBaseDir: string, accessToken: string, autoExtractCBZ: boolean) {
  logToClient('INFO', `Iniciando raspagem de obras da categoria/gênero ID: ${genreId}`);

  const apiHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  };
  if (accessToken) {
    apiHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    // Fetch updates for this genre
    const apiUrl = `https://api.verdinha.wtf/obras/atualizacoes?pagina=1&limite=48&gen_id=${genreId}`;
    const response = await fetch(apiUrl, { headers: apiHeaders });
    
    if (response.status === 403) {
      logToClient('ERROR', `Acesso negado para o gênero ${genreId}. Forneça um Token de Acesso VIP nas Configurações.`);
      return;
    }
    
    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    const data = await response.json();
    const obras: any[] = data.obras || [];
    
    logToClient('INFO', `Gênero ID ${genreId} carregado. Encontradas ${obras.length} obras para baixar.`);
    
    if (obras.length === 0) {
      logToClient('WARN', `Nenhuma obra encontrada para esta categoria.`);
      return;
    }

    for (const obra of obras) {
      const slug = obra.obr_slug || String(obra.obr_id);
      logToClient('INFO', `Enfileirando obra: "${obra.obr_nome}" (${slug})`);
      // Download the whole obra
      const success = await downloadObraTask(slug, outputBaseDir, accessToken, autoExtractCBZ);
      if (!success) {
        logToClient('WARN', `Download do gênero ID ${genreId} interrompido pelo usuário.`);
        break;
      }
      // Small pause between obras to protect the server
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    logToClient('OK', `Download de todas as obras da categoria/gênero ID ${genreId} concluído!`);
  } catch (err: any) {
    logToClient('ERROR', `Erro ao buscar obras da categoria/gênero ${genreId}: ${err.message}`);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get('/api/settings', (req, res) => {
    res.json(loadJson(SETTINGS_FILE, {}));
  });

  app.post('/api/settings', (req, res) => {
    saveJson(SETTINGS_FILE, req.body);
    res.json({ success: true });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    try {
      logToClient('INFO', `Tentando autenticar usuário "${email}" no site Verdinha...`);
      const response = await fetch('https://api.verdinha.wtf/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          login: email,
          senha: password,
          tipo_usuario: 'usuario'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        logToClient('ERROR', `Falha na autenticação: ${errorData.message || 'Credenciais inválidas'}`);
        res.status(401).json({ error: errorData.message || 'Usuário ou senha inválidos no site Verdinha.' });
        return;
      }

      const data = await response.json();
      const token = data.access_token;
      
      if (!token) {
        logToClient('ERROR', `Nenhum token retornado pelo servidor da Verdinha.`);
        res.status(500).json({ error: 'Nenhum token de acesso foi retornado do site.' });
        return;
      }

      logToClient('OK', `Autenticação bem-sucedida para o usuário "${email}"!`);

      // Update stored settings with this new token and credentials
      const currentSettings = loadJson<any>(SETTINGS_FILE, {});
      currentSettings.accessToken = token;
      currentSettings.email = email;
      currentSettings.password = password;
      saveJson(SETTINGS_FILE, currentSettings);

      res.json({ success: true, accessToken: token });
    } catch (e: any) {
      logToClient('ERROR', `Erro de rede ao conectar à API da Verdinha: ${e.message}`);
      res.status(500).json({ error: `Erro ao conectar ao servidor da Verdinha: ${e.message}` });
    }
  });

  app.get('/api/mangas', (req, res) => {
    res.json(loadJson(MANGAS_FILE, []));
  });

  app.get('/api/tasks', (req, res) => {
    res.json(loadJson(TASKS_FILE, []));
  });

  app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    const settings = loadJson<any>(SETTINGS_FILE, {});
    const outDir = settings.outputDirectory || path.join(__dirname, 'downloads');
    const token = settings.accessToken || '';
    const cbz = !!settings.autoExtractCBZ;

    // Check if genre/category URL
    // e.g. https://verdinha.wtf/?tab=lendo#/?gen_id=5
    const genMatch = url.match(/gen_id=(\d+)/);

    // Check if chapter URL
    // e.g., https://verdinha.wtf/?tab=lendo#/capitulo/396410
    const chapMatch = url.match(/capitulo\/(\d+)/);
    
    // Check if obra URL
    // e.g., https://verdinha.wtf/?tab=lendo#/obras/salvando-minha-garota-magica
    const obraMatch = url.match(/obras\/([a-zA-Z0-9_-]+)/);

    if (genMatch) {
      const genreId = genMatch[1];
      // Run async
      downloadGenreTask(genreId, outDir, token, cbz);
      res.json({ success: true, message: 'Download de categoria/gênero iniciado' });
    } else if (chapMatch) {
      const capId = chapMatch[1];
      // Run async
      downloadChapterTask(capId, outDir, token, cbz);
      res.json({ success: true, message: 'Download de capítulo iniciado' });
    } else if (obraMatch) {
      const slug = obraMatch[1];
      // Run async
      downloadObraTask(slug, outDir, token, cbz);
      res.json({ success: true, message: 'Download em lote de obra iniciado' });
    } else {
      // Try to treat entire input as raw numeric ID
      if (/^\d+$/.test(url.trim())) {
        downloadChapterTask(url.trim(), outDir, token, cbz);
        res.json({ success: true, message: 'Download de capítulo iniciado' });
      } else {
        res.status(400).json({ error: 'Não foi possível identificar o capítulo, obra ou categoria/gênero a partir da URL fornecida.' });
      }
    }
  });

  app.post('/api/tasks/:id/pause', (req, res) => {
    const { id } = req.params;
    const state = activeTasks.get(id);
    if (state) {
      state.isPaused = true;
      const currentTasks = loadJson<any[]>(TASKS_FILE, []);
      const idx = currentTasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        currentTasks[idx].status = 'Paused';
        currentTasks[idx].eta = 'Pausado';
        saveJson(TASKS_FILE, currentTasks);
        broadcastEvent('task-update', { task: currentTasks[idx] });
      }
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Task not running' });
    }
  });

  app.post('/api/tasks/:id/resume', (req, res) => {
    const { id } = req.params;
    const state = activeTasks.get(id);
    if (state) {
      state.isPaused = false;
      const currentTasks = loadJson<any[]>(TASKS_FILE, []);
      const idx = currentTasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        currentTasks[idx].status = 'Downloading';
        currentTasks[idx].eta = 'Calculando...';
        saveJson(TASKS_FILE, currentTasks);
        broadcastEvent('task-update', { task: currentTasks[idx] });
      }
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Task not running' });
    }
  });

  app.post('/api/tasks/:id/cancel', (req, res) => {
    const { id } = req.params;
    const state = activeTasks.get(id);
    if (state) {
      state.isCancelled = true;
    }
    // Update the task file anyway so that it's cancelled even if it finished or wasn't running
    const currentTasks = loadJson<any[]>(TASKS_FILE, []);
    const idx = currentTasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      currentTasks[idx].status = 'Cancelled';
      currentTasks[idx].eta = 'Cancelado';
      saveJson(TASKS_FILE, currentTasks);
      broadcastEvent('task-update', { task: currentTasks[idx] });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  });

  app.post('/api/mangas/clear', (req, res) => {
    saveJson(MANGAS_FILE, []);
    res.json({ success: true });
  });

  app.post('/api/mangas/clear-covers', (req, res) => {
    const allMangas = loadJson<any[]>(MANGAS_FILE, []);
    const updated = allMangas.map(m => ({
      ...m,
      coverUrl: '',
      chapterPages: []
    }));
    saveJson(MANGAS_FILE, updated);
    res.json({ success: true });
  });

  // Server-Sent Events endpoint
  app.get('/api/events', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.write('retry: 10000\n\n');

    const client = { id: Date.now(), res };
    sseClients.push(client);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c.id !== client.id);
    });
  });

  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (isProd) {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } else {
    // Programmatically mount Vite dev server in middlewareMode
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    app.listen(port, () => {
      console.log(`[DEV] Unified Server running on http://localhost:${port}`);
    });
  }
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
});
