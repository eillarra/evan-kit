import { ref, computed, watch } from 'vue';
import { debounce } from 'quasar';

export function useSearch<T>(
  items: () => T[],
  searchFields: (item: T) => string[],
  options: {
    debounceMs?: number;
    minSearchLength?: number;
    caseSensitive?: boolean;
  } = {},
) {
  const { debounceMs = 300, minSearchLength = 2, caseSensitive = false } = options;

  const searchQuery = ref('');
  const isSearching = ref(false);

  const normalizeText = (text: string) => {
    return caseSensitive ? text : text.toLowerCase();
  };

  const searchInText = (searchTerm: string, text: string): boolean => {
    const normalizedSearch = normalizeText(searchTerm);
    const normalizedText = normalizeText(text);

    return normalizedText.includes(normalizedSearch);
  };

  const performSearch = (query: string): T[] => {
    if (!query || query.length < minSearchLength) {
      return items();
    }

    const searchTerms = query.trim().split(/\s+/);

    return items().filter((item) => {
      const fieldsToSearch = searchFields(item);

      return searchTerms.every((term) => fieldsToSearch.some((field) => searchInText(term, field)));
    });
  };

  const debouncedSearch = debounce((query: string) => {
    isSearching.value = true;
    try {
      filteredItems.value = performSearch(query);
    } finally {
      isSearching.value = false;
    }
  }, debounceMs);

  const filteredItems = ref<T[]>(items());

  // Watch for search query changes
  watch(searchQuery, (newQuery) => {
    if (!newQuery || newQuery.length < minSearchLength) {
      filteredItems.value = items();
      isSearching.value = false;
    } else {
      debouncedSearch(newQuery);
    }
  });

  // Update results when source items change
  watch(items, () => {
    if (!searchQuery.value || searchQuery.value.length < minSearchLength) {
      filteredItems.value = items();
    } else {
      debouncedSearch(searchQuery.value);
    }
  });

  const clearSearch = () => {
    searchQuery.value = '';
  };

  const hasActiveSearch = computed(() => {
    return searchQuery.value.length >= minSearchLength;
  });

  const resultCount = computed(() => filteredItems.value.length);

  return {
    searchQuery,
    filteredItems,
    isSearching,
    hasActiveSearch,
    resultCount,
    clearSearch,
  };
}
