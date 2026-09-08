const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');

initializeApp();
const db = getFirestore();

// A user must have been offline (see startPresenceHeartbeat) this long before we notify
// them, so a still-open app never gets an interrupting push for something it already
// shows live via Firestore listeners.
const OFFLINE_THRESHOLD_MS = 5 * 60_000;

// New matches/messages just flag the recipient here instead of sending a push right away -
// sendPendingNotifications() is what actually notifies, once per flag, so any number of
// matches/messages that arrive while offline still collapse into a single push each.
exports.onMatchCreated = onDocumentCreated('matches/{matchId}', async (event) => {
    const match = event.data?.data();
    if (!match?.userIds || match.userIds.length !== 2) return;

    await Promise.all(
        match.userIds.map((uid) =>
            db.collection('users').doc(uid).set({ pendingMatch: true }, { merge: true })
        )
    );
    console.log(`onMatchCreated: flagged pendingMatch for ${match.userIds.join(', ')}`);
});

exports.onMessageCreated = onDocumentCreated(
    'chats/{matchId}/messages/{messageId}',
    async (event) => {
        const message = event.data?.data();
        if (!message) return;

        const matchSnap = await db.collection('matches').doc(event.params.matchId).get();
        const recipientUid = matchSnap.data()?.userIds?.find((uid) => uid !== message.senderId);
        if (!recipientUid) return;

        await db.collection('users').doc(recipientUid).set({ pendingMessage: true }, { merge: true });
        console.log(`onMessageCreated: flagged pendingMessage for ${recipientUid}`);
    }
);

// Sends one data-only push to every token on file for a user and prunes any tokens FCM
// reports as invalid/unregistered. No top-level "notification" field: that would make the
// browser auto-display it in addition to our service worker's onBackgroundMessage handler.
async function push(userRef, tokens, title, body) {
    const response = await getMessaging().sendEachForMulticast({
        tokens,
        data: { title, body, url: '/matches' }
    });
    console.log(
        `push(${userRef.id}): "${title}" to ${tokens.length} token(s), ${response.successCount} succeeded, ${response.failureCount} failed`
    );

    const staleTokens = response.responses
        .map((result, i) => (result.success ? null : tokens[i]))
        .filter((token) => token !== null);
    if (staleTokens.length) {
        await userRef.update({ fcmTokens: FieldValue.arrayRemove(...staleTokens) });
    }
}

// Runs every 5 minutes (matching OFFLINE_THRESHOLD_MS, so there's no point checking more
// often): any user flagged pendingMatch/pendingMessage who's been offline for
// OFFLINE_THRESHOLD_MS gets exactly one push per flag, then the flag clears - so it doesn't
// matter if 1 or 100 matches/messages arrived in the meantime, each category still only
// ever produces a single "New match!" / "You have new messages" notification.
// Pinned to the same region as the Firestore-triggered functions (europe-west1, where the
// database itself lives) so container images don't spread into a second region.
exports.sendPendingNotifications = onSchedule({ schedule: 'every 5 minutes', region: 'europe-west1' }, async () => {
    const cutoff = new Date(Date.now() - OFFLINE_THRESHOLD_MS);

    const [matchSnap, messageSnap] = await Promise.all([
        db.collection('users').where('pendingMatch', '==', true).where('lastActiveAt', '<=', cutoff).get(),
        db.collection('users').where('pendingMessage', '==', true).where('lastActiveAt', '<=', cutoff).get()
    ]);
    console.log(
        `sendPendingNotifications: ${matchSnap.size} pending match(es), ${messageSnap.size} pending message(s) offline since before ${cutoff.toISOString()}`
    );

    await Promise.all([
        ...matchSnap.docs.map(async (userDoc) => {
            await userDoc.ref.update({ pendingMatch: FieldValue.delete() });
            const tokens = userDoc.data().fcmTokens;
            if (tokens?.length) await push(userDoc.ref, tokens, 'New match! 🎉', "Tap to see who you've matched with.");
        }),
        ...messageSnap.docs.map(async (userDoc) => {
            await userDoc.ref.update({ pendingMessage: FieldValue.delete() });
            const tokens = userDoc.data().fcmTokens;
            if (tokens?.length) await push(userDoc.ref, tokens, 'You have new messages', 'Tap to open your chats.');
        })
    ]);
});

// A real "pass" swipe older than this reappears in Discover automatically - gives profiles a
// second chance over time instead of being hidden forever, without wiping recent passes.
const DISLIKE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

// Runs daily across every user's swipes/{uid}/sent subcollection (collectionGroup reaches all
// of them at once, since a client can only ever write its own via firestore.rules, and no
// parent doc needs to exist at swipes/{uid} for this to see the subcollection). No `where`
// filter is used, so this never needs a composite/collection-group index - filtering happens
// in memory instead, which is cheap at this app's current swipe volume.
exports.resetStaleDislikes = onSchedule(
    { schedule: '0 3 * * *', timeZone: 'Europe/Madrid', region: 'europe-west1' },
    async () => {
        const passCutoff = Date.now() - DISLIKE_COOLDOWN_MS;
        const allSnap = await db.collectionGroup('sent').get();

        const toDelete = allSnap.docs.filter((d) => {
            const data = d.data();
            // Real 'pass' swipes only clear once stale, so recent passes and existing likes/matches
            // are never touched.
            if (data.direction === 'pass') return (data.timestamp?.toMillis?.() ?? 0) <= passCutoff;
            // Fake seed profiles ("fake_<name>", see scripts/seed.cjs) never like back, so liking one
            // only ever hides it from the swiper's own feed - there's no match/conversation to lose,
            // so these clear immediately instead of waiting out the cooldown.
            if (data.direction === 'like') return d.id.startsWith('fake_');
            return false;
        });

        // Firestore batches cap at 500 writes, so large result sets are chunked across multiple batches.
        for (let i = 0; i < toDelete.length; i += 500) {
            const batch = db.batch();
            toDelete.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
            await batch.commit();
        }
        console.log(`resetStaleDislikes: cleared ${toDelete.length} swipe(s) (stale real passes + liked fake profiles)`);
    }
);

