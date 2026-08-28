<!-- A column heading that carries a help note, and keeps its sort control when the table has one -->
<template>
  <span class="d-inline-flex align-center">
    <span :class="sortable ? 'sort-label' : ''" @click="sortable && $emit('sort')">
      {{ title }}
      <v-icon v-if="sortable && sortIcon" size="x-small" class="ml-1">{{ sortIcon }}</v-icon>
    </span>
    <span class="note-icon ml-1">
      <v-icon size="x-small">mdi-help-circle-outline</v-icon>
      <v-tooltip activator="parent" location="top" max-width="320">{{ note }}</v-tooltip>
    </span>
  </span>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  note: { type: String, required: true },
  // Vuetify hands the header slot its own sort control; a plain table has none
  sortable: { type: Boolean, default: false },
  sortIcon: { type: String, default: null },
});
defineEmits(['sort']);
</script>

<style scoped>
.sort-label {
  cursor: pointer;
}
.note-icon {
  cursor: help;
  opacity: 0.6;
}
.note-icon:hover {
  opacity: 1;
}
</style>
