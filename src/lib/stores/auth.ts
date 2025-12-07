import { writable, derived } from 'svelte/store';
import type { AuthState } from '$lib/types';

const initialState: AuthState = {
  isAuthenticated: false,
  apiKey: null,
  role: null,
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    init: () => {
      if (typeof window !== 'undefined') {
        const apiKey = localStorage.getItem('apiKey');
        const role = localStorage.getItem('role') as AuthState['role'];
        console.log('[Auth] Init - apiKey:', apiKey ? 'exists' : 'null', 'role:', role);
        if (apiKey) {
          set({ isAuthenticated: true, apiKey, role });
        }
      }
    },

    login: async (apiKey: string, role: AuthState['role'] = 'public') => {
      console.log('[Auth] Login called with role:', role);
      if (typeof window !== 'undefined') {
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('role', role || 'public');
        console.log('[Auth] Saved to localStorage');
      }
      set({ isAuthenticated: true, apiKey, role });
      console.log('[Auth] State updated, isAuthenticated: true');
      // Small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('[Auth] Login complete');
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('apiKey');
        localStorage.removeItem('role');
      }
      set(initialState);
    },

    setRole: (role: AuthState['role']) => {
      if (typeof window !== 'undefined' && role) {
        localStorage.setItem('role', role);
      }
      update((state) => ({ ...state, role }));
    },
  };
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, ($auth) => $auth.isAuthenticated);
export const isAdmin = derived(auth, ($auth) => $auth.role === 'admin');
