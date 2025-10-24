import { getDataBackend } from '@/lib/data';

export default async function DevStatus() {
  const backend = await getDataBackend();
  const label = backend === 'firestore' ? 'Firestore' : 'In-Memory';
  const color = backend === 'firestore' ? 'bg-emerald-600/20 text-emerald-700' : 'bg-amber-500/20 text-amber-700';
  return (
    <span
      title={`Data source: ${label}`}
      className={`hidden sm:inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color} border border-border`}
    >
      {label}
    </span>
  );
}
