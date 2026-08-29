import { defineStore } from 'pinia';
import { jwtDecode } from "jwt-decode";

import { fetchWrapper, router } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`

let refreshing = null;  // one in-flight refresh shared by every caller

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: JSON.parse(localStorage.getItem('user')),
        me: JSON.parse(localStorage.getItem('me')),
        returnUrl: null
    }),
    actions: {
        // Discord callback tokens: /me is read first so a rejected member sees the error, not a logout
        async startSession(tokens) {
            const me = await this.fetchMe(tokens.access_token);
            this.user = tokens;
            localStorage.setItem('user', JSON.stringify(tokens));
            return me;
        },
        async fetchMe(accessToken) {
            const response = await fetch(`${backendUrl}/me`, {
                headers: { Authorization: `Bearer ${accessToken || this.user?.access_token}` }
            });
            const body = await response.json().catch(() => null);
            if (!response.ok) throw new Error(body?.error || `Login failed (${response.status})`);

            this.me = body;
            localStorage.setItem('me', JSON.stringify(body));
            return body;
        },
        async refresh(token) {
            if (!refreshing) {
                refreshing = fetchWrapper.post(`${backendUrl}/refresh`, { access_token: token })
                    .then(user => {
                        // keep the refresh token when the route only re-mints the access token
                        this.user = { ...this.user, ...user };
                        localStorage.setItem('user', JSON.stringify(this.user));
                    })
                    .finally(() => { refreshing = null; });
            }
            return refreshing;
        },
        isTokenExpired(token) {
            if (!token) {
                return true;
            }
            const payload = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp && payload.exp < currentTime;
        },
        logout() {
            this.user = null;
            this.me = null;
            localStorage.removeItem('user');
            localStorage.removeItem('me');
            router.push('/login');
        }
    }
});
