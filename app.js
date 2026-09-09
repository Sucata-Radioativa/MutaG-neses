(()=>{
  const V='31';
  const parts=Array.from({length:8},(_,i)=>`app-segment-${String(i+1).padStart(2,'0')}.txt?v=${V}`);

  async function get(url){
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok) throw new Error(`Falha ao carregar ${url}: HTTP ${r.status}`);
    return r.text();
  }

  function cleanPart(text){
    let s=String(text??'')
      .replace(/^\uFEFF/,'')
      .replace(/[\s\u200B\u200C\u200D]/g,'')
      .replace(/-/g,'+')
      .replace(/_/g,'/')
      .replace(/=/g,'');
    if(!s || !/^[A-Za-z0-9+/]*$/.test(s) || s.length%4===1){
      throw new Error(`Base64 inválido: comprimento ${s.length}.`);
    }
    return s;
  }

  function decodeB64(text){
    let s=cleanPart(text);
    if(s.length%4) s+='='.repeat(4-s.length%4);
    const bin=atob(s);
    const out=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
    return out;
  }

  async function gunzip(bytes){
    if(!('DecompressionStream' in window)){
      throw new Error('Este navegador não suporta a descompressão necessária.');
    }
    const ds=new DecompressionStream('gzip');
    const buf=await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
    return new TextDecoder().decode(buf);
  }

  Promise.all(parts.map(get))
    .then(async texts=>{
      // Os oito arquivos são fragmentos Base64 do mesmo fluxo GZIP.
      // Eles precisam ser unidos antes da decodificação e descompressão.
      const merged=texts.map(cleanPart).join('');
      const bytes=decodeB64(merged);
      if(bytes[0]!==0x1f || bytes[1]!==0x8b){
        throw new Error('Pacote GZIP inválido.');
      }
      const code=await gunzip(bytes);
      if(!code.trim()) throw new Error('Aplicação vazia.');
      new Function(code)();
    })
    .catch(err=>{
      console.error(err);
      document.getElementById('app').innerHTML=`
        <main class="auth-page">
          <section class="auth-card terminal">
            <div class="eyebrow">MUTAGENÊSES // ERRO DE INICIALIZAÇÃO</div>
            <h1>Falha ao abrir o terminal.</h1>
            <p class="muted">${String(err.message||err)}</p>
            <p class="muted" style="font-size:12px">Versão ${V}. O carregador reconstrói os oito fragmentos como um único fluxo GZIP.</p>
          </section>
        </main>`;
    });
})();
