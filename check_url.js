async function test() {
  const urls = [
    'https://cdn.verdinha.wtf/scans/1/obras/9660/capitulos/8/edb34e9efaaee9b463c6d725ad241f2b/001.jpg',
    'https://cdn.verdinha.wtf/scans/1/obras/9660/capitulos/8/edb34e9efaaee9b463c6d725ad241f2b/001.jpg',
    'https://cdn.verdinha.wtf/scans/1/obras/9660/capitulos/8/001.jpg',
    'https://cdn.verdinha.wtf/scans/1/obras/9660/capitulos/8/edb34e9efaaee9b463c6d725ad241f2b/001.jpg',
    'https://cdn.verdinha.wtf/scans/1/obras/9660/edb34e9efaaee9b463c6d725ad241f2b/001.jpg'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`URL: ${url} -> Status: ${res.status}`);
    } catch (e) {
      console.log(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}
test();
