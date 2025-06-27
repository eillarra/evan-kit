<template>
  <div class="skeleton-container">
    <!-- Program Card Skeletons -->
    <div v-for="n in count" :key="n" class="q-mb-md">
      <q-card flat bordered square class="skeleton-card">
        <q-card-section>
          <div class="skeleton-line skeleton-track"></div>
        </q-card-section>
        <q-card-section class="q-py-none">
          <div class="skeleton-line skeleton-time"></div>
          <div class="skeleton-line skeleton-title q-mt-sm"></div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="skeleton-line skeleton-location"></div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number;
}

withDefaults(defineProps<Props>(), {
  count: 6,
});
</script>

<style scoped>
.skeleton-card {
  height: 140px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-track {
  width: 60%;
  height: 12px;
}

.skeleton-time {
  width: 40%;
  height: 14px;
}

.skeleton-title {
  width: 85%;
  height: 18px;
}

.skeleton-location {
  width: 50%;
  height: 12px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
