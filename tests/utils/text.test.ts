import { describe, it, expect } from 'vitest';
import { normalizeText, createSearchMatcher, searchInFields } from '../../src/utils/text';

describe('text utilities', () => {
  describe('normalizeText', () => {
    it('converts text to lowercase', () => {
      expect(normalizeText('Hello World')).toBe('hello world');
      expect(normalizeText('UPPERCASE')).toBe('uppercase');
    });

    it('removes diacritics from text', () => {
      expect(normalizeText('Café')).toBe('cafe');
      expect(normalizeText('Zürich')).toBe('zurich');
      expect(normalizeText('Señor')).toBe('senor');
      expect(normalizeText('naïve')).toBe('naive');
      expect(normalizeText('résumé')).toBe('resume');
    });

    it('handles combined lowercase and diacritics', () => {
      expect(normalizeText('Café in Zürich')).toBe('cafe in zurich');
      expect(normalizeText('CAFÉ IN ZÜRICH')).toBe('cafe in zurich');
    });

    it('handles empty strings', () => {
      expect(normalizeText('')).toBe('');
    });

    it('handles strings without diacritics', () => {
      expect(normalizeText('normal text')).toBe('normal text');
    });
  });

  describe('createSearchMatcher', () => {
    it('creates a matcher that returns true for matching text', () => {
      const matcher = createSearchMatcher('cafe');
      expect(matcher('Café in Paris')).toBe(true);
      expect(matcher('The best cafe ever')).toBe(true);
      expect(matcher('CAFE')).toBe(true);
    });

    it('creates a matcher that returns false for non-matching text', () => {
      const matcher = createSearchMatcher('pizza');
      expect(matcher('Café in Paris')).toBe(false);
      expect(matcher('Restaurant')).toBe(false);
    });

    it('creates a matcher that handles diacritics in both query and text', () => {
      const matcher = createSearchMatcher('café');
      expect(matcher('Cafe')).toBe(true);
      expect(matcher('CAFE')).toBe(true);
      expect(matcher('Café')).toBe(true);
    });

    it('creates a matcher that returns true for empty query', () => {
      const matcher = createSearchMatcher('');
      expect(matcher('Any text')).toBe(true);
      expect(matcher('')).toBe(true);
    });

    it('creates a matcher that returns true for whitespace-only query', () => {
      const matcher = createSearchMatcher('   ');
      expect(matcher('Any text')).toBe(true);
    });

    it('creates a matcher that is case-insensitive', () => {
      const matcher = createSearchMatcher('Hello');
      expect(matcher('hello world')).toBe(true);
      expect(matcher('HELLO WORLD')).toBe(true);
      expect(matcher('HeLLo WoRLd')).toBe(true);
    });
  });

  describe('searchInFields', () => {
    it('returns true when query is found in any field', () => {
      expect(searchInFields('cafe', 'Café Paris', 'Restaurant', 'Bar')).toBe(true);
      expect(searchInFields('restaurant', 'Café', 'Restaurant', 'Bar')).toBe(true);
    });

    it('returns false when query is not found in any field', () => {
      expect(searchInFields('pizza', 'Café', 'Burger', 'Pasta')).toBe(false);
    });

    it('handles null and undefined fields gracefully', () => {
      expect(searchInFields('cafe', 'Café', null, undefined, 'Bar')).toBe(true);
      expect(searchInFields('pizza', null, undefined, 'Bar')).toBe(false);
    });

    it('returns true for empty query', () => {
      expect(searchInFields('', 'Field 1', 'Field 2')).toBe(true);
      expect(searchInFields('', null, undefined)).toBe(true);
    });

    it('returns true for whitespace-only query', () => {
      expect(searchInFields('   ', 'Field 1', 'Field 2')).toBe(true);
    });

    it('handles diacritics in both query and fields', () => {
      expect(searchInFields('cafe', 'Café', 'Restaurant')).toBe(true);
      expect(searchInFields('café', 'Cafe', 'Restaurant')).toBe(true);
      expect(searchInFields('zurich', 'Zürich Office')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(searchInFields('CAFE', 'café', 'restaurant')).toBe(true);
      expect(searchInFields('cafe', 'CAFÉ', 'RESTAURANT')).toBe(true);
    });

    it('handles empty fields array', () => {
      expect(searchInFields('query')).toBe(false);
    });

    it('handles all null/undefined fields', () => {
      expect(searchInFields('query', null, undefined, null)).toBe(false);
    });

    it('requires full substring match, not just character presence', () => {
      expect(searchInFields('abc', 'a b c')).toBe(false);
      expect(searchInFields('abc', 'abc')).toBe(true);
      expect(searchInFields('abc', 'xabcy')).toBe(true);
    });
  });
});
