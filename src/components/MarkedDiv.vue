<template>
  <div v-if="text" v-html="html" class="evan__marked"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { render } from '../utils/markdown';

const props = defineProps<{
  text: string;
}>();

const html = computed<string>(() => render(props.text) as string);
</script>
