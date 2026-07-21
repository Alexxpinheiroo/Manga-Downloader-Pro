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

    const searchPatterns = ["/auth/login", "/auth/entrar", "/login", "/auth/"];
    searchPatterns.forEach(pattern => {
      let idx = 0;
      console.log(`=== Searching for: ${pattern} ===`);
      while (true) {
        idx = jsText.indexOf(pattern, idx);
        if (idx === -1) break;
        console.log(`Found at index ${idx}:`);
        console.log(jsText.slice(Math.max(0, idx - 150), Math.min(jsText.length, idx + 150)));
        idx += pattern.length;
      }
    });

  } catch (err) {
    console.error('Error:', err);
  }
}
test();
