/**
 * build-bible.mjs
 * Genera src/data/proverbs.json con una selección de versículos de calma,
 * consuelo y sabiduría a partir de "Santa Biblia libre para el mundo" (spablm),
 * traducción en dominio público: https://ebible.org/find/details.php?id=spablm
 *
 * Uso:
 *   1. Descarga https://ebible.org/Scriptures/spablm_usfm.zip y descomprímelo
 *      en ./bible-usfm (carpeta ignorada por git).
 *   2. node scripts/build-bible.mjs [ruta-a-carpeta-usfm]
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const USFM_DIR = path.resolve(process.argv[2] ?? './bible-usfm');
const OUTPUT   = path.resolve('./src/data/proverbs.json');

/**
 * CURATED BOOKS — Solo sabiduría pura y paz directa (código USFM → nombre).
 */
const CURATED_BOOKS = {
  PRO: 'Proverbios',
  ECC: 'Eclesiastés',
  PSA: 'Salmos',
  SNG: 'Cantares',
  PHP: 'Filipenses',
  JAS: 'Santiago',
  COL: 'Colosenses',
  GAL: 'Gálatas',
  EPH: 'Efesios',
  '1JN': '1 Juan',
  '1PE': '1 Pedro',
  '1TH': '1 Tesalonicenses',
  TIT: 'Tito',
};

// Marcadores USFM cuya línea completa no es texto de versículo (títulos, notas, etc.)
const NON_VERSE_LINE = /^\\(id|ide|h|toc\d|mt\d?|ms\d?|mr|s\d?|sr|r|d|sp|cl|cd|rem|imt\d?|is\d?|ip|iot|io\d?)\b/;

/** Quita notas, referencias cruzadas y marcas de palabra de un texto USFM. */
function cleanUsfm(text) {
  return text
    .replace(/\\f\s.*?\\f\*/g, ' ')
    .replace(/\\x\s.*?\\x\*/g, ' ')
    .replace(/\\\+?w\s+([^|\\]*)\|[^\\]*\\\+?w\*/g, '$1')
    .replace(/\\[a-z0-9+]+\*?/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?»)])/g, '$1')
    .trim();
}

/** Devuelve [{ chapter, verse, text }] de un archivo USFM. */
function parseUsfm(raw) {
  const verses = [];
  let chapter = 0;
  let current = null;
  const flush = () => {
    if (current) verses.push({ ...current, text: cleanUsfm(current.text) });
    current = null;
  };

  for (const line of raw.split(/\r?\n/)) {
    const chap = line.match(/^\\c\s+(\d+)/);
    if (chap) { flush(); chapter = Number(chap[1]); continue; }
    if (NON_VERSE_LINE.test(line)) continue;

    // Una línea puede contener uno o más "\v N" y texto de continuación (poesía)
    const parts = line.split(/\\v\s+(\d+)(?:-\d+)?\s*/);
    // parts = [antes, num1, texto1, num2, texto2, ...]
    if (current && parts[0]) current.text += ' ' + parts[0];
    for (let k = 1; k < parts.length; k += 2) {
      flush();
      current = { chapter, verse: Number(parts[k]), text: parts[k + 1] ?? '' };
    }
  }
  flush();
  return verses;
}

// Keywords that indicate a verse is NOT relaxing — used to filter edge cases
// within otherwise calm books (e.g., Job's angry speeches, Isaiah's war oracles)
const STRESS_KEYWORDS = [
  'matar', 'matará', 'mataron', 'matad', 'mataste',
  'destruir', 'destruirá', 'destrucción', 'destruidos',
  'guerra', 'guerras', 'batalla', 'batallas', 'combate',
  'sangre', 'sangres',
  'espada', 'espadas',
  'plaga', 'plagas',
  'ira de', 'furor', 'su ira', 'ardió la ira',
  'maldijo', 'maldición', 'maldiciones',
  'castigo', 'castiga', 'castigará',
  'fuego del señor', 'consumidos',
  'anatema',
  'muertos', 'cadáver', 'cadáveres',
];

function isRelaxing(text) {
  const lower = text.toLowerCase();
  return !STRESS_KEYWORDS.some(kw => lower.includes(kw));
}

// Solo se conservan versículos que hablan de calma, consuelo o sabiduría.
// Mantiene el JSON pequeño (la PWA lo precarga completo) y el oráculo enfocado.
const CALM_PATTERN = /\b(paz|descans|repos|consuel|confía|confiad|confianza|esperanza|espera en|ansi|afán|afan|no tem|temor no|sosieg|quiet|calma|gozo|alegr|sabidur|sabio|prudencia|paciencia|manso|mansedumbre|amor|misericordia|refugio|fortaleza|aliento|tranquil|apacible|bondad|gratitud|gracias)/;

function isCalming(text) {
  return CALM_PATTERN.test(text.toLowerCase());
}

const MIN_LEN = 25;
const MAX_LEN = 220;

const allVerses = [];
const skipped = { tooShort: 0, tooLong: 0, stressful: 0, offTopic: 0 };

const files = (await readdir(USFM_DIR)).filter(f => f.endsWith('.usfm')).sort();

let bookCount = 0;

for (const file of files) {
  // Nombre típico: 20-PSAspablm.usfm → código "PSA"
  const code = file.match(/^\d+-(\w{3})/)?.[1] ?? '';
  const key = CURATED_BOOKS[code] ? code : file.match(/^\d+-(1JN|1PE|1TH)/)?.[1];
  const bookName = CURATED_BOOKS[key];
  if (!bookName) continue; // skip non-calming books

  const verses = parseUsfm(await readFile(path.join(USFM_DIR, file), 'utf8'));

  let added = 0;
  for (const { chapter, verse, text } of verses) {
    if (text.length < MIN_LEN) { skipped.tooShort++; continue; }
    if (text.length > MAX_LEN) { skipped.tooLong++; continue; }
    if (!isRelaxing(text))     { skipped.stressful++; continue; }
    if (!isCalming(text))      { skipped.offTopic++; continue; }
    allVerses.push({ ref: `${bookName} ${chapter}:${verse}`, text });
    added++;
  }

  console.log(`✅ ${bookName.padEnd(20)} ${String(added).padStart(5)} versículos`);
  bookCount++;
}

await writeFile(OUTPUT, JSON.stringify(allVerses), 'utf8');

console.log(`
═══════════════════════════════════════════════
📖 Libros incluidos : ${bookCount}
✨ Versículos totales: ${allVerses.length}
───────────────────────────────────────────────
⏭️  Saltados (cortos)  : ${skipped.tooShort}
⏭️  Saltados (largos)  : ${skipped.tooLong}
⏭️  Filtrados (pesados): ${skipped.stressful}
⏭️  Fuera de tema      : ${skipped.offTopic}
═══════════════════════════════════════════════
💾 Guardado en: src/data/proverbs.json
`);
