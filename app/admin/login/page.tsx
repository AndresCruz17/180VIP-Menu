"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("Esta cuenta no tiene permisos de administrador.");
    }
  }, [searchParams]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin} className="liquid-card rounded-3xl border border-white/10 p-6 space-y-5">
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
          {error}
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Correo
        </span>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-[#ff1b7a]">
          <Mail className="h-4 w-4 text-[#ff1b7a]" />
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            placeholder="admin@180vip.com"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Contraseña
        </span>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-[#ff1b7a]">
          <Lock className="h-4 w-4 text-[#00e5ff]" />
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            placeholder="••••••••"
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="glow-magenta-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Entrar al Panel
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex flex-1 flex-col justify-center max-w-md mx-auto w-full px-4 sm:px-6 pt-4 pb-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-4 h-28 w-28 drop-shadow-[0_0_25px_rgba(255,27,122,0.45)]">
          <Image src="/logo.png" alt="180 VIP" fill sizes="112px" className="object-contain" priority />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff1b7a]">
          Panel Administrativo
        </p>
        <h1 className="mt-2 font-[var(--font-outfit)] text-2xl font-black uppercase text-white">
          180° VIP
        </h1>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
