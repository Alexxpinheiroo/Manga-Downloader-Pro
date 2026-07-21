async function test() {
  try {
    const token = '9fd19cc9e1fc5073caeafb46e85eeea338300f6ccfb5690ec791cd0385e1e5ac970416609f8ed0f535cfcd81d3d4655b2b96332cee445cca7c41da22113d44f4';
    const capId = '301673';
    const apiUrl = `https://api.verdinha.wtf/capitulos/${capId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('Chapter Data keys:', Object.keys(data));
    console.log('Chapter Data metadata:', {
      cap_id: data.cap_id,
      cap_numero: data.cap_numero,
      scan_id: data.scan_id,
      obr_id: data.obr_id,
      is_wp: data.is_wp,
      cap_diretorio: data.cap_diretorio, // Let's check if this exists!
      cap_pasta: data.cap_pasta // Let's check if this exists!
    });
    console.log('First 5 pages:', data.cap_paginas ? data.cap_paginas.slice(0, 5) : null);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
