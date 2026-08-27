import { writable } from 'svelte/store';
import { getIdTokenResult } from 'firebase/auth';
import { authUser } from './auth';

function createIsAdminStore() {
    // undefined = not yet checked (still resolving auth state or the token claim)
    const { subscribe, set } = writable<boolean | undefined>(undefined);

    authUser.subscribe((user) => {
        if (user === undefined) return;
        if (!user) {
            set(false);
            return;
        }
        // Force-refresh so a claim granted moments ago (via `npm run set-admin`) is picked up without re-login
        getIdTokenResult(user, true).then((token) => set(token.claims.admin === true));
    });

    return { subscribe };
}

// True once we've confirmed the signed-in user has the "admin" custom claim
export const isAdmin = createIsAdminStore();
