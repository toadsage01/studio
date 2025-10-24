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
  let db: any;
  try {
    const mod = await import('./firebase-admin');
    db = mod.getDb();
  } catch {
    db = undefined;
  }
  if (db) {
    try {
      await db.collection('activityLogs').add(entry);
    } catch (e) {
      // Non-fatal in dev
      console.warn('Failed to write activity log to Firestore:', (e as Error).message);
    }
  }
}

export async function getActivityLogs(limit = 50): Promise<Activity[]> {
  let db: any;
  try {
    const mod = await import('./firebase-admin');
    db = mod.getDb();
  } catch {
    db = undefined;
  }
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
