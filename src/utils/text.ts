/**
 * Normalizes text for case-insensitive, diacritic-insensitive comparison.
 * Converts to lowercase and removes diacritics (accents).
 *
 * @param text - The text to normalize
 * @returns Normalized text in lowercase without diacritics
 *
 * @example
 * normalizeText('Café') // 'cafe'
 * normalizeText('Zürich') // 'zurich'
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Creates a search matcher function for a given query.
 * The matcher performs case-insensitive and diacritic-insensitive matching.
 *
 * @param searchQuery - The search query to match against
 * @returns A function that checks if text matches the query
 *
 * @example
 * const matcher = createSearchMatcher('cafe');
 * matcher('Café in Paris') // true
 * matcher('Restaurant') // false
 */
export function createSearchMatcher(searchQuery: string): (text: string) => boolean {
  const normalizedQuery = normalizeText(searchQuery);

  return (text: string): boolean => {
    if (!searchQuery.trim()) return true;
    return normalizeText(text).includes(normalizedQuery);
  };
}

/**
 * Searches for a query string across multiple text fields.
 * Returns true if the query is found in any of the provided fields.
 * Handles null/undefined fields gracefully.
 *
 * @param searchQuery - The search query
 * @param fields - Variable number of text fields to search in
 * @returns True if query is found in any field, false otherwise
 *
 * @example
 * searchInFields('cafe', 'Café Paris', 'Restaurant', null) // true
 * searchInFields('pizza', 'Café', 'Burger') // false
 */
export function searchInFields(searchQuery: string, ...fields: (string | undefined | null)[]): boolean {
  if (!searchQuery.trim()) return true;

  const matcher = createSearchMatcher(searchQuery);

  return fields.some((field) => {
    if (!field) return false;
    return matcher(field);
  });
}
