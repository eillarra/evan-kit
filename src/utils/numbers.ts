/**
 * Convert a number to Roman numerals
 * @param num - The number to convert (1-3999)
 * @returns Roman numeral representation
 */
export function toRomanNumeral(num: number): string {
  if (num < 1 || num > 3999) {
    throw new Error('Number must be between 1 and 3999');
  }

  const romanNumerals = [
    { value: 1000, symbol: 'M' },
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' },
  ];

  let result = '';
  let remaining = num;

  for (const { value, symbol } of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }

  return result;
}

/**
 * Format a decimal number with Belgian locale formatting
 * @param num - The number to format
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted number string with Belgian locale (dots for thousands, comma for decimal)
 */
export function formatDecimal(num: number, precision = 1): string {
  return num.toLocaleString('nl-BE', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}
