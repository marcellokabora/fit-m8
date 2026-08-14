import { writable, derived } from 'svelte/store';
import { db } from '$lib/firebase/client';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Match } from '$lib/types';
import { authUser } from './auth';

function toMillis(val: unknown): number {
    if (!val) return 0;
    if (typeof val === 'object' && val !== null && 'toMillis' in val) {
        return (val as { toMillis: () => number }).toMillis();
    }
    if (val instanceof Date) return val.getTime();
    return 0;
}

function createUnreadMatchesStore() {
    const { subscribe, set } = writable<Set<string>>(new Set());
    let unsubscribeSnapshot: (() => void) | null = null;

    if (typeof window !== 'undefined') {
        authUser.subscribe((user) => {
            unsubscribeSnapshot?.();
            unsubscribeSnapshot = null;

            if (!user) {
                set(new Set());
                return;
            }

            const q = query(collection(db, 'matches'), where('userIds', 'array-contains', user.uid));
            unsubscribeSnapshot = onSnapshot(q, (snap) => {
                const unread = new Set<string>();
                for (const d of snap.docs) {
                    const match = d.data() as Omit<Match, 'id'>;
                    if (!match.lastMessageAt || match.lastMessageSenderId === user.uid) continue;
                    const readAt = toMillis(match.readBy?.[user.uid]);
                    if (readAt < toMillis(match.lastMessageAt)) unread.add(d.id);
                }
                set(unread);
            });
        });
    }

    return { subscribe };
}

// set of match IDs with an unread message from the other participant
export const unreadMatches = createUnreadMatchesStore();
export const unreadMatchCount = derived(unreadMatches, ($u) => $u.size);
