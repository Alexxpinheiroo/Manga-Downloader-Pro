import React, { useState } from 'react';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
  defaultDir?: string;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  isOpen,
  onClose,
  defaultUrl = 'https://exemplo.com/manga/capitulo-55',
  defaultDir = './manga_capitulo_55',
}) => {
  const [targetUrl, setTargetUrl] = useState(defaultUrl);
  const [outputFolder, setOutputFolder] = useState(defaultDir);
  const [usePlaywright, setUsePlaywright] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonScriptCode = usePlaywright
    ? `import os
import re
import time
import requests
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

def download_manga_chapter(chapter_url, custom_output_dir=None):
    """
    Manga Downloader Pro - Automação Completa via Playwright.
    Extrai e baixa automaticamente todas as páginas de um capítulo inserindo APENAS a URL do capítulo.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': chapter_url
    }

    print(f"\\n==================================================")
    print(f"[+] Iniciando Manga Downloader Pro")
    print(f"[+] Carregando URL do Capítulo: {chapter_url}")
    print(f"==================================================")

    img_urls = []
    
    # 1. Captura e Leitura da Página com Playwright (DOM Completo + JS)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent=headers['User-Agent'])
        page = context.new_page()

        try:
            page.goto(chapter_url, wait_until='networkidle', timeout=30000)
            
            # Rolagem para acionar lazy loading de leitores Web
            page.evaluate("""async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    let distance = 300;
                    let timer = setInterval(() => {
                        let scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if(totalHeight >= scrollHeight){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            }""")
            time.sleep(2)

            images = page.query_selector_all('img')
            for img in images:
                src = (
                    img.get_attribute('src') or 
                    img.get_attribute('data-src') or 
                    img.get_attribute('data-lazy-src') or
                    img.get_attribute('data-original')
                )
                if src:
                    src_clean = src.strip()
                    if any(ext in src_clean.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.avif']):
                        full_url = urljoin(chapter_url, src_clean)
                        if full_url not in img_urls:
                            img_urls.append(full_url)

        except Exception as err:
            print(f"[-] Erro ao renderizar a página: {err}")
        finally:
            browser.close()

    total_images = len(img_urls)
    if total_images == 0:
        print("[-] Nenhuma imagem foi encontrada na URL informada.")
        return

    # Feedback no Terminal
    print(f"\\n[+] Identificadas {total_images} imagens no capítulo.")

    # Definir nome da pasta de destino
    if not custom_output_dir or custom_output_dir == './manga_capitulo_55':
        path_parts = [p for p in urlparse(chapter_url).path.split('/') if p]
        folder_name = "_".join(path_parts[-2:]) if len(path_parts) >= 2 else "capitulo_manga"
        folder_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', folder_name)
    else:
        folder_name = custom_output_dir

    os.makedirs(folder_name, exist_ok=True)
    print(f"[+] Pasta de destino criada: {os.path.abspath(folder_name)}\\n")

    # 2. Loop de Download Sequencial em Lote
    session = requests.Session()
    session.headers.update(headers)

    for index, img_url in enumerate(img_urls):
        parsed = urlparse(img_url)
        ext = os.path.splitext(parsed.path)[1]
        if not ext or len(ext) > 5 or '?' in ext:
            ext = '.jpg'

        # Regra de nomeação solicitada:
        # Imagem 0 (primeira foto/capa) -> capa.jpg
        # Imagens subsequentes -> 1.jpg, 2.jpg, 3.jpg, ..., N.jpg
        if index == 0:
            filename = f"capa{ext}"
        else:
            filename = f"{index}{ext}"

        filepath = os.path.join(folder_name, filename)

        success = False
        for attempt in range(3):
            try:
                res = session.get(img_url, timeout=20)
                res.raise_for_status()
                with open(filepath, 'wb') as f:
                    f.write(res.content)
                success = True
                break
            except Exception:
                time.sleep(1)

        # Output de feedback no terminal conforme especificado
        if success:
            print(f"Baixando: {filename}... [OK]")
        else:
            print(f"Baixando: {filename}... [ERRO]")

    print(f"\\n[✓] Download do capítulo concluído com sucesso!")
    print(f"==================================================\\n")

if __name__ == '__main__':
    url_input = input("Insira a URL principal do capítulo: ").strip() or "${targetUrl}"
    folder_input = input("Nome da pasta de destino (deixe vazio para automático): ").strip() or "${outputFolder}"
    download_manga_chapter(url_input, folder_input)
`
    : `import os
import re
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def download_manga_chapter(chapter_url, custom_output_dir=None):
    """
    Manga Downloader Pro - Automação de Raspagem Estática (Requests + BeautifulSoup).
    Extrai e baixa todas as imagens do leitor sem exigir links manuais do usuário.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': chapter_url
    }

    print(f"\\n==================================================")
    print(f"[+] Iniciando Manga Downloader Pro")
    print(f"[+] Requisitando URL do Capítulo: {chapter_url}")
    print(f"==================================================")

    session = requests.Session()
    session.headers.update(headers)

    try:
        response = session.get(chapter_url, timeout=20)
        response.raise_for_status()
    except Exception as e:
        print(f"[-] Erro ao acessar a URL: {e}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    img_tags = soup.find_all('img')
    img_urls = []

    for img in img_tags:
        src = (
            img.get('src') or 
            img.get('data-src') or 
            img.get('data-lazy-src') or 
            img.get('data-original')
        )
        if src:
            src_clean = src.strip()
            if any(ext in src_clean.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.avif']):
                full_url = urljoin(chapter_url, src_clean)
                if full_url not in img_urls:
                    img_urls.append(full_url)

    total_images = len(img_urls)
    if total_images == 0:
        print("[-] Nenhuma imagem foi encontrada. Caso o leitor utilize JavaScript dinâmico, utilize a opção Playwright.")
        return

    print(f"\\n[+] Identificadas {total_images} imagens no capítulo.")

    if not custom_output_dir or custom_output_dir == './manga_capitulo_55':
        path_parts = [p for p in urlparse(chapter_url).path.split('/') if p]
        folder_name = "_".join(path_parts[-2:]) if len(path_parts) >= 2 else "capitulo_manga"
        folder_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', folder_name)
    else:
        folder_name = custom_output_dir

    os.makedirs(folder_name, exist_ok=True)
    print(f"[+] Pasta de destino criada: {os.path.abspath(folder_name)}\\n")

    for index, img_url in enumerate(img_urls):
        parsed = urlparse(img_url)
        ext = os.path.splitext(parsed.path)[1]
        if not ext or len(ext) > 5 or '?' in ext:
            ext = '.jpg'

        if index == 0:
            filename = f"capa{ext}"
        else:
            filename = f"{index}{ext}"

        filepath = os.path.join(folder_name, filename)

        success = False
        for attempt in range(3):
            try:
                res = session.get(img_url, timeout=20)
                res.raise_for_status()
                with open(filepath, 'wb') as f:
                    f.write(res.content)
                success = True
                break
            except Exception:
                time.sleep(1)

        if success:
            print(f"Baixando: {filename}... [OK]")
        else:
            print(f"Baixando: {filename}... [ERRO]")

    print(f"\\n[✓] Download do capítulo concluído com sucesso!")
    print(f"==================================================\\n")

if __name__ == '__main__':
    url_input = input("Insira a URL principal do capítulo: ").strip() or "${targetUrl}"
    folder_input = input("Nome da pasta de destino (deixe vazio para automático): ").strip() or "${outputFolder}"
    download_manga_chapter(url_input, folder_input)
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([pythonScriptCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'manga_downloader_pro.py';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#131b2e] border border-[#3c4a42] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#3c4a42] flex items-center justify-between bg-[#171f33]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#10b981]/10 rounded-lg text-[#4edea3]">
              <span className="material-symbols-outlined">terminal</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#dae2fd]">Manga Downloader Pro — Script Python de Automação</h3>
              <p className="text-xs font-mono text-[#bbcabf]">
                Download 100% automatizado inserindo apenas a URL principal do capítulo
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

        {/* Configuration Bar */}
        <div className="p-4 bg-[#0b1326] border-b border-[#3c4a42] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <label className="text-[10px] font-mono uppercase text-[#bbcabf] block mb-1">
              URL Principal do Capítulo
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-[#171f33] border border-[#3c4a42] rounded px-2.5 py-1.5 text-xs font-mono text-[#dae2fd]"
              placeholder="https://site.com/manga/capitulo-55"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#bbcabf] block mb-1">
              Diretório de Destino
            </label>
            <input
              type="text"
              value={outputFolder}
              onChange={(e) => setOutputFolder(e.target.value)}
              className="w-full bg-[#171f33] border border-[#3c4a42] rounded px-2.5 py-1.5 text-xs font-mono text-[#dae2fd]"
              placeholder="./manga_capitulo_55"
            />
          </div>

          <div className="flex items-center justify-between pt-4 sm:pt-0">
            <label className="flex items-center gap-2 text-xs font-mono text-[#bbcabf] cursor-pointer">
              <input
                type="checkbox"
                checked={usePlaywright}
                onChange={(e) => setUsePlaywright(e.target.checked)}
                className="accent-[#10b981]"
              />
              <span>Renderização JS (Playwright)</span>
            </label>
          </div>
        </div>

        {/* Code Box */}
        <div className="flex-1 p-4 bg-[#060e20] overflow-y-auto custom-scrollbar font-mono text-xs text-[#dae2fd]">
          <pre className="whitespace-pre-wrap break-all leading-relaxed">
            <code>{pythonScriptCode}</code>
          </pre>
        </div>

        {/* Requirements instruction box */}
        <div className="px-6 py-3 bg-[#171f33] border-t border-[#3c4a42] text-[11px] font-mono text-[#bbcabf] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#4edea3] font-bold">Comando para instalar requisitos:</span>
            <code className="bg-[#0b1326] px-2 py-1 rounded border border-[#3c4a42] text-[#dae2fd]">
              pip install requests beautifulsoup4 playwright && playwright install chromium
            </code>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#222a3d] hover:bg-[#2d3449] border border-[#3c4a42] text-[#4edea3] font-mono rounded text-xs flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="px-4 py-1.5 bg-[#10b981] hover:bg-[#6ffbbe] text-[#003824] font-bold font-mono rounded text-xs flex items-center gap-1 emerald-glow transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Baixar Script Python (.py)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
