import React from 'react';
import { headers } from 'next/headers';
import { getDataSource } from '@/lib/data';

export default async function DevBanner() {
  // Server component: determine current origin and compare to NEXTAUTH_URL
  const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
  const hdrs = await headers();
  const host = hdrs.get('host') || '';
  const proto = hdrs.get('x-forwarded-proto') || 'http';
  const origin = `${proto}://${host}`;
  const dataSource = await getDataSource();

  const showOriginWarning = NEXTAUTH_URL && NEXTAUTH_URL !== origin;

  if (!showOriginWarning && dataSource === 'firestore') {
    return (
      <div style={{position: 'fixed', right: 12, bottom: 12, zIndex: 60}}>
        <div className="rounded-md px-3 py-1 text-xs bg-green-600 text-white">Data: Firestore</div>
      </div>
    );
  }

  return (
    <div style={{position: 'fixed', right: 12, bottom: 12, zIndex: 60}}>
      {showOriginWarning ? (
        <div className="rounded-md px-3 py-1 text-xs bg-yellow-600 text-white">
          NEXTAUTH_URL ({NEXTAUTH_URL}) does not match current origin ({origin}). Set NEXTAUTH_URL to avoid redirect issues in dev.
        </div>
      ) : (
        <div className="rounded-md px-3 py-1 text-xs bg-gray-600 text-white">Data: In-memory</div>
      )}
    </div>
  );
}
