import { MangaItem, LogEntry, DownloadTask, AppSettings } from '../types';

export const LOGO_URL = '/favicon.svg';

export const INITIAL_MANGAS: MangaItem[] = [
  {
    id: 'naruto-80',
    title: 'Naruto: Next Generations',
    chapter: 'Capítulo 80',
    status: 'Salvo',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm5TTbGJoSnIhJ4ZIbfhB2u4nbBttlOvrEFrsJ5bZD1opL0-rA55W8JkBvd3lsuvaAME7uj24CSAWPxcdsY23jo0Kq2Y7uWHNVglj3c79Afl9s4O1lS3qErxCqQVy9KYZvj-kiTqmnbNpQPO2ZE3z2icy9FZvZUrqfkzSSGFGnG6lMeyjX208PHoZg29Dydigj7HpeEdPA10O_m5FDt7nJWHmzrM4qBYAtxBTaT5Z-CM_Ac7QKvJtfLg',
    author: 'Masashi Kishimoto / Mikio Ikemoto',
    description: 'Naruto e a nova geração de ninjas enfrentam ameaças colossais no universo shinobi.',
    format: 'CBZ',
    fileSize: '48.2 MB',
    downloadedAt: '2026-07-21 13:45',
    pagesCount: 42,
    chapterPages: [
      {
        pageNumber: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm5TTbGJoSnIhJ4ZIbfhB2u4nbBttlOvrEFrsJ5bZD1opL0-rA55W8JkBvd3lsuvaAME7uj24CSAWPxcdsY23jo0Kq2Y7uWHNVglj3c79Afl9s4O1lS3qErxCqQVy9KYZvj-kiTqmnbNpQPO2ZE3z2icy9FZvZUrqfkzSSGFGnG6lMeyjX208PHoZg29Dydigj7HpeEdPA10O_m5FDt7nJWHmzrM4qBYAtxBTaT5Z-CM_Ac7QKvJtfLg',
        fileName: '001_cover.jpg'
      }
    ]
  },
  {
    id: 'solo-leveling-final',
    title: 'Solo Leveling',
    chapter: 'Capítulo Final',
    status: 'Salvo',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9_ISNHol76cfPYLtaiHk9L1Gz_kODhLQ7RxjujDR8tuP-CDp90zhK_OUTnZlz4Z7AL_00AcGB-0498eKSoTZ_hSGYgDxq4-mVyeEqibg2qsV0NusXds5mK8V_60qEd1RL0csUOep9U1_sjIXUx0rieGRrqJkneKw0BmPnBsiZtCRN9lRvDOF2TXIFCyiAAJ6ac_nslXdfppiwxSrrCI-meAj4CAVTZXsTILRUxAs4KgVCiZFJAOHSPg',
    author: 'Chugong / DUBU (REDICE Studio)',
    description: 'O Caçador Sung Jinwoo enfrenta o clímax de sua jornada épica contra as forças das sombras.',
    format: 'CBZ',
    fileSize: '62.8 MB',
    downloadedAt: '2026-07-21 14:02',
    pagesCount: 58,
    chapterPages: [
      {
        pageNumber: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9_ISNHol76cfPYLtaiHk9L1Gz_kODhLQ7RxjujDR8tuP-CDp90zhK_OUTnZlz4Z7AL_00AcGB-0498eKSoTZ_hSGYgDxq4-mVyeEqibg2qsV0NusXds5mK8V_60qEd1RL0csUOep9U1_sjIXUx0rieGRrqJkneKw0BmPnBsiZtCRN9lRvDOF2TXIFCyiAAJ6ac_nslXdfppiwxSrrCI-meAj4CAVTZXsTILRUxAs4KgVCiZFJAOHSPg',
        fileName: '001_final_cover.jpg'
      }
    ]
  },
  {
    id: 'one-piece-1099',
    title: 'One Piece',
    chapter: 'Capítulo 1099',
    status: 'Salvo',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wVPLgNML81wM9VkJG4kIfGc0CWxYcc-E2JDSJ9KluFiEJMpiaHvlqTVssLkGDtjz7pQokL30GXUcr1im2Q4nDXW9-H4lBfraywf0LyTrSLaKX8VxsrGPef6olKD1xruhW2mlV7BNVe-XmhcKhbuAbankEvZU-OBb5WL-8rhB5DYVI7C0L1j-Ptu1taWS6ojez5tcFVb21Tyc8KyryJuxEoU1gbU4F7_ErNqOTjs9jEZjdYAS35NEuw',
    author: 'Eiichiro Oda',
    description: 'A grandiosa aventura dos Chapéus de Palha em busca do lendário tesouro One Piece.',
    format: 'CBZ',
    fileSize: '35.4 MB',
    downloadedAt: '2026-07-21 14:22',
    pagesCount: 19,
    chapterPages: [
      {
        pageNumber: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wVPLgNML81wM9VkJG4kIfGc0CWxYcc-E2JDSJ9KluFiEJMpiaHvlqTVssLkGDtjz7pQokL30GXUcr1im2Q4nDXW9-H4lBfraywf0LyTrSLaKX8VxsrGPef6olKD1xruhW2mlV7BNVe-XmhcKhbuAbankEvZU-OBb5WL-8rhB5DYVI7C0L1j-Ptu1taWS6ojez5tcFVb21Tyc8KyryJuxEoU1gbU4F7_ErNqOTjs9jEZjdYAS35NEuw',
        fileName: 'op_1099_cover.jpg'
      }
    ]
  },
  {
    id: 'jujutsu-kaisen-245',
    title: 'Jujutsu Kaisen',
    chapter: 'Capítulo 245',
    status: 'Salvo',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyhRFVF5ppuB-BTsv2aDAT__hlwE3nYIvDXwZhw7vmNTByxl-GtFJS6FyHNL7nx5bYJ_qnMrkllP9_6urtC33_EEf-yM9rGavh3XJM07YBRj0JzEV9SG47qfqP3YtMuBjydYRmcOYd97zo0FeHbptq-v2wK7SPGdbXJMJp1BiwEZrhNqt9S4cMhjbTvhLaXw0jF1wj1LLvB2ytdO1Uab5CicwR4QeE_m5XXC8zw1exjnkHGYVhMfNKVg',
    author: 'Gege Akutami',
    description: 'Batalha feroz dos feiticeiros jujutsu contra o Rei das Maldições, Ryomen Sukuna.',
    format: 'CBZ',
    fileSize: '29.1 MB',
    downloadedAt: '2026-07-21 12:10',
    pagesCount: 22,
    chapterPages: [
      {
        pageNumber: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyhRFVF5ppuB-BTsv2aDAT__hlwE3nYIvDXwZhw7vmNTByxl-GtFJS6FyHNL7nx5bYJ_qnMrkllP9_6urtC33_EEf-yM9rGavh3XJM07YBRj0JzEV9SG47qfqP3YtMuBjydYRmcOYd97zo0FeHbptq-v2wK7SPGdbXJMJp1BiwEZrhNqt9S4cMhjbTvhLaXw0jF1wj1LLvB2ytdO1Uab5CicwR4QeE_m5XXC8zw1exjnkHGYVhMfNKVg',
        fileName: 'jjk_245_cover.jpg'
      }
    ]
  },
  {
    id: 'berserk-vol-41',
    title: 'Berserk',
    chapter: 'Volume 41',
    status: 'Salvo',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5VWQUzOWlKZY-rgeYyHur2RgGOWoLY2gmczZTFCao97RlTekzEQ5DBc_sMMQDd1tO7f5nAib-u1jcj2qAgHupVO7p1KC7CaPg9J6GZtbaEvuP_MKL0gENR8dE8LOAoQqmZoGlTN2scawJBV0u2-k1V60JIUXSDej2qEwOqxJRtH3X0sN8tnZ31lE-bY2HHtASL4pkz2ImOjo62zeXbCECyo12SGm_LXvSWGj7ZXTFXmNNURjZ2mekmg',
    author: 'Kentarou Miura / Studio Gaga',
    description: 'A jornada sombria de Guts na armadura Berserker em um mundo de fantasia sombria.',
    format: 'PDF',
    fileSize: '184.0 MB',
    downloadedAt: '2026-07-21 09:30',
    pagesCount: 220,
    chapterPages: [
      {
        pageNumber: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5VWQUzOWlKZY-rgeYyHur2RgGOWoLY2gmczZTFCao97RlTekzEQ5DBc_sMMQDd1tO7f5nAib-u1jcj2qAgHupVO7p1KC7CaPg9J6GZtbaEvuP_MKL0gENR8dE8LOAoQqmZoGlTN2scawJBV0u2-k1V60JIUXSDej2qEwOqxJRtH3X0sN8tnZ31lE-bY2HHtASL4pkz2ImOjo62zeXbCECyo12SGm_LXvSWGj7ZXTFXmNNURjZ2mekmg',
        fileName: 'berserk_vol41_cover.jpg'
      }
    ]
  },
  {
    id: 'chainsaw-man-150',
    title: 'Chainsaw Man',
    chapter: 'Capítulo 150',
    status: 'Salvo',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6dkSHxsTiRoz-1N7-xGCgDrr8twRVqUMDNCp6XXTTBp9MUPvNJsiCuk9BVw9eYakntuqrG7w_mEnSbMSNqU-EEzLfI_ekZWkUpY9auoBnPLXd2MHJ2uaTOv8Tqi52gZXuhy4g_LRX8Bn3nVDB6ICEtiVWV9i6c_DLmnjwK5GtcrfQG-MKa9bjIzJKkTF01KKfsiKIYYuFIK2dLbKw49kGZYgm9C5ERdb1tqR4470csX67IUx3a8qDzA',
    author: 'Tatsuki Fujimoto',
    description: 'Denji e os demônios na louca e visceral saga da segunda parte de Chainsaw Man.',
    format: 'CBZ',
    fileSize: '31.7 MB',
    downloadedAt: '2026-07-20 22:15',
    pagesCount: 20,
    chapterPages: [
      {
        pageNumber: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6dkSHxsTiRoz-1N7-xGCgDrr8twRVqUMDNCp6XXTTBp9MUPvNJsiCuk9BVw9eYakntuqrG7w_mEnSbMSNqU-EEzLfI_ekZWkUpY9auoBnPLXd2MHJ2uaTOv8Tqi52gZXuhy4g_LRX8Bn3nVDB6ICEtiVWV9i6c_DLmnjwK5GtcrfQG-MKa9bjIzJKkTF01KKfsiKIYYuFIK2dLbKw49kGZYgm9C5ERdb1tqR4470csX67IUx3a8qDzA',
        fileName: 'csm_150_cover.jpg'
      }
    ]
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  { id: '1', timestamp: '14:22:01', type: 'INFO', message: 'Inicializando downloader v2.4.0...' },
  { id: '2', timestamp: '14:22:05', type: 'INFO', message: 'Conectando ao servidor fonte...' },
  { id: '3', timestamp: '14:22:08', type: 'EXEC', message: 'Baixando: One Piece - Capítulo 1100' },
  { id: '4', timestamp: '14:22:10', type: 'OK', message: 'Baixando: capa.jpg... [OK]' },
  { id: '5', timestamp: '14:22:12', type: 'OK', message: 'Baixando: 1.jpg... [OK]' },
  { id: '6', timestamp: '14:22:14', type: 'OK', message: 'Baixando: 2.jpg... [OK]' },
  { id: '7', timestamp: '14:22:15', type: 'WAIT', message: 'Processando imagem 3...' }
];

export const INITIAL_TASKS: DownloadTask[] = [
  {
    id: 'task-1',
    mangaTitle: 'One Piece',
    chapterName: 'Capítulo 1100',
    url: 'https://mangadex.org/title/one-piece/chapter-1100',
    progress: 45,
    speed: '12.4 MB/s',
    status: 'Downloading',
    downloadedPages: 9,
    totalPages: 20,
    eta: '00:14s',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wVPLgNML81wM9VkJG4kIfGc0CWxYcc-E2JDSJ9KluFiEJMpiaHvlqTVssLkGDtjz7pQokL30GXUcr1im2Q4nDXW9-H4lBfraywf0LyTrSLaKX8VxsrGPef6olKD1xruhW2mlV7BNVe-XmhcKhbuAbankEvZU-OBb5WL-8rhB5DYVI7C0L1j-Ptu1taWS6ojez5tcFVb21Tyc8KyryJuxEoU1gbU4F7_ErNqOTjs9jEZjdYAS35NEuw',
    outputDir: '/Downloads/Mangas/One Piece/Capitulo_1100'
  },
  {
    id: 'task-2',
    mangaTitle: 'Demon Slayer: Kimetsu no Yaiba',
    chapterName: 'Capítulo 205 (Completo)',
    url: 'https://mangadex.org/chapter/demon-slayer-205',
    progress: 100,
    speed: '0 KB/s',
    status: 'Completed',
    downloadedPages: 24,
    totalPages: 24,
    eta: 'Concluído',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyhRFVF5ppuB-BTsv2aDAT__hlwE3nYIvDXwZhw7vmNTByxl-GtFJS6FyHNL7nx5bYJ_qnMrkllP9_6urtC33_EEf-yM9rGavh3XJM07YBRj0JzEV9SG47qfqP3YtMuBjydYRmcOYd97zo0FeHbptq-v2wK7SPGdbXJMJp1BiwEZrhNqt9S4cMhjbTvhLaXw0jF1wj1LLvB2ytdO1Uab5CicwR4QeE_m5XXC8zw1exjnkHGYVhMfNKVg',
    outputDir: '/Downloads/Mangas/Demon Slayer'
  },
  {
    id: 'task-3',
    mangaTitle: 'My Hero Academia',
    chapterName: 'Capítulo 420',
    url: 'https://mangadex.org/title/mha/chapter-420',
    progress: 0,
    speed: '0 KB/s',
    status: 'Queued',
    downloadedPages: 0,
    totalPages: 18,
    eta: 'Aguardando',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm5TTbGJoSnIhJ4ZIbfhB2u4nbBttlOvrEFrsJ5bZD1opL0-rA55W8JkBvd3lsuvaAME7uj24CSAWPxcdsY23jo0Kq2Y7uWHNVglj3c79Afl9s4O1lS3qErxCqQVy9KYZvj-kiTqmnbNpQPO2ZE3z2icy9FZvZUrqfkzSSGFGnG6lMeyjX208PHoZg29Dydigj7HpeEdPA10O_m5FDt7nJWHmzrM4qBYAtxBTaT5Z-CM_Ac7QKvJtfLg',
    outputDir: '/Downloads/Mangas/My Hero Academia'
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  outputDirectory: 'g:/Manga-Downloader-Pro/downloads',
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
  accessToken: '',
  email: '',
  password: ''
};
