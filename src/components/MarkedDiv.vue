<template>
  <div v-if="hasContent" v-html="html" class="evan__marked"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { render } from '../utils/markdown';

const props = defineProps<{
  text: string | null | undefined;
}>();

const hasContent = computed<boolean>(() => {
  return props.text != null && props.text.trim().length > 0;
});

const html = computed<string>(() => {
  if (!hasContent.value) return '';
  return render(props.text as string) as string;
});
</script>
