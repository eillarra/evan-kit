import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useSearch } from '@evan/composables/useSearch';

describe('useSearch (Evan Library)', () => {
  const mockItems = [
    { id: 1, title: 'Vue.js Conference', description: 'Frontend development' },
    { id: 2, title: 'React Summit', description: 'JavaScript framework' },
    { id: 3, title: 'Angular Connect', description: 'TypeScript and Angular' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with all items when no search query', () => {
    const search = useSearch(
      () => mockItems,
      (item) => [item.title, item.description],
    );

    expect(search.filteredItems.value).toEqual(mockItems);
    expect(search.hasActiveSearch.value).toBe(false);
  });

  it('should filter items based on search query', async () => {
    const search = useSearch(
      () => mockItems,
      (item) => [item.title, item.description],
    );

    search.searchQuery.value = 'vue';

    // Wait for debounced search
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(search.filteredItems.value).toHaveLength(1);
    expect(search.filteredItems.value[0].title).toBe('Vue.js Conference');
  });

  it('should handle multi-term search', async () => {
    const search = useSearch(
      () => mockItems,
      (item) => [item.title, item.description],
    );

    search.searchQuery.value = 'javascript framework';

    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(search.filteredItems.value).toHaveLength(1);
    expect(search.filteredItems.value[0].title).toBe('React Summit');
  });

  it('should respect minimum search length', () => {
    const search = useSearch(
      () => mockItems,
      (item) => [item.title, item.description],
      { minSearchLength: 3 },
    );

    search.searchQuery.value = 'vu';

    expect(search.filteredItems.value).toEqual(mockItems);
    expect(search.hasActiveSearch.value).toBe(false);
  });

  it('should clear search results', async () => {
    const search = useSearch(
      () => mockItems,
      (item) => [item.title, item.description],
    );

    search.searchQuery.value = 'vue';
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(search.filteredItems.value).toHaveLength(1);

    search.clearSearch();
    await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for reactive updates

    expect(search.searchQuery.value).toBe('');
    expect(search.filteredItems.value).toEqual(mockItems);
  });

  it('should handle case sensitivity option', async () => {
    const search = useSearch(
      () => mockItems,
      (item) => [item.title, item.description],
      { caseSensitive: true },
    );

    search.searchQuery.value = 'VUE';
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(search.filteredItems.value).toHaveLength(0);

    search.searchQuery.value = 'Vue';
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(search.filteredItems.value).toHaveLength(1);
  });
});
