# evan-kit

[![github-tests-badge]][github-tests]
[![license-badge]](LICENSE)

Shared Vue 3 toolkit for Evan academic conference PWA applications. Provides reusable components, composables, stores, utilities, and TypeScript types for building conference apps that consume the [Evan API](https://evan.ugent.be).

## Installation

Add as a git submodule to your Quasar/Vue PWA project:

```bash
git submodule add https://github.com/eillarra/evan-kit.git evan-kit
git submodule update --init --recursive
```

### Configuration

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "paths": {
      "@evan/*": ["./evan-kit/src/*"]
    }
  }
}
```

**vite.config.ts** (or quasar.config.ts):

```typescript
resolve: {
  alias: {
    '@evan': path.resolve(__dirname, './evan-kit/src'),
  },
}
```

## Usage

### Store

The `useEventStore` is the main data store for event, sessions, papers, and keynotes:

```typescript
import { useEventStore } from '@evan/stores/event';

const eventStore = useEventStore();
await eventStore.init('fpl2026');
await eventStore.fetchProgramData();
```

### Components

```vue
<script setup lang="ts">
import MarkedDiv from '@evan/components/MarkedDiv.vue';
</script>

<template>
  <marked-div :text="markdownContent" />
</template>
```

### Composables

```typescript
import { useFavorites } from '@evan/composables/useFavorites';
import { usePersonalCalendar } from '@evan/composables/usePersonalCalendar';
import { useSearch } from '@evan/composables/useSearch';
```

### Utilities

```typescript
import { formatImportantDate, dateRange } from '@evan/utils/dates';
import { toRomanNumeral } from '@evan/utils/numbers';
import { normalizeText, searchInFields } from '@evan/utils/text';
import { logger, initLogger } from '@evan/utils/logger';
```

### Types

```typescript
import type { EvanEvent, EvanSession, EvanPaper } from '@evan/types';
```

## Exports

### Store

- `useEventStore` - Central Pinia store for event data

### API

- `fetchEvent`, `fetchSessions`, `fetchPapers`, `fetchKeynotes` - API client functions
- `ApiError` - Error class for API failures

### Components

- `MarkedDiv` - Renders markdown with external link handling

### Composables

- `useFavorites` - LocalStorage-based favorites management
- `usePersonalCalendar` - Personal calendar from favorites
- `useProgramTemplate` - Program template rendering
- `usePWAInstall` - PWA installation prompt handling
- `useSearch` - Debounced search with text normalization
- `useSearchQuery` - URL-synced search query state

### Utilities

- **dates**: `dateRange`, `formatImportantDate`, `passedImportantDate`
- **logger**: `initLogger`, `logger` (Sentry integration)
- **markdown**: `render`
- **numbers**: `formatDecimal`, `toRomanNumeral`
- **text**: `createSearchMatcher`, `normalizeText`, `searchInFields`
- **program**: Session grouping, filtering, sorting utilities

### Types

`EvanEvent`, `EvanSession`, `EvanSubsession`, `EvanPaper`, `EvanKeynote`, `EvanTrack`, `EvanTopic`, `EvanVenue`, `EvanRoom`, `EvanContent`, `ImportantDate`

## Logger

The logger utility provides unified logging that works with Sentry in production:

```typescript
import { logger, initLogger } from '@evan/utils/logger';
import * as Sentry from '@sentry/vue';

// Initialize once in your app boot
initLogger(process.env.PROD ? Sentry : null, !!process.env.PROD);

// Use anywhere
logger.info('User action', { userId: 123 });
logger.error('Failed to load', { error: String(err) });
```

[github-tests]: https://github.com/eillarra/evan-kit/actions/workflows/tests.yml
[github-tests-badge]: https://github.com/eillarra/evan-kit/actions/workflows/tests.yml/badge.svg?branch=main
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
