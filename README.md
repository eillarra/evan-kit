# evan-kit

Vue 3 toolkit for Evan API conference applications

## Features

- 🧩 **Reusable Components** - SkeletonLoader and other UI components
- 🔗 **Composables** - useSearch, usePerformanceMonitor, and more
- 🏪 **Stores** - Pinia stores for event management
- 📱 **Quasar Ready** - Built with Quasar framework compatibility
- 🎯 **TypeScript** - Full TypeScript support

## Installation

```bash
npm install evan-kit
```

## Usage

```vue
<script setup>
import { SkeletonLoader } from 'evan-kit/components/SkeletonLoader.vue'
import { useSearch } from 'evan-kit/composables/useSearch'

const { searchQuery, searchResults, isSearching } = useSearch()
</script>

<template>
  <SkeletonLoader v-if="isSearching" :count="6" />
</template>
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

## Components

- **SkeletonLoader** - Animated loading skeletons for cards

## Composables

- **useSearch** - Debounced search functionality
- **usePerformanceMonitor** - Core Web Vitals monitoring

## Stores

- **event** - Event management with Pinia

## License

MIT
