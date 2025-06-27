# evan-kit

[![github-tests-badge]][github-tests]
[![license-badge]](LICENSE)

Shared Vue 3 component library for Evan academic conference applications.

## Installation

Add as a git submodule to your PWA project:

```bash
git submodule add https://github.com/eillarra/evan-kit.git evan-kit
git submodule update --init --recursive
```

### TypeScript configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@evan/*": ["./evan-kit/src/*"]
    }
  },
  "include": ["evan-kit/src/types/global.d.ts"]
}
```

### Vite configuration

Add to your `vite.config.ts`:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@evan': path.resolve(__dirname, './evan-kit/src'),
    },
  },
});
```

## Usage

### Global Types

Types are automatically available without imports:

```vue
<script setup lang="ts">
const event: EvanEvent = {};
const session: EvanSession = {};
</script>
```

### Components

```vue
<script setup lang="ts">
import MarkedDiv from 'evan-kit/components/MarkedDiv.vue';
</script>

<template>
  <MarkedDiv :text="markdownContent" />
</template>
```

### Utilities

```vue
<script setup lang="ts">
import { useSearch } from 'evan-kit/composables/useSearch';
import { formatImportantDate } from 'evan-kit/utils/dates';
import { toRomanNumeral } from 'evan-kit/utils/numbers';

const { searchQuery, searchResults } = useSearch();
</script>
```

## Available exports

### Components

- `MarkedDiv` - Renders markdown safely

### Composables

- `useSearch` - Debounced search functionality
- `useFavorites` - User favorites management
- `usePersonalCalendar` - Calendar management
- `useProgramTemplate` - Program helpers
- `usePWAInstall` - PWA installation prompts

### Utils

- **Dates**: `formatImportantDate`, `dateRange`, `passedImportantDate`
- **Numbers**: `toRomanNumeral`, `formatDecimal`
- **Markdown**: `render`
- **Program**: Session and program management utilities

### Types

Global types available: `EvanEvent`, `EvanSession`, `EvanSubsession`, `EvanPaper`, `EvanKeynote`, `EvanTrack`, `EvanVenue`, `EvanRoom`, `ImportantDate`

[github-tests]: https://github.com/eillarra/evan-kit/actions/workflows/tests.yml
[github-tests-badge]: https://github.com/eillarra/evan-kit/actions/workflows/tests.yml/badge.svg?branch=main
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
