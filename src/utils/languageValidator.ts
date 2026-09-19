export interface ValidationResult {
  valid: boolean;
  message: string;
}

/**
 * Validates an entire dataset to ensure it is primarily Telugu.
 * We require at least 30% of the rows to contain at least one Telugu character.
 * This allows English words inside otherwise valid Telugu records, 
 * but safely rejects completely non-Telugu files (e.g. English, Hindi, etc).
 */
export const validateTeluguDataset = (
  rows: any[],
  termCol: string,
  meaningCol: string
): ValidationResult => {
  let rowsWithTelugu = 0;
  let totalValidRows = 0;

  // Regex to match any Telugu character
  const teluguCharRegex = /[\u0C00-\u0C7F]/;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const term = String(row[termCol] || '').trim();
    const meaning = String(row[meaningCol] || '').trim();

    // Skip completely empty rows
    if (!term && !meaning) continue;
    
    totalValidRows++;

    // If either term or meaning contains a Telugu character, the row has meaningful Telugu content
    if (teluguCharRegex.test(term) || teluguCharRegex.test(meaning)) {
      rowsWithTelugu++;
    }
  }

  // If there are no valid rows, it's essentially an empty dataset
  if (totalValidRows === 0) {
    return {
      valid: false,
      message: "The uploaded file does not contain any data."
    };
  }

  // Calculate percentage of rows containing Telugu
  const teluguRatio = rowsWithTelugu / totalValidRows;

  // If less than 30% of rows contain Telugu, reject the dataset
  if (teluguRatio < 0.3) {
    return {
      valid: false,
      message: "TeluguMitra is built for Telugu — please upload a Telugu Excel file to keep your data clean and accurate."
    };
  }

  // Otherwise, it's considered a valid primarily-Telugu dataset
  return {
    valid: true,
    message: "Telugu dataset validated successfully."
  };
};
