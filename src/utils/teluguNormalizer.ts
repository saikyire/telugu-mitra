/**
 * Normalizes Telugu text to ensure consistent formatting for duplicate detection.
 * - Strips leading/trailing spaces
 * - Normalizes internal spacing around punctuation (e.g., `:` or `/`)
 * - Removes unnecessary trailing punctuation like periods if they don't add semantic value
 * - Normalizes zero-width spaces or other invisible unicode chars
 */
export function normalizeTeluguText(text: string): string {
  if (!text) return '';
  
  let normalized = text;
  
  // 1. Remove zero-width spaces and zero-width non-joiners
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // 2. Replace multiple whitespace with a single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // 3. Trim leading and trailing spaces
  normalized = normalized.trim();
  
  // 4. Remove unnecessary spaces around common delimiters
  normalized = normalized.replace(/\s*:\s*/g, ':');
  normalized = normalized.replace(/\s*\/\s*/g, '/');
  
  // 5. Remove trailing period if it exists (common in the example: "వశమునకు / అదుపునకు.")
  if (normalized.endsWith('.')) {
    normalized = normalized.slice(0, -1).trim();
  }
  
  return normalized;
}

/**
 * Checks if two pieces of Telugu text are formatting duplicates.
 */
export function isFormattingDuplicate(text1: string, text2: string): boolean {
  return normalizeTeluguText(text1) === normalizeTeluguText(text2);
}

/**
 * Normalizes a meaning specifically to help with "Same Term + Equivalent Meaning" detection.
 * Sorts slash-separated values to see if meanings are identical just ordered differently.
 * Example: "వశమునకు / అదుపునకు" vs "అదుపునకు / వశమునకు"
 */
export function normalizeAndSortMeaning(meaning: string): string {
  const normalized = normalizeTeluguText(meaning);
  const parts = normalized.split('/').map(p => p.trim()).filter(Boolean);
  parts.sort((a, b) => a.localeCompare(b, 'te')); // Sort using Telugu locale
  return parts.join(' / ');
}
