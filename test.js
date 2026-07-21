async function test() {
  try {
    const url = 'https://verdinha.wtf/';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const match = text.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (!match) return;
    const jsUrl = 'https://verdinha.wtf' + match[1];
    const jsRes = await fetch(jsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const jsText = await jsRes.text();

    const searchPatterns = ["K.get('/obras/", 'K.get(`/obras/', 'K.get("/obras/'];
    searchPatterns.forEach(pattern => {
      let idx = 0;
      while (true) {
        idx = jsText.indexOf(pattern, idx);
        if (idx === -1) break;
        console.log(`Found "${pattern}" at index ${idx}:`);
        console.log(jsText.slice(Math.max(0, idx - 100), Math.min(jsText.length, idx + 100)));
        idx += pattern.length;
      }
    });

  } catch (err) {
    console.error('Error:', err);
  }
}
test();
