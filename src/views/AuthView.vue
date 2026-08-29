<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { useAuthStore } from '@/stores';
import { router } from '@/helpers';

const route = useRoute();
const authStore = useAuthStore();
const error = ref(null);

onMounted(async () => {
    const { access_token, refresh_token } = route.query;
    if (!access_token) {
        error.value = 'The login link carried no token.';
        return;
    }
    try {
        const me = await authStore.startSession({ access_token, refresh_token });
        router.push(me.role === 'admin' ? (authStore.returnUrl || '/') : '/profile');
    } catch (err) {
        error.value = err.message;
    }
});
</script>

<template>
    <v-container fluid class="pa-4 d-flex align-center justify-center" style="min-height: 80vh;">
        <v-card elevation="2" max-width="500" width="100%">
            <v-card-title class="bg-primary">
                <v-icon class="mr-2">mdi-discord</v-icon>
                Signing in
            </v-card-title>
            <v-card-text class="pt-6">
                <v-alert v-if="error" type="error" variant="tonal" border="start">{{ error }}</v-alert>
                <div v-else class="d-flex align-center">
                    <v-progress-circular indeterminate size="24" class="mr-3" />
                    Checking your Discord membership...
                </div>
                <v-btn v-if="error" to="/login" color="primary" variant="text" class="mt-4">Back to login</v-btn>
            </v-card-text>
        </v-card>
    </v-container>
</template>
