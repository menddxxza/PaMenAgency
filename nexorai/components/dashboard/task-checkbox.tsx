'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle } from 'lucide-react';

export function TaskCheckbox({ taskId, done }: { taskId: string; done: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(done);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !checked;
    setChecked(next);
    setLoading(true);
    const res = await fetch(`/api/agent-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next ? 'done' : 'pending' }),
    });
    setLoading(false);
    if (!res.ok) {
      setChecked(!next);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={checked}
      aria-label={checked ? 'Marcar como pendiente' : 'Marcar como hecho'}
      className="mt-0.5 shrink-0 disabled:opacity-50"
    >
      {checked ? (
        <CheckCircle2 className="h-4 w-4 text-brand-400" />
      ) : (
        <Circle className="h-4 w-4 text-muted transition-colors hover:text-fg" />
      )}
    </button>
  );
}
