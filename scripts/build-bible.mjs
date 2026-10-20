/**
 * build-bible.mjs
 * Genera src/data/versiculos-favoritos.json (Salmos y Proverbios) y
 * src/data/versiculos-resto.json (los otros 64 libros), sin filtros, a partir de
 * "Santa Biblia libre para el mundo" (spablm),
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
const DATA_DIR  = path.resolve('./src/data');

// Salmos y Proverbios van en su propio archivo: el Oráculo los carga primero y
// les da más probabilidad de aparecer. El resto se carga en segundo plano.
const FAVORITES = new Set(['Salmos', 'Proverbios']);

/** Los 66 libros del canon protestante (código USFM → nombre). */
const BOOKS = {
  GEN: 'Génesis', EXO: 'Éxodo', LEV: 'Levítico', NUM: 'Números', DEU: 'Deuteronomio',
  JOS: 'Josué', JDG: 'Jueces', RUT: 'Rut', '1SA': '1 Samuel', '2SA': '2 Samuel',
  '1KI': '1 Reyes', '2KI': '2 Reyes', '1CH': '1 Crónicas', '2CH': '2 Crónicas',
  EZR: 'Esdras', NEH: 'Nehemías', EST: 'Ester', JOB: 'Job', PSA: 'Salmos',
  PRO: 'Proverbios', ECC: 'Eclesiastés', SNG: 'Cantares', ISA: 'Isaías', JER: 'Jeremías',
  LAM: 'Lamentaciones', EZK: 'Ezequiel', DAN: 'Daniel', HOS: 'Oseas', JOL: 'Joel',
  AMO: 'Amós', OBA: 'Abdías', JON: 'Jonás', MIC: 'Miqueas', NAM: 'Nahúm',
  HAB: 'Habacuc', ZEP: 'Sofonías', HAG: 'Hageo', ZEC: 'Zacarías', MAL: 'Malaquías',
  MAT: 'Mateo', MRK: 'Marcos', LUK: 'Lucas', JHN: 'Juan', ACT: 'Hechos',
  ROM: 'Romanos', '1CO': '1 Corintios', '2CO': '2 Corintios', GAL: 'Gálatas',
  EPH: 'Efesios', PHP: 'Filipenses', COL: 'Colosenses', '1TH': '1 Tesalonicenses',
  '2TH': '2 Tesalonicenses', '1TI': '1 Timoteo', '2TI': '2 Timoteo', TIT: 'Tito',
  PHM: 'Filemón', HEB: 'Hebreos', JAS: 'Santiago', '1PE': '1 Pedro', '2PE': '2 Pedro',
  '1JN': '1 Juan', '2JN': '2 Juan', '3JN': '3 Juan', JUD: 'Judas', REV: 'Apocalipsis',
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

const favorites = [];
const rest = [];

const files = (await readdir(USFM_DIR)).filter(f => f.endsWith('.usfm')).sort();

let bookCount = 0;

for (const file of files) {
  // Nombre típico: 20-PSAspablm.usfm → código "PSA"
  const bookName = BOOKS[file.match(/^\d+-(\w{3})/)?.[1] ?? ''];
  if (!bookName) continue; // introducción y libros fuera del canon de 66

  const verses = parseUsfm(await readFile(path.join(USFM_DIR, file), 'utf8'));

  let added = 0;
  for (const { chapter, verse, text } of verses) {
    if (!text) continue; // versículo vacío (p. ej. omitido en esta traducción)
    (FAVORITES.has(bookName) ? favorites : rest).push({ ref: `${bookName} ${chapter}:${verse}`, text });
    added++;
  }

  console.log(`✅ ${bookName.padEnd(20)} ${String(added).padStart(5)} versículos`);
  bookCount++;
}

await writeFile(path.join(DATA_DIR, 'versiculos-favoritos.json'), JSON.stringify(favorites), 'utf8');
await writeFile(path.join(DATA_DIR, 'versiculos-resto.json'), JSON.stringify(rest), 'utf8');

console.log(`\n📖 Libros: ${bookCount} · ✨ Favoritos: ${favorites.length} · Resto: ${rest.length}\n💾 Guardado en: src/data/versiculos-*.json`);
