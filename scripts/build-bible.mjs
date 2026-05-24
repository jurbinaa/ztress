/**
 * build-bible.mjs
 * Generates src/data/proverbs.json with a curated selection of biblical books
 * focused on peace, calm, wisdom, and stress relief.
 * Run: node scripts/build-bible.mjs
 */

import { readdir, writeFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import path from 'path';

const BIBLE_DIR = path.resolve('./bible-json/procesados');
const OUTPUT    = path.resolve('./src/data/proverbs.json');

/**
 * CURATED BOOKS — Solo sabiduría pura y paz directa.
 * Únicamente libros cuyo propósito central es calmar, dar sabiduría o consolar.
 */
const CURATED_BOOKS = {
  // ── Sabiduría clásica ───────────────────────────────────────────────────────
  proverbios:  { name: 'Proverbios',   reason: 'Sabiduría práctica para la vida' },
  eclesiastes: { name: 'Eclesiastés',  reason: 'Presencia plena, perspectiva, calma' },
  salmos:      { name: 'Salmos',       reason: 'Meditación, consuelo, confianza' },
  cantares:    { name: 'Cantares',     reason: 'Belleza, amor, naturaleza' },

  // ── Epístolas de paz y sabiduría (NT) ──────────────────────────────────────
  filipenses:       { name: 'Filipenses',       reason: '"No estéis ansiosos por nada"' },
  santiago:         { name: 'Santiago',         reason: 'Sabiduría práctica, paciencia' },
  colosenses:       { name: 'Colosenses',       reason: 'Gratitud, paz de Cristo' },
  galatas:          { name: 'Gálatas',          reason: 'Amor, gozo, paz, paciencia, mansedumbre' },
  efesios:          { name: 'Efesios',          reason: 'Gracia, amor, unidad' },
  '1_juan':         { name: '1 Juan',           reason: '"El amor perfecto echa fuera el temor"' },
  '1_pedro':        { name: '1 Pedro',          reason: '"Echad toda vuestra ansiedad sobre él"' },
  '1_tesalonicenses': { name: '1 Tesalonicenses', reason: 'Dar gracias en todo, paz' },
  tito:             { name: 'Tito',             reason: 'Bondad, mansedumbre, gracia' },
};

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

const MIN_LEN = 25;
const MAX_LEN = 550;

const allVerses = [];
const skipped = { tooShort: 0, tooLong: 0, stressful: 0, notString: 0 };

const files = (await readdir(BIBLE_DIR)).filter(f => f.endsWith('.js')).sort();

let bookCount = 0;

for (const file of files) {
  const key = file.replace('.js', '');
  if (!CURATED_BOOKS[key]) continue; // skip non-calming books

  const { name: bookName } = CURATED_BOOKS[key];
  const url = pathToFileURL(path.join(BIBLE_DIR, file)).href;

  let chapters;
  try {
    const mod = await import(url);
    chapters = mod.default;
  } catch (e) {
    console.error(`❌ Error importing ${file}:`, e.message);
    continue;
  }

  if (!Array.isArray(chapters)) {
    console.warn(`⚠️  ${file} did not export an array, skipping.`);
    continue;
  }

  let added = 0;
  chapters.forEach((chapter, chIdx) => {
    if (!Array.isArray(chapter)) return;
    chapter.forEach((verse, vIdx) => {
      if (typeof verse !== 'string') { skipped.notString++; return; }
      const clean = verse.replace(/\/n/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean.length < MIN_LEN) { skipped.tooShort++; return; }
      if (clean.length > MAX_LEN) { skipped.tooLong++; return; }
      if (!isRelaxing(clean))     { skipped.stressful++; return; }
      allVerses.push({ ref: `${bookName} ${chIdx + 1}:${vIdx + 1}`, text: clean });
      added++;
    });
  });

  console.log(`✅ ${bookName.padEnd(20)} ${String(added).padStart(5)} versículos`);
  bookCount++;
}

await writeFile(OUTPUT, JSON.stringify(allVerses, null, 2), 'utf8');

console.log(`
═══════════════════════════════════════════════
📖 Libros incluidos : ${bookCount}
✨ Versículos totales: ${allVerses.length}
───────────────────────────────────────────────
⏭️  Saltados (cortos)  : ${skipped.tooShort}
⏭️  Saltados (largos)  : ${skipped.tooLong}
⏭️  Filtrados (pesados): ${skipped.stressful}
═══════════════════════════════════════════════
💾 Guardado en: src/data/proverbs.json
`);
