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

    console.log('Searching for cdn.verdinha.wtf references...');
    let idx = 0;
    while (true) {
      idx = jsText.indexOf('cdn.verdinha.wtf', idx);
      if (idx === -1) break;
      console.log(`Found at index ${idx}:`);
      console.log(jsText.slice(Math.max(0, idx - 200), Math.min(jsText.length, idx + 200)));
      idx += 'cdn.verdinha.wtf'.length;
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
