(()=>{
  const V='34';
  const parts=Array.from({length:8},(_,i)=>`app-part-${String(i+1).padStart(2,'0')}.txt?v=${V}`);

  async function get(url){
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok) throw new Error(`Falha ao carregar ${url}: HTTP ${r.status}`);
    return r.text();
  }

  function clean(text){
    return String(text??'')
      .replace(/^\uFEFF/,'')
      .replace(/[\s\u200B\u200C\u200D]/g,'')
      .replace(/-/g,'+')
      .replace(/_/g,'/')
      .replace(/=/g,'');
  }

  function decodeMerged(text){
    let s=clean(text);
    if(!s || !/^[A-Za-z0-9+/]*$/.test(s)){
      throw new Error('Pacote Base64 inválido: caracteres inesperados.');
    }
    if(s.length%4===1){
      throw new Error(`Pacote Base64 inválido: comprimento final ${s.length}.`);
    }
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
    const buffer=await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
    return new TextDecoder().decode(buffer);
  }

  Promise.all(parts.map(get))
    .then(async texts=>{
      // app-part-* são cortes arbitrários do mesmo fluxo Base64.
      const merged=texts.map(clean).join('');
      const raw=decodeMerged(merged);

      if(raw.length<2 || raw[0]!==0x1f || raw[1]!==0x8b){
        throw new Error('Pacote GZIP inválido.');
      }

      const code=await gunzip(raw);
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
            <p class="muted" style="font-size:12px">Versão ${V}. Os fragmentos Base64 são unidos antes da decodificação.</p>
          </section>
        </main>`;
    });
})();
