<script setup>
import { storeToRefs } from 'pinia';

import { useAuthStore } from '@/stores';
import PlayerDashboardView from './PlayerDashboardView.vue';
import PublicSignupView from './PublicSignupView.vue';

const { me } = storeToRefs(useAuthStore());
</script>

<template>
    <!-- a member with no linked users row signs up before the dashboard has anything to show -->
    <PublicSignupView v-if="!me?.user" />
    <PlayerDashboardView v-else />
</template>
