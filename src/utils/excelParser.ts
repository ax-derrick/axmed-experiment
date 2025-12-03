import * as XLSX from 'xlsx';

// Our field names for mapping
export const OUR_FIELDS = [
  { key: 'medicineName', label: 'Medicine Name' },
  { key: 'presentation', label: 'Presentation' },
  { key: 'dosage', label: 'Dosage' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'units', label: 'Units' },
  { key: 'sip', label: 'SIP Status' },
  { key: 'packagingNotes', label: 'Notes' },
];

// Common column name patterns for auto-matching
const COLUMN_PATTERNS: Record<string, string[]> = {
  medicineName: ['name', 'medicine', 'drug', 'product', 'item', 'medication'],
  presentation: ['form', 'type', 'presentation', 'formulation'],
  dosage: ['strength', 'dosage', 'dose', 'concentration'],
  quantity: ['qty', 'quantity', 'amount', 'count', 'number'],
  units: ['unit', 'units', 'pack', 'package', 'uom'],
  sip: ['sip', 'permit', 'import', 'status'],
  packagingNotes: ['note', 'notes', 'comment', 'comments', 'remarks'],
};

/**
 * Parse an Excel or CSV file and return headers and rows
 */
export async function parseExcelFile(file: File): Promise<{
  headers: string[];
  rows: Record<string, string>[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON with header option
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
        }) as unknown as string[][];

        if (jsonData.length === 0) {
          resolve({ headers: [], rows: [] });
          return;
        }

        // First row is headers
        const headers = jsonData[0].map((h) => String(h).trim());

        // Rest are data rows
        const rows = jsonData.slice(1).map((row) => {
          const rowObj: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index] !== undefined ? String(row[index]).trim() : '';
          });
          return rowObj;
        });

        // Filter out completely empty rows
        const nonEmptyRows = rows.filter((row) =>
          Object.values(row).some((val) => val !== '')
        );

        resolve({ headers, rows: nonEmptyRows });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Auto-match uploaded column headers to our fields
 */
export function autoMatchColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  headers.forEach((header) => {
    const headerLower = header.toLowerCase();

    // Check each of our fields for a pattern match
    for (const [fieldKey, patterns] of Object.entries(COLUMN_PATTERNS)) {
      if (patterns.some((pattern) => headerLower.includes(pattern))) {
        // Only set if not already mapped
        if (!Object.values(mapping).includes(fieldKey)) {
          mapping[header] = fieldKey;
          break;
        }
      }
    }
  });

  return mapping;
}

/**
 * Apply column mapping to transform uploaded rows to our format
 */
export function applyColumnMapping(
  rows: Record<string, string>[],
  mapping: Record<string, string>
): Record<string, string>[] {
  return rows.map((row) => {
    const mappedRow: Record<string, string> = {
      medicineName: '',
      presentation: '',
      dosage: '',
      quantity: '',
      units: '',
      sip: 'does_not_apply',
      packagingNotes: '',
    };

    // Apply mapping
    Object.entries(mapping).forEach(([uploadedCol, ourField]) => {
      if (ourField && row[uploadedCol] !== undefined) {
        mappedRow[ourField] = row[uploadedCol];
      }
    });

    return mappedRow;
  });
}
