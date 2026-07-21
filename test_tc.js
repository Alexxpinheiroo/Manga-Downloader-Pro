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

    console.log(jsText.slice(385200, 386200));
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
