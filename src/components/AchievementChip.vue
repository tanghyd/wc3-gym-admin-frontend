<template>
  <v-chip v-if="badges.length" size="small" variant="outlined">
    {{ badges.length }} &middot; {{ points }} pts
    <v-tooltip activator="parent" location="top">
      <div v-for="badge in badges" :key="badge.id">{{ badge.name }} +{{ badge.points }}</div>
    </v-tooltip>
  </v-chip>
  <span v-else class="text-medium-emphasis">&mdash;</span>
</template>

<script setup>
import { computed } from 'vue';
import { achievementPoints } from '@/helpers/achievements';

const props = defineProps({
  badges: { type: Array, default: () => [] },
});

const points = computed(() => achievementPoints(props.badges));
</script>
