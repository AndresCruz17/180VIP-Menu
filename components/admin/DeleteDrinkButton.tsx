"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteStorageFiles } from "@/lib/storage/image-utils";

interface DeleteDrinkProps {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export default function DeleteDrinkButton({ id, name, imageUrl }: DeleteDrinkProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("drinks").delete().eq("id", id);
      if (error) throw error;

      if (imageUrl) {
        await deleteStorageFiles(supabase, [imageUrl], "drinks");
      }

      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ocurrió un error al eliminar.";
      alert(`Error al eliminar bebida: ${message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      title="Eliminar"
      className="rounded-lg border border-rose-900/60 bg-rose-950/20 p-1.5 text-rose-400 transition-colors hover:border-rose-500 hover:bg-rose-900/40 disabled:opacity-50"
    >
      {deleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
