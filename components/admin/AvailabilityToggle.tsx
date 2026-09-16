"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";

interface AvailabilityToggleProps {
  id: string;
  initialAvailable: boolean;
}

export default function AvailabilityToggle({
  id,
  initialAvailable,
}: AvailabilityToggleProps) {
  const [available, setAvailable] = useState(initialAvailable);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;

    const nextState = !available;
    setLoading(true);

    try {
      const response = await fetch("/api/admin/toggle-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_available: nextState }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado.");
      }

      setAvailable(nextState);
    } catch {
      alert("No se pudo actualizar la disponibilidad. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
        available
          ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
          : "border border-rose-400/30 bg-rose-500/10 text-rose-300"
      } disabled:opacity-60`}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : available ? (
        <Check className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3" />
      )}
      {available ? "Disponible" : "Agotado"}
    </button>
  );
}
