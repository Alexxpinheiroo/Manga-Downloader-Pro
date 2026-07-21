async function test() {
  try {
    const token = '9fd19cc9e1fc5073caeafb46e85eeea338300f6ccfb5690ec791cd0385e1e5ac970416609f8ed0f535cfcd81d3d4655b2b96332cee445cca7c41da22113d44f4';
    
    // Step 1: Fetch obra 9660 to find chapter 8's ID
    const obraRes = await fetch('https://api.verdinha.wtf/obras/9660', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Authorization': `Bearer ${token}`
      }
    });
    const obraData = await obraRes.json();
    console.log('Obra Title:', obraData.obr_nome);
    const chap8 = (obraData.capitulos || []).find(c => c.cap_numero === 8);
    if (!chap8) {
      console.log('Chapter 8 not found in chapters:', obraData.capitulos);
      return;
    }
    console.log('Chapter 8 info:', chap8);

    // Step 2: Fetch chapter 8's metadata
    const capRes = await fetch(`https://api.verdinha.wtf/capitulos/${chap8.cap_id}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Authorization': `Bearer ${token}`
      }
    });
    const capData = await capRes.json();
    console.log('First 3 pages:', capData.cap_paginas ? capData.cap_paginas.slice(0, 3) : null);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
