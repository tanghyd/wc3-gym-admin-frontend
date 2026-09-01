import { defineStore } from 'pinia';
import { jwtDecode } from "jwt-decode";

import { fetchWrapper, router } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: JSON.parse(localStorage.getItem('user')),
        returnUrl: null
    }),
    actions: {
        async login(token) {
            const user = await fetchWrapper.post(`${backendUrl}/login`, { token: token });
           // update pinia state
            this.user = user;

            // store user details and jwt in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));

            // redirect to previous url or default to home page
            router.push(this.returnUrl || '/');
        },
        async refresh(token) {
            const user = await fetchWrapper.post(`${backendUrl}/refresh`, { access_token: token });
            // update pinia state
            this.user.access_token = user.access_token;

            // store user details and jwt in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));
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
            localStorage.removeItem('user');
            router.push('/login');
        }
    }
});
