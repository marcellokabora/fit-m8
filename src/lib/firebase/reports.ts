import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase/client';
import type { ReportReason } from '$lib/types';

export async function submitReport(
    reporterId: string,
    reportedUid: string,
    matchId: string,
    reason: ReportReason,
    details?: string
) {
    await addDoc(collection(db, 'reports'), {
        reporterId,
        reportedUid,
        matchId,
        reason,
        details: details?.trim() || null,
        createdAt: serverTimestamp()
    });
}
