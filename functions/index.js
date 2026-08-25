const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');

initializeApp();
const db = getFirestore();

// A heartbeat older than this means the user is considered offline (see startPresenceHeartbeat).
// Pushes for matches/messages are only sent once the recipient has been offline this long.
const OFFLINE_THRESHOLD_MS = 2 * 60_000;

// Sends to every token on file for `uid` and prunes any FCM reports as invalid/unregistered.
// Skipped entirely if the recipient hasn't been offline long enough yet — they'll see the
// update live via Firestore listeners, so a push would just be a redundant interruption.
async function notifyUser(uid, { title, body, url }) {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const user = userSnap.data();
    const tokens = user?.fcmTokens;
    if (!tokens?.length) {
        console.log(`notifyUser(${uid}): skipped, no fcmTokens on file`);
        return;
    }

    const lastActiveMs = user?.lastActiveAt?.toMillis?.();
    if (lastActiveMs && Date.now() - lastActiveMs < OFFLINE_THRESHOLD_MS) {
        console.log(`notifyUser(${uid}): skipped, active ${Date.now() - lastActiveMs}ms ago`);
        return;
    }

    // Data-only payload: a top-level "notification" field makes the browser auto-display it
    // *in addition to* our service worker's onBackgroundMessage handler, showing it twice.
    const response = await getMessaging().sendEachForMulticast({
        tokens,
        data: { title, body: body ?? '', url: url ?? '/' }
    });
    console.log(
        `notifyUser(${uid}): sent title=${JSON.stringify(title)} body=${JSON.stringify(body)} to ${tokens.length} token(s), ${response.successCount} succeeded, ${response.failureCount} failed`
    );
    response.responses.forEach((result, i) => {
        if (!result.success) console.log(`notifyUser(${uid}): token ${i} failed: ${result.error?.message}`);
    });

    const staleTokens = response.responses
        .map((result, i) => (result.success ? null : tokens[i]))
        .filter((token) => token !== null);
    if (staleTokens.length) {
        await userRef.update({ fcmTokens: FieldValue.arrayRemove(...staleTokens) });
    }
}


exports.onMatchCreated = onDocumentCreated('matches/{matchId}', async (event) => {
    const match = event.data?.data();
    if (!match?.userIds || match.userIds.length !== 2) return;
    const [uid1, uid2] = match.userIds;

    const [user1Snap, user2Snap] = await Promise.all([
        db.collection('users').doc(uid1).get(),
        db.collection('users').doc(uid2).get()
    ]);
    const name1 = user1Snap.data()?.displayName ?? 'Someone';
    const name2 = user2Snap.data()?.displayName ?? 'Someone';

    await Promise.all([
        notifyUser(uid1, {
            title: "It's a match! 🎉",
            body: `You and ${name2} liked each other.`,
            url: '/matches'
        }),
        notifyUser(uid2, {
            title: "It's a match! 🎉",
            body: `You and ${name1} liked each other.`,
            url: '/matches'
        })
    ]);
});

exports.onMessageCreated = onDocumentCreated(
    'chats/{matchId}/messages/{messageId}',
    async (event) => {
        const message = event.data?.data();
        if (!message) return;
        const { matchId } = event.params;

        const matchSnap = await db.collection('matches').doc(matchId).get();
        const match = matchSnap.data();
        if (!match?.userIds) return;

        const recipientUid = match.userIds.find((uid) => uid !== message.senderId);
        if (!recipientUid) return;

        const senderSnap = await db.collection('users').doc(message.senderId).get();
        const senderName = senderSnap.data()?.displayName ?? 'Someone';

        await notifyUser(recipientUid, {
            title: senderName,
            body: message.text?.slice(0, 120) ?? 'Sent you a message',
            url: `/chat/${matchId}`
        });
    }
);
