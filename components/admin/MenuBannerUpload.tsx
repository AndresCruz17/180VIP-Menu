"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadOptimizedImage, validateImageFile, deleteStorageFiles } from "@/lib/storage/image-utils";

interface MenuBannerUploadProps {
  currentBannerUrl: string | null;
}

export default function MenuBannerUpload({ currentBannerUrl }: MenuBannerUploadProps) {
  const supabase = useMemo(() => createClient(), []);
  const [bannerUrl, setBannerUrl] = useState<string | null>(currentBannerUrl);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) { alert(validation.error); return; }

    setLoading(true);
    try {
      const result = await uploadOptimizedImage(file, "drinks");
      const newUrl = result.publicUrl;

      // Borrar banner anterior
      if (bannerUrl) await deleteStorageFiles(supabase, [bannerUrl], "drinks");

      // Guardar en site_settings
      await supabase
        .from("site_settings")
        .upsert({ key: "menu_banner_url", value: newUrl });

      setBannerUrl(newUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al subir imagen";
      alert(msg);
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!bannerUrl) return;
    if (!window.confirm("Quitar el banner del menu?")) return;
    setLoading(true);
    try {
      await deleteStorageFiles(supabase, [bannerUrl], "drinks");
      await supabase
        .from("site_settings")
        .update({ value: null })
        .eq("key", "menu_banner_url");
      setBannerUrl(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="liquid-card rounded-2xl border border-white/10 overflow-hidden">
      {/* Preview o placeholder */}
      {bannerUrl ? (
        <div className="relative h-36 w-full">
          <Image src={bannerUrl} alt="Banner del menu" fill sizes="500px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Banner actual</span>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 hover:bg-rose-900 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="h-28 flex flex-col items-center justify-center border-b border-white/10 text-zinc-600 bg-white/[0.02]">
          <ImageIcon className="w-8 h-8 mb-1" />
          <p className="text-xs">Sin banner configurado</p>
        </div>
      )}

      {/* Boton subir */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Banner del Menu Digital
        </p>
        <label className={`flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
          loading ? "opacity-50 cursor-not-allowed" : "bg-[#ff1b7a]/15 border border-[#ff1b7a]/40 text-[#ff1b7a] hover:bg-[#ff1b7a]/25"
        }`}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {loading ? "Subiendo..." : "Subir imagen"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={loading}
            className="hidden"
          />
        </label>
        <p className="text-[10px] text-zinc-600 mt-2 text-center">Recomendado: 800×300px JPG/PNG</p>
      </div>
    </div>
  );
}