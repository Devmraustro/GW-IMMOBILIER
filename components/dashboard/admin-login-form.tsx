'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

export function AdminLoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        setError(
          response.status === 503
            ? t.admin.authUnavailable
            : response.status === 401
              ? t.admin.authInvalid
              : response.status === 429
                ? t.admin.authRateLimited
                : t.admin.authError,
        );
        return;
      }

      const query = new URLSearchParams(window.location.search);
      const next = query.get('next');
      const destination =
        next && next.startsWith('/admin/') && !next.startsWith('//') ? next : '/admin';
      router.replace(destination);
    } catch {
      setError(t.admin.authError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">{t.admin.authTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{t.admin.authDescription}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="admin-email" className="block text-sm font-medium text-ink-800">
          {t.admin.authEmail}
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          inputMode="email"
          dir="ltr"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={320}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-left text-sm text-ink-950 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="admin-password" className="block text-sm font-medium text-ink-800">
          {t.admin.authPassword}
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          maxLength={1024}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-left text-sm text-ink-950 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-danger/20 bg-danger/5 px-3.5 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center rounded-xl bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? t.admin.authSubmitting : t.admin.authSubmit}
      </button>
    </form>
  );
}

export default AdminLoginForm;
