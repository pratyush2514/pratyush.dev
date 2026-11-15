"use client";

import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }
    const data = (await res?.json().catch(() => null)) as { error?: string } | null;
    setError(data?.error ?? "Could not reach the server.");
    setPassword("");
    setBusy(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-border bg-bg/80 p-8 backdrop-blur-xl">
        <div className="mb-8 flex size-11 items-center justify-center rounded-full border border-border">
          <Lock size={16} aria-hidden="true" />
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
          pratyush.dev / admin
        </span>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-text-secondary">Only the owner of this site can continue.</p>

        <label htmlFor="password" className="mt-8 block text-sm font-medium">
          Password
        </label>
        <div className="relative mt-2">
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 pr-12 text-[15px] outline-none transition-colors focus:border-text-tertiary"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-text-tertiary hover:text-text"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && (
          <p id="login-error" role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-text py-3 text-sm font-medium text-bg transition-opacity disabled:opacity-50"
        >
          {busy ? "Checking…" : "Continue"} {!busy && <ArrowRight size={15} />}
        </button>
      </form>
    </main>
  );
}
