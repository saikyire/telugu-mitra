/**
 * Checks if the text contains any alphabetic characters that are NOT in the Telugu Unicode block.
 * Uses a negative lookahead to find any letter (\p{L}) that is outside the Telugu range (\u0C00-\u0C7F).
 * Allows numbers, punctuation, spaces, and symbols.
 * 
 * @param text The string to validate
 * @returns true if the text is strictly Telugu (or only symbols/numbers), false if other scripts are found.
 */
export const isStrictTeluguText = (text: string): boolean => {
  if (!text) return true;
  // This regex matches any letter character that is NOT in the Telugu block.
  // If it finds a match, the text contains foreign alphabetic characters.
  const foreignLetterRegex = /(?=[^\u0C00-\u0C7F])\p{L}/u;
  return !foreignLetterRegex.test(text);
};

/**
 * Extracts exact non-Telugu words from the text for error reporting.
 */
export const extractNonTeluguWords = (text: string): string[] => {
  if (!text) return [];
  // Split the text into words by spaces
  const words = text.split(/\s+/);
  const foreignWords: string[] = [];
  const foreignLetterRegex = /(?=[^\u0C00-\u0C7F])\p{L}/u;
  
  for (const word of words) {
    if (foreignLetterRegex.test(word)) {
      // Strip trailing punctuation like ), ], . to make the extracted word cleaner
      const cleanWord = word.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
      if (cleanWord) {
        foreignWords.push(cleanWord);
      }
    }
  }
  
  return Array.from(new Set(foreignWords)); // Return unique words
};

export interface ValidationResult {
  valid: boolean;
  language: string;
  invalidCells: { row: number; col: string; value: string; fullRowText: string; detectedWords: string[] }[];
  message: string;
}

/**
 * Validates an entire dataset ensuring all Term and Meaning cells are strict Telugu.
 */
export const validateTeluguDataset = (
  rows: any[],
  termCol: string,
  meaningCol: string
): ValidationResult => {
  const invalidCells: { row: number; col: string; value: string; fullRowText: string; detectedWords: string[] }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const term = String(row[termCol] || '').trim();
    const meaning = String(row[meaningCol] || '').trim();

    // Skip empty rows as they will be caught by required field validation if needed
    if (!term && !meaning) continue;

    const fullRowText = `${term} | ${meaning}`;

    if (term && !isStrictTeluguText(term)) {
      invalidCells.push({ 
        row: i + 2, 
        col: termCol, 
        value: term, 
        fullRowText,
        detectedWords: extractNonTeluguWords(term)
      });
    } else if (meaning && !isStrictTeluguText(meaning)) {
      // Use else if so we don't log the same row twice if both are invalid (or we could log both)
      invalidCells.push({ 
        row: i + 2, 
        col: meaningCol, 
        value: meaning, 
        fullRowText,
        detectedWords: extractNonTeluguWords(meaning)
      });
    }
  }

  if (invalidCells.length > 0) {
    return {
      valid: false,
      language: "Non-Telugu",
      invalidCells,
      message: "TeluguMitra is built for Telugu — please upload a Telugu Excel file to keep your data clean and accurate."
    };
  }

  return {
    valid: true,
    language: "Telugu",
    invalidCells: [],
    message: "Telugu dataset validated successfully."
  };
};
