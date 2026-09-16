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

export interface ValidationResult {
  valid: boolean;
  language: string;
  invalidCells: { row: number; col: string; value: string }[];
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
  const invalidCells: { row: number; col: string; value: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const term = String(row[termCol] || '').trim();
    const meaning = String(row[meaningCol] || '').trim();

    // Skip empty rows as they will be caught by required field validation if needed
    if (!term && !meaning) continue;

    if (term && !isStrictTeluguText(term)) {
      invalidCells.push({ row: i + 2, col: termCol, value: term });
    }

    if (meaning && !isStrictTeluguText(meaning)) {
      invalidCells.push({ row: i + 2, col: meaningCol, value: meaning });
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
