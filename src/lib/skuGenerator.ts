import { ProductItem } from '../types';

/**
 * Known beauty category acronym mappings for clean, standardized SKU codes.
 */
const CATEGORY_MAP: Record<string, string> = {
  'LIP GLOSS': 'LG',
  'LIP LINER': 'LL',
  'LIP BALM': 'LB',
  'LIP CARE': 'LC',
  'LIP OIL': 'LO',
  'LIP SCRUB': 'LS',
  'LIP MASK': 'LM',
  'LIP TINT': 'LT',
  'LIPSTICK': 'LST',
  'SKINCARE': 'SKN',
  'BODY CARE': 'BC',
  'EYE CARE': 'EC',
  'HAIR CARE': 'HC',
  'COSMETICS': 'COS',
  'ACCESSORIES': 'ACC'
};

const STOP_WORDS = new Set([
  'AND', '&', 'THE', 'OF', 'WITH', 'FOR', 'BY', 'IN', 'ON', 'TO', 'A', 'AN', 'PLUS', 'OR'
]);

/**
 * Derives a standardized 2-3 character category prefix code.
 * e.g. "Lip Gloss" -> "LG", "Lip Liner" -> "LL", "Body Care" -> "BC", "Skincare" -> "SKN"
 */
export function getCategoryCode(category: string): string {
  const clean = (category || '').trim().toUpperCase();
  if (!clean) return 'GEN';

  if (CATEGORY_MAP[clean]) {
    return CATEGORY_MAP[clean];
  }

  // Multi-word category: take initials of words
  const words = clean
    .replace(/[^A-Z0-9\s_-]/g, ' ')
    .split(/[\s_-]+/)
    .filter(Boolean);

  if (words.length > 1) {
    const initials = words.map(w => w[0]).join('').slice(0, 3);
    if (initials.length >= 2) return initials;
  }

  // Single word: take first 3 alphanumeric characters
  const alphanumeric = clean.replace(/[^A-Z0-9]/g, '');
  return alphanumeric.slice(0, 3) || 'GEN';
}

/**
 * Derives an acronym or abbreviated code from the product name.
 * e.g. "Cherry Velvet Lip Tint" -> "CVLT"
 *      "Berry Glaze" -> "BEGL"
 *      "Hydra Glow Clear" -> "HGC"
 *      "Vanilla Honey Balm" -> "VHB"
 */
export function getNameCode(name: string): string {
  const clean = (name || '').trim().toUpperCase();
  if (!clean) return 'SKU';

  // Remove special characters, split into words
  const words = clean
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0 && !STOP_WORDS.has(w));

  if (words.length >= 3) {
    // 3 or more words: take first letter of each significant word (max 4 characters)
    return words.map(w => w[0]).slice(0, 4).join('');
  } else if (words.length === 2) {
    // 2 words: take first 2 letters of each word if >= 2 chars, else initials
    const w1 = words[0];
    const w2 = words[1];
    if (w1.length >= 2 && w2.length >= 2) {
      return `${w1.slice(0, 2)}${w2.slice(0, 2)}`;
    }
    return `${w1[0]}${w2[0]}`;
  } else if (words.length === 1) {
    // 1 word: take up to first 4 alphanumeric characters
    const w = words[0];
    return w.length <= 4 ? w : w.slice(0, 4);
  }

  return 'SKU';
}

/**
 * Finds the highest numeric sequence in existing products to calculate the next sequence index.
 */
export function getNextSequenceNumber(existingProducts: ProductItem[]): number {
  let highestNum = 0;

  existingProducts.forEach(prod => {
    // Extract numbers from code (e.g. VBG-01 -> 1, LG-CVT-09 -> 9)
    if (prod.code) {
      const matches = prod.code.match(/(\d+)/g);
      if (matches) {
        matches.forEach(m => {
          const num = parseInt(m, 10);
          if (!isNaN(num) && num > highestNum && num < 10000) {
            highestNum = num;
          }
        });
      }
    }

    // Also inspect prod.id (e.g. PRD-008 -> 8)
    if (prod.id) {
      const idMatches = prod.id.match(/(\d+)/g);
      if (idMatches) {
        idMatches.forEach(m => {
          const num = parseInt(m, 10);
          if (!isNaN(num) && num > highestNum && num < 10000) {
            highestNum = num;
          }
        });
      }
    }
  });

  return Math.max(highestNum + 1, existingProducts.length + 1);
}

/**
 * Formats a sequence number with leading zeros (at least 2 digits).
 */
function formatSequence(num: number): string {
  return num < 10 ? `0${num}` : String(num);
}

/**
 * Automatically generates a unique, consistent SKU code based on product name,
 * category selection, and existing inventory catalog items.
 *
 * Example:
 * Name: "Cherry Velvet Lip Tint", Category: "Lip Gloss" -> "LG-CVLT-09"
 * Name: "Ruby Wine Matte Liner", Category: "Lip Liner" -> "LL-RWML-09"
 *
 * @param name The product name string
 * @param category The product category string
 * @param existingProducts Array of existing products in the system
 * @param currentProductId Optional ID of current product if editing
 */
export function generateUniqueSku(
  name: string,
  category: string,
  existingProducts: ProductItem[] = [],
  currentProductId?: string
): string {
  const catCode = getCategoryCode(category);
  const nameCode = getNameCode(name);
  let seqNumber = getNextSequenceNumber(existingProducts);

  // Set of existing codes (excluding the product currently being edited)
  const existingCodes = new Set(
    existingProducts
      .filter(p => !currentProductId || p.id !== currentProductId)
      .map(p => (p.code || '').trim().toUpperCase())
  );

  let candidate = `${catCode}-${nameCode}-${formatSequence(seqNumber)}`;

  // Ensure absolute uniqueness across catalog
  while (existingCodes.has(candidate)) {
    seqNumber += 1;
    candidate = `${catCode}-${nameCode}-${formatSequence(seqNumber)}`;
  }

  return candidate;
}

/**
 * Validates and ensures that a provided SKU code is completely unique.
 * If there's an accidental collision with another product's SKU, resolves it with an incremental suffix.
 *
 * @param code The SKU code string to check
 * @param existingProducts Array of existing products
 * @param currentProductId Optional ID of product currently being edited
 */
export function ensureUniqueSku(
  code: string,
  existingProducts: ProductItem[] = [],
  currentProductId?: string
): string {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return generateUniqueSku('', 'General', existingProducts, currentProductId);
  }

  const existingCodes = new Set(
    existingProducts
      .filter(p => !currentProductId || p.id !== currentProductId)
      .map(p => (p.code || '').trim().toUpperCase())
  );

  if (!existingCodes.has(cleanCode)) {
    return cleanCode;
  }

  // If duplicate, append sequence or increment
  let counter = 2;
  let candidate = `${cleanCode}-${counter}`;
  while (existingCodes.has(candidate)) {
    counter += 1;
    candidate = `${cleanCode}-${counter}`;
  }

  return candidate;
}
