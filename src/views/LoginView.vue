<template>
    <v-container fluid class="pa-4 d-flex align-center justify-center" style="min-height: 80vh;">
        <v-card elevation="2" max-width="500" width="100%">
            <v-card-title class="bg-primary">
                <v-icon class="mr-2">mdi-lock</v-icon>
                GNL Login
            </v-card-title>

            <v-card-text class="pt-6">
                <v-btn
                    color="primary"
                    variant="elevated"
                    block
                    size="large"
                    prepend-icon="mdi-discord"
                    @click="startDiscordLogin"
                >
                    Log in with Discord
                </v-btn>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
const startDiscordLogin = () => {
    window.location = `${import.meta.env.VITE_BACKEND_URL}/auth/discord/start`;
};
</script>
