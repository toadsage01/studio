import { getDb } from './firebase-admin';

export type Activity = {
  id?: string;
  timestamp: string; // ISO
  event: string;
  entity: string;
  entityId?: string;
  userId?: string;
  details?: any;
};

const memoryLogs: Activity[] = [];

export async function logActivity(activity: Omit<Activity, 'timestamp' | 'id'> & { timestamp?: string }) {
  const entry: Activity = {
    timestamp: activity.timestamp ?? new Date().toISOString(),
    event: activity.event,
    entity: activity.entity,
    entityId: activity.entityId,
    userId: activity.userId,
    details: activity.details,
  };

  // Always keep an in-memory copy for local fallback/visibility
  memoryLogs.push(entry);

  // Write to Firestore if available
  const db = getDb();
  if (db) {
    try {
      await db.collection('activityLogs').add(entry);
    } catch (e) {
      // Non-fatal in dev
      // eslint-disable-next-line no-console
      console.warn('Failed to write activity log to Firestore:', (e as Error).message);
    }
  }
}

export async function getActivityLogs(limit = 50): Promise<Activity[]> {
  const db = getDb();
  if (db) {
    try {
      const snap = await db
        .collection('activityLogs')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Activity));
    } catch (e) {
      // Fall back to memory if query fails
    }
  }
  // Memory fallback (reverse chronological)
  return [...memoryLogs].reverse().slice(0, limit);
}
