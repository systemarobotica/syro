#!/usr/bin/env node
/**
 * Extract EPUB content into MDX chapters, JSON data files, and images.
 * Run once: node scripts/extract-epub.mjs
 */

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, basename, extname } from 'path';
import * as cheerio from 'cheerio';

const EPUB_DIR = '/tmp/syro-epub/OEBPS';
const OUT_CHAPTERS = 'src/content/chapters/en';
const OUT_DATA = 'src/data';
const OUT_IMAGES = 'public/images';

// Ensure dirs
[OUT_CHAPTERS, OUT_DATA, OUT_IMAGES].forEach(d => mkdirSync(d, { recursive: true }));

// ---- IMAGE EXTRACTION ----
function extractImages() {
  const imgDir = join(EPUB_DIR, 'images');
  const files = readdirSync(imgDir);
  const imageMap = {};

  // Copy cover image
  const coverSrc = join(EPUB_DIR, 'f529905359c28acdafa3318d00cb458578977ccd_smallRaw.jpg');
  if (existsSync(coverSrc)) {
    copyFileSync(coverSrc, join(OUT_IMAGES, 'cover.jpg'));
  }

  files.forEach(f => {
    const src = join(imgDir, f);
    // Keep original names but also copy to public
    copyFileSync(src, join(OUT_IMAGES, f));
    imageMap[f] = f;
  });

  writeFileSync(join('scripts', 'image-map.json'), JSON.stringify(imageMap, null, 2));
  console.log(`Extracted ${files.length} images`);
  return imageMap;
}

// ---- XHTML TO MDX CONVERSION ----
function htmlToMdx($, imageMap) {
  let mdx = '';

  function processNode(el) {
    if (el.type === 'text') {
      return el.data || '';
    }

    if (el.type !== 'tag') return '';

    const $el = $(el);
    const tag = el.tagName;

    switch (tag) {
      case 'p': {
        const cls = $el.attr('class') || '';
        const inner = $el.children().toArray().map(c => processNode(c)).join('');
        const text = inner.trim();

        // Skip empty paragraphs and br spacers
        if (!text || text === '' || $el.html()?.trim() === '<br/>') return '\n';

        if (cls.includes('caption')) {
          return `*${text}*\n\n`;
        }

        return text + '\n\n';
      }

      case 'br':
        return '';

      case 'b':
      case 'strong': {
        const inner = $el.children().toArray().map(c => processNode(c)).join('') || $el.text();
        return `**${inner.trim()}**`;
      }

      case 'i':
      case 'em': {
        const inner = $el.children().toArray().map(c => processNode(c)).join('') || $el.text();
        return `*${inner.trim()}*`;
      }

      case 'span': {
        const cls = $el.attr('class') || '';
        const inner = $el.children().toArray().map(c => processNode(c)).join('') || $el.text();
        if (cls.includes('underline')) return `<u>${inner}</u>`;
        if (cls.includes('dropcap')) return inner;
        return inner;
      }

      case 'a': {
        const href = $el.attr('href') || '';
        const text = $el.text().trim();
        // Footnote references
        if (href.includes('#fn') || $el.find('sup').length) {
          const num = text.replace(/[^\d]/g, '');
          return `[^${num}]`;
        }
        return `[${text}](${href})`;
      }

      case 'sup': {
        const inner = $el.children().toArray().map(c => processNode(c)).join('') || $el.text();
        return inner;
      }

      case 'h1': {
        const cls = $el.attr('class') || '';
        const text = $el.text().trim();
        if (cls.includes('chapter-number') || cls.includes('part-number')) return ''; // handled in frontmatter
        if (cls.includes('chapter-title') || cls.includes('part-title')) return ''; // handled in frontmatter
        return `## ${text}\n\n`;
      }

      case 'h2':
        return `### ${$el.text().trim()}\n\n`;

      case 'h3':
        return `#### ${$el.text().trim()}\n\n`;

      case 'img': {
        const src = $el.attr('src') || '';
        const imgFile = basename(src);
        const alt = $el.attr('alt') || 'Figure';
        return `![${alt}](/images/${imgFile})\n\n`;
      }

      case 'figure': {
        let result = '';
        $el.children().toArray().forEach(child => {
          result += processNode(child);
        });
        return result;
      }

      case 'blockquote': {
        const inner = $el.children().toArray().map(c => processNode(c)).join('');
        const lines = inner.trim().split('\n').map(l => `> ${l}`).join('\n');
        return lines + '\n\n';
      }

      case 'ol': {
        let result = '\n';
        $el.children('li').each((i, li) => {
          const inner = $(li).children().toArray().map(c => processNode(c)).join('') || $(li).text();
          result += `${i + 1}. ${inner.trim()}\n`;
        });
        return result + '\n';
      }

      case 'ul': {
        let result = '\n';
        $el.children('li').each((_, li) => {
          const inner = $(li).children().toArray().map(c => processNode(c)).join('') || $(li).text();
          result += `- ${inner.trim()}\n`;
        });
        return result + '\n';
      }

      case 'li': {
        const inner = $el.children().toArray().map(c => processNode(c)).join('') || $el.text();
        return inner.trim();
      }

      case 'div': {
        const cls = $el.attr('class') || '';
        if (cls.includes('callout')) {
          const inner = $el.children().toArray().map(c => processNode(c)).join('');
          return `<CalloutBox>\n\n${inner.trim()}\n\n</CalloutBox>\n\n`;
        }
        // Process children for generic divs
        return $el.children().toArray().map(c => processNode(c)).join('');
      }

      case 'pre': {
        const code = $el.text();
        return '```\n' + code + '\n```\n\n';
      }

      default: {
        // Process children
        return $el.children().toArray().map(c => processNode(c)).join('');
      }
    }
  }

  return processNode;
}

// Reading order from spine
const chapterFiles = [
  { file: '0_cover.xhtml', slug: 'cover', title: 'Cover', order: 0, part: null, chapterNum: null },
  { file: '1_title-page.xhtml', slug: 'title-page', title: 'Title Page', order: 1, part: null, chapterNum: null },
  { file: '2_reedsy.xhtml', slug: 'publishing-info', title: 'Publishing Info', order: 2, part: null, chapterNum: null },
  { file: '3_reedsy.xhtml', slug: 'dedication', title: 'Dedication', order: 3, part: null, chapterNum: null },
  { file: '4_introduction.xhtml', slug: 'introduction', title: 'Introduction', order: 4, part: null, chapterNum: null },
  { file: '5_natura-robotica.xhtml', slug: 'natura-robotica', title: 'Natura Robotica', order: 5, part: 1, chapterNum: null },
  { file: '6_defining-a-robot.xhtml', slug: 'defining-a-robot', title: 'Defining a robot', order: 6, part: 1, chapterNum: 1 },
  { file: '7_robots-vs-machines.xhtml', slug: 'robots-vs-machines', title: 'Robots vs. machines', order: 7, part: 1, chapterNum: 2 },
  { file: '8_robots-vs-ai.xhtml', slug: 'robots-vs-ai', title: 'Robots vs. AI', order: 8, part: 1, chapterNum: 3 },
  { file: '9_robots-vs-humans.xhtml', slug: 'robots-vs-humans', title: 'Robots vs. humans', order: 9, part: 1, chapterNum: 4 },
  { file: '10_robots-vs-cyborgs.xhtml', slug: 'robots-vs-cyborgs', title: 'Robots vs. cyborgs', order: 10, part: 1, chapterNum: 5 },
  { file: '11_structura-robotica.xhtml', slug: 'structura-robotica', title: 'Structura Robotica', order: 11, part: 2, chapterNum: null },
  { file: '12_evolutionary-realms.xhtml', slug: 'evolutionary-realms', title: 'Evolutionary realms', order: 12, part: 2, chapterNum: 6 },
  { file: '13_principles-of-classi.xhtml', slug: 'principles-of-classification', title: 'Principles of classification', order: 13, part: 2, chapterNum: 7 },
  { file: '14_taxonomic-architectu.xhtml', slug: 'taxonomic-architecture', title: 'Taxonomic architecture', order: 14, part: 2, chapterNum: 8 },
  { file: '15_the-robot-taxonomy.xhtml', slug: 'the-robot-taxonomy', title: 'The Robot Taxonomy', order: 15, part: 2, chapterNum: 9 },
  { file: '16_classification-flowc.xhtml', slug: 'classification-flowchart', title: 'Classification flowchart', order: 16, part: 2, chapterNum: 10 },
  { file: '17_futura-robotica.xhtml', slug: 'futura-robotica', title: 'Futura Robotica', order: 17, part: 3, chapterNum: null },
  { file: '18_role-of-robots.xhtml', slug: 'role-of-robots', title: 'Role of robots', order: 18, part: 3, chapterNum: 11 },
  { file: '19_superintelligence.xhtml', slug: 'superintelligence', title: 'Superintelligence', order: 19, part: 3, chapterNum: 12 },
  { file: '20_continuity.xhtml', slug: 'continuity', title: 'Continuity', order: 20, part: 3, chapterNum: 13 },
  { file: '21_sentience.xhtml', slug: 'sentience', title: 'Sentience', order: 21, part: 3, chapterNum: 14 },
  { file: '22_test-for-sentience.xhtml', slug: 'test-for-sentience', title: 'Test for sentience', order: 22, part: 3, chapterNum: 15 },
  { file: '23_acknowledgements.xhtml', slug: 'acknowledgements', title: 'Acknowledgements', order: 23, part: null, chapterNum: null },
  { file: '24_notes.xhtml', slug: 'notes', title: 'Notes', order: 24, part: null, chapterNum: null },
  { file: '25_glossary.xhtml', slug: 'glossary', title: 'Glossary', order: 25, part: null, chapterNum: null },
  { file: '26_references.xhtml', slug: 'references', title: 'References', order: 26, part: null, chapterNum: null },
  { file: '27_reviews.xhtml', slug: 'reviews', title: 'Reviews', order: 27, part: null, chapterNum: null },
  { file: '28_about-the-author.xhtml', slug: 'about-the-author', title: 'About the Author', order: 28, part: null, chapterNum: null },
];

function extractChapters(imageMap) {
  const chaptersMetadata = [];

  for (const ch of chapterFiles) {
    const filepath = join(EPUB_DIR, ch.file);
    if (!existsSync(filepath)) {
      console.warn(`Skipping missing: ${ch.file}`);
      continue;
    }

    const html = readFileSync(filepath, 'utf-8');
    const $ = cheerio.load(html, { xmlMode: true });

    // Extract part info for part dividers
    const partNumber = $('h1.part-number').text().trim();
    const partTitle = $('h1.part-title').text().trim();
    const partSummary = $('.part-summary').text().trim();
    const chapterNumber = $('h1.chapter-number').text().trim();
    const chapterTitle = $('h1.chapter-title').text().trim();

    // Build the MDX content
    const processNode = htmlToMdx($, imageMap);

    let content = '';

    // For part dividers
    if (partNumber && partTitle) {
      const epigraph = $('.epigraph-container').text().trim();
      content = `<PartDivider number="${partNumber}" title="${partTitle}"${partSummary ? ` summary="${partSummary.replace(/"/g, '\\"')}"` : ''}${epigraph ? ` epigraph="${epigraph.replace(/"/g, '\\"')}"` : ''} />\n\n`;
    }

    // For regular chapters with chapter-content div
    const chapterContent = $('.chapter-content');
    if (chapterContent.length) {
      chapterContent.children().each((_, el) => {
        content += processNode(el);
      });
    } else {
      // Process body children directly (for cover, title page, etc.)
      $('body').children().each((_, el) => {
        const cls = $(el).attr('class') || '';
        if (cls.includes('chapter-heading')) return; // skip, in frontmatter
        content += processNode(el);
      });
    }

    // Clean up content
    content = content
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+/, '')
      .trim();

    // Build frontmatter
    const frontmatter = [
      '---',
      `title: "${(chapterTitle || partTitle || ch.title).replace(/"/g, '\\"')}"`,
      `slug: "${ch.slug}"`,
      `order: ${ch.order}`,
    ];
    if (ch.part !== null) frontmatter.push(`part: ${ch.part}`);
    if (ch.chapterNum !== null) frontmatter.push(`chapter: ${ch.chapterNum}`);
    if (partNumber) frontmatter.push(`partNumber: "${partNumber}"`);
    if (chapterNumber) frontmatter.push(`chapterNumber: "${chapterNumber}"`);
    frontmatter.push('---');

    const mdxContent = frontmatter.join('\n') + '\n\n' + content + '\n';

    const filename = `${String(ch.order).padStart(2, '0')}-${ch.slug}.mdx`;
    writeFileSync(join(OUT_CHAPTERS, filename), mdxContent);

    chaptersMetadata.push({
      id: ch.slug,
      title: chapterTitle || partTitle || ch.title,
      slug: ch.slug,
      order: ch.order,
      part: ch.part,
      chapter: ch.chapterNum,
      isPartDivider: !!(partNumber && partTitle),
      file: filename,
    });
  }

  writeFileSync(join(OUT_DATA, 'chapters.json'), JSON.stringify(chaptersMetadata, null, 2));
  console.log(`Extracted ${chaptersMetadata.length} chapters`);
}

// ---- GLOSSARY EXTRACTION ----
function extractGlossary() {
  const html = readFileSync(join(EPUB_DIR, '25_glossary.xhtml'), 'utf-8');
  const $ = cheerio.load(html, { xmlMode: true });

  const terms = [];

  $('p.no-indent').each((_, el) => {
    const $el = $(el);
    const bold = $el.find('b').first().text().trim().replace(/:?\s*$/, '');
    if (!bold) return;

    // Get full text and extract definition after the bold term
    const fullHtml = $el.html() || '';
    // The definition follows the </b> tag, with optional ": " separator
    const fullText = $el.text().trim();
    const colonIdx = fullText.indexOf(':');
    let definition = '';
    if (colonIdx > -1) {
      definition = fullText.substring(colonIdx + 1).trim();
    }

    if (bold && (definition || bold.toLowerCase().includes('see '))) {
      terms.push({
        term: bold.replace(/:$/, '').trim(),
        definition: definition || bold,
        letter: bold.charAt(0).toUpperCase(),
      });
    }
  });

  writeFileSync(join(OUT_DATA, 'glossary.json'), JSON.stringify(terms, null, 2));
  console.log(`Extracted ${terms.length} glossary terms`);
}

// ---- REFERENCES EXTRACTION ----
function extractReferences() {
  const html = readFileSync(join(EPUB_DIR, '26_references.xhtml'), 'utf-8');
  const $ = cheerio.load(html, { xmlMode: true });

  const refs = [];
  let currentRef = '';
  let refNum = 0;

  // References are in ordered lists
  $('ol li').each((_, el) => {
    refNum++;
    refs.push({
      number: refNum,
      citation: $(el).text().trim(),
    });
  });

  // Also check for individual paragraphs with numbers
  if (refs.length === 0) {
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      const match = text.match(/^(\d+)\.\s+(.+)/);
      if (match) {
        refs.push({
          number: parseInt(match[1]),
          citation: match[2].trim(),
        });
      }
    });
  }

  writeFileSync(join(OUT_DATA, 'references.json'), JSON.stringify(refs, null, 2));
  console.log(`Extracted ${refs.length} references`);
}

// ---- TAXONOMY EXTRACTION ----
function extractTaxonomy() {
  const taxonomy = {
    name: "Robotica",
    level: "realm",
    definition: "The realm of constructed, artificial intelligences, encompassing all forms of artificial material constructs that sense, decide and operate autonomously within the physical world.",
    children: [
      {
        name: "Androids",
        level: "type",
        definition: "Robots constructed to mimic humans, in appearance, likeness and abilities.",
        color: "#64748b",
        children: [
          {
            name: "Mechanoids",
            level: "scheme",
            definition: "Mechanical humanoid robots, constructed mainly from metallic or non-pliable materials.",
            examples: [
              { marque: "Boston Dynamics", model: "Atlas" },
              { marque: "Apptronik", model: "Apollo" },
              { marque: "Honda", model: "Asimo" },
              { marque: "Sanctuary AI", model: "Phoenix" },
              { marque: "Figure", model: "01" },
              { marque: "Unitree", model: "H1" },
              { marque: "Agility Robotics", model: "Digit" },
              { marque: "Tesla", model: "Optimus Gen 2" },
              { marque: "Cybot Galactica", model: "3PO Protocol Droid", fictional: true },
            ]
          },
          {
            name: "Synthoids",
            level: "scheme",
            definition: "Synthetic humanoid robots virtually indistinguishable from humans in appearance, with lifelike skin made from synthetic materials.",
            examples: [
              { marque: "Hanson Robotics", model: "Sophia" },
              { marque: "NTU", model: "Nadine" },
              { marque: "Geminoid", model: "HI" },
              { marque: "Geminoid", model: "DK" },
              { marque: "Unknown", model: "Soong-type Android", unit: "Data", fictional: true },
            ]
          },
          {
            name: "Plastoids",
            level: "scheme",
            definition: "Flexible humanoid robots made with pliable materials.",
            examples: [
              { marque: "1X", model: "NEO" },
            ]
          },
          {
            name: "Colossals",
            level: "scheme",
            definition: "Gigantic humanoid robots over 5 meters in size, constructed of any material.",
            examples: [
              { marque: "Gundam Factory", model: "RX-78F00" },
            ]
          }
        ]
      },
      {
        name: "Bionics",
        level: "type",
        definition: "Robots constructed to mimic non-human biological creatures, in appearance, likeness and abilities.",
        color: "#166534",
        children: [
          {
            name: "Zooids",
            level: "scheme",
            definition: "Biotica-inspired robots, with a likeness for existing known animals or insects, larger than 1mm in size.",
            examples: [
              { marque: "Boston Dynamics", model: "Spot" },
              { marque: "Unitree", model: "Go2" },
              { marque: "Festo", model: "BionicBird" },
            ]
          },
          {
            name: "Microbots",
            level: "scheme",
            definition: "Tiny biotica-inspired robots, with either a likeness for existing known animals or insects, or novel designforms smaller than 1mm in size.",
            examples: []
          },
          {
            name: "Nanobots",
            level: "scheme",
            definition: "Microscopic biotica-inspired robots, with either a likeness for existing known animals or insects, or novel designforms smaller than 1\u00b5m in size.",
            examples: []
          }
        ]
      },
      {
        name: "Vessels",
        level: "type",
        definition: "Robots designed for movement, transportation and exploration, across the physical planes of land, air, water, or space.",
        color: "#0d9488",
        children: [
          {
            name: "Autons",
            level: "scheme",
            definition: "Vehicular robots designed to traverse and operate over land.",
            examples: [
              { marque: "Robomart", model: "RM5 Robocourier" },
              { marque: "Waymo", model: "Jaguar I-PACE" },
              { marque: "Cruise", model: "Origin" },
              { marque: "Nuro", model: "R3" },
              { marque: "Starship Technologies", model: "Delivery Robot" },
            ]
          },
          {
            name: "Drones",
            level: "scheme",
            definition: "Aerial robots designed to traverse and operate in the air.",
            examples: [
              { marque: "DJI", model: "Mavic 3" },
              { marque: "Wing (Alphabet)", model: "Wing Delivery Drone" },
              { marque: "Zipline", model: "P2 Zip" },
            ]
          },
          {
            name: "Mariners",
            level: "scheme",
            definition: "Underwater robots designed to traverse and operate on or below water.",
            examples: [
              { marque: "Saildrone", model: "Explorer" },
            ]
          },
          {
            name: "Rovers",
            level: "scheme",
            definition: "Exploration robots designed to traverse and operate underground, in space or in extraterrestrial environments.",
            examples: [
              { marque: "NASA/JPL", model: "Perseverance" },
              { marque: "NASA/JPL", model: "Curiosity" },
            ]
          }
        ]
      },
      {
        name: "Automata",
        level: "type",
        definition: "Stationary robots or mobile robots that are meant to operate within a single contained, fixed, or controlled environment.",
        color: "#d97706",
        children: [
          {
            name: "Articulators",
            level: "scheme",
            definition: "Robotic arms, designed for precise manipulation and operation within fixed environments.",
            examples: [
              { marque: "KUKA", model: "KR 1000 Titan" },
              { marque: "ABB", model: "IRB 6700" },
              { marque: "Universal Robots", model: "UR5e" },
            ]
          },
          {
            name: "Mechatrons",
            level: "scheme",
            definition: "Large movable industrial robots weighing more than 200kg, designed for repetitive operation within a single fixed environment.",
            examples: [
              { marque: "FANUC", model: "M-2000iA" },
            ]
          },
          {
            name: "Terminals",
            level: "scheme",
            definition: "Stationary immobile robots, designed to operate within a fixed environment.",
            examples: [
              { marque: "Amazon", model: "Alexa Echo" },
            ]
          },
          {
            name: "Servons",
            level: "scheme",
            definition: "Service-oriented robots weighing less than 200kg, designed for interactive service within fixed environments.",
            examples: [
              { marque: "Bear Robotics", model: "Servi" },
              { marque: "SoftBank Robotics", model: "Pepper" },
            ]
          },
          {
            name: "Automatons",
            level: "scheme",
            definition: "Interactive robot companions or robot toys smaller than 1 meter, designed for companionship or operation within fixed environments.",
            examples: [
              { marque: "Sony", model: "Aibo" },
              { marque: "Anki", model: "Vector" },
            ]
          }
        ]
      },
      {
        name: "Megatech",
        level: "type",
        definition: "Massive robot megastructures over 1 million cubic meters in volume such as robot starships or planetary sized robots.",
        color: "#7c3aed",
        children: [
          {
            name: "Planetoids",
            level: "scheme",
            definition: "Planet-shaped robots over 1 million m\u00b3 in volume.",
            examples: [
              { marque: "Unknown", model: "Unicron", fictional: true },
            ]
          },
          {
            name: "Starships",
            level: "scheme",
            definition: "Large spaceship robots over 1 million m\u00b3 in volume designed to travel great distances.",
            examples: [
              { marque: "Unknown", model: "USP Sulaco", fictional: true },
            ]
          },
          {
            name: "Arcologies",
            level: "scheme",
            definition: "Very large robotic megastructures designed to either house inhabitants or to undertake exploration or scientific work well over 1 million m\u00b3 in volume.",
            examples: []
          }
        ]
      },
      {
        name: "Spectra",
        level: "type",
        definition: "Robots that challenge and transcend traditional physical boundaries, encompassing physical entities with ethereal, virtual, or shape-shifting qualities.",
        color: "#e11d48",
        children: [
          {
            name: "Virtuoids",
            level: "scheme",
            definition: "Virtual or holographic robot entities, within a physical housing.",
            examples: [
              { marque: "Unknown", model: "Emergency Medical Hologram", unit: "The Doctor", fictional: true },
            ]
          },
          {
            name: "Morphbots",
            level: "scheme",
            definition: "Shape-shifting robots.",
            examples: [
              { marque: "Unknown", model: "T-1000", fictional: true },
            ]
          },
          {
            name: "Ethereals",
            level: "scheme",
            definition: "Non-conventional or energy-based robotic entities that defy the current laws of physics.",
            examples: []
          }
        ]
      }
    ]
  };

  writeFileSync(join(OUT_DATA, 'taxonomy.json'), JSON.stringify(taxonomy, null, 2));
  console.log('Extracted taxonomy tree');
}

// ---- RUN ----
console.log('Starting EPUB extraction...');
const imageMap = extractImages();
extractChapters(imageMap);
extractGlossary();
extractReferences();
extractTaxonomy();
console.log('Done!');
