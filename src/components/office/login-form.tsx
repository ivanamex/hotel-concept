"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mark } from "@/components/site/logo";
import { Button, Field, Input } from "@/components/ui";
import { DEMO_LOGIN, useHotel, useHydrated } from "@/lib/store";

export function LoginForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useHotel((s) => s.officeUser);
  const signIn = useHotel((s) => s.signIn);
  const [email, setEmail] = useState(DEMO_LOGIN.email);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && user) router.replace("/office");
  }, [hydrated, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    await new Promise((r) => setTimeout(r, 500));
    if (signIn(email, password)) router.push("/office");
    else {
      setError("That email and password don’t match.");
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <div className="relative hidden bg-lake-deep lg:block">
        <div className="absolute inset-0 bg-[url('/images/lake/hero-lake.jpg')] bg-cover bg-center opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="inline-flex items-center gap-2.5"><Mark light /><span className="font-display text-xl font-semibold">Maison Vidy</span></Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky/80">Back office</p>
            <h1 className="mt-3 max-w-md font-display text-4xl font-semibold leading-tight">Ten rooms, one screen.</h1>
            <p className="mt-3 max-w-md text-sky/85">Reservations, the calendar, rates, guests and every message — in one place, for the whole team.</p>
          </div>
          <p className="text-xs text-sky/60">by 20°N</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={submit} className="form-lines w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 lg:hidden"><Mark /><span className="font-display text-lg font-semibold">Maison Vidy</span></Link>
          <h2 className="font-display text-2xl font-semibold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-slate">Staff access to the back office.</p>
          <div className="mt-6 space-y-4">
            <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></Field>
            <Field label="Password" error={error}>
              <div className="relative">
                <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="pr-11" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate hover:bg-ink/5" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink-soft"><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line accent-lake" /> Keep me signed in on this device</label>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
          </div>
          <div className="mt-6 rounded-md bg-mist p-3 text-xs text-lake">
            <p className="font-semibold">Demo access</p>
            <p className="mt-0.5">{DEMO_LOGIN.email} · password <span className="font-mono">{DEMO_LOGIN.password}</span></p>
          </div>
          <p className="mt-6 text-xs text-slate">Forgot your password? Ask the manager to reset it. <Link href="/" className="underline">Back to the website</Link>.</p>
        </form>
      </div>
    </div>
  );
}
