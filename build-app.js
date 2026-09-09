const fs = require('node:fs');
const zlib = require('node:zlib');
const vm = require('node:vm');

const parts = Array.from({length: 8}, (_, i) => `app-segment-${String(i + 1).padStart(2, '0')}.txt`);
const sources = [];

for (const file of parts) {
  let text = fs.readFileSync(file, 'utf8')
    .replace(/^\uFEFF/, '')
    .replace(/[\s\u200B\u200C\u200D]/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  if (!text || !/^[A-Za-z0-9+/]*={0,2}$/.test(text) || text.length % 4 === 1) {
    throw new Error(`rebuild: ${file}: Base64 inválido (length=${text.length})`);
  }
  const padded = text + '='.repeat((4 - (text.length % 4)) % 4);
  const raw = Buffer.from(padded, 'base64');
  if (raw.length < 2 || raw[0] !== 0x1f || raw[1] !== 0x8b) {
    throw new Error(`rebuild: ${file}: assinatura GZIP inválida`);
  }
  let source;
  try {
    source = zlib.gunzipSync(raw).toString('utf8');
  } catch (err) {
    throw new Error(`rebuild: exact app bundle gzip chunk ${file.slice(-6, -4)}: ${err.message}`);
  }
  if (!source.trim()) throw new Error(`rebuild: ${file}: conteúdo vazio`);
  sources.push(source);
  console.log(`OK ${file}: ${raw.length} gzip bytes -> ${source.length} JS chars`);
}

const bundle = sources.join('');
if (bundle.length < 100000) throw new Error(`rebuild: bundle suspeitamente pequeno (${bundle.length} chars)`);
new vm.Script(bundle, { filename: 'mutageneses-app.bundle.js' });
fs.writeFileSync('app.bundle.js', bundle, 'utf8');
console.log(`PASS: bundle final validado: ${bundle.length} caracteres.`);
