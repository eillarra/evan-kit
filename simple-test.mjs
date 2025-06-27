// Simple Node.js test to check module exports
import { dateRange } from './src/utils/dates.ts';
import { toRomanNumeral } from './src/utils/numbers.ts';
import { render } from './src/utils/markdown.ts';

console.log('Testing direct imports:');
console.log('dateRange:', typeof dateRange);
console.log('toRomanNumeral:', typeof toRomanNumeral);
console.log('render:', typeof render);

if (typeof dateRange === 'function') {
  console.log('dateRange test:', dateRange('2025-06-01', '2025-06-15'));
}

if (typeof toRomanNumeral === 'function') {
  console.log('toRomanNumeral test:', toRomanNumeral(42));
}

if (typeof render === 'function') {
  console.log('render test:', render('**bold**'));
}
