import type { ActivityId, UserProfile } from './types';

export interface FakeEvent {
    id: string;
    activityId: ActivityId | string;
    role: 'hosted' | 'joined';
    date: Date;
}

// Tiny seeded PRNG (mulberry32) so the same profile always renders the same fake event
// history instead of a new random set on every page load/navigation.
function mulberry32(seed: number) {
    let state = seed | 0;
    return function random() {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
    return hash;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// There's no live-events backend yet, so this fakes a "created/participated in" history for a
// profile, derived deterministically from that profile's own sports/uid, newest first.
export function generateFakeEvents(profile: Pick<UserProfile, 'uid' | 'activities'>): FakeEvent[] {
    const activityIds = profile.activities?.map((a) => a.id) ?? [];
    if (!activityIds.length) return [];

    const random = mulberry32(hashString(profile.uid));
    const count = 4 + Math.floor(random() * 5); // 4-8 events
    const now = Date.now();

    let daysAgo = 1 + Math.floor(random() * 4);
    const events: FakeEvent[] = [];
    for (let i = 0; i < count; i++) {
        const activityId = activityIds[Math.floor(random() * activityIds.length)];
        events.push({
            id: `${profile.uid}-fake-event-${i}`,
            activityId,
            role: random() < 0.35 ? 'hosted' : 'joined',
            date: new Date(now - daysAgo * DAY_MS)
        });
        daysAgo += 2 + Math.floor(random() * 6);
    }
    return events;
}
