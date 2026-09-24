"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/seo/slugify";
import {
  deleteStorageFiles,
  uploadOptimizedImage,
  validateImageFile,
} from "@/lib/storage/image-utils";

interface CategoryOption {
  id: string;
  name: string;
}

export default function NewDrinkPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [volume, setVolume] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : null;
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      setCategories((data as CategoryOption[]) || []);
    }

    loadCategories();
  }, [supabase]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    const file = event.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMessage(validation.error || "Archivo de imagen inválido.");
      event.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    let uploadedPath: string | null = null;

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const uploaded = await uploadOptimizedImage(imageFile, "drinks");
        uploadedPath = uploaded.storagePath;
        imageUrl = uploaded.publicUrl;
      }

      const { error } = await supabase.from("drinks").insert({
        name,
        slug: slugify(`${name}-${brand}-${volume}`),
        category_id: categoryId || null,
        price: price ? Number(price) : null,
        brand: brand || null,
        volume: volume || null,
        description: description || null,
        image_url: imageUrl,
        is_available: isAvailable,
        is_featured: isFeatured,
      });

      if (error) throw error;

      await fetch('/api/admin/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/menu' }) }).catch(() => {});
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (uploadedPath) await deleteStorageFiles(supabase, [uploadedPath], "drinks");
      const errorMessage = err instanceof Error ? err.message : "No se pudo guardar la bebida.";
      setMessage(`Error: ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col py-4 w-full max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <Link href="/admin/dashboard" className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>
          <h1 className="font-[var(--font-outfit)] text-2xl font-black uppercase tracking-wide text-white">
            Agregar Nueva <span className="text-[#ff1b7a]">Bebida</span>
          </h1>
        </div>
      </div>

      {message && <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">{message}</div>}

      <form onSubmit={handleSubmit} className="liquid-card rounded-3xl border border-white/10 p-6 space-y-5 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre de la Bebida *">
            <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Aguardiente Amarillo" className="admin-input" />
          </Field>

          <Field label="Categoría *">
            <select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="admin-input bg-[#120f20]">
              <option value="">Selecciona categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Marca / Casa Licorera">
            <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Ej: Antioqueño" className="admin-input" />
          </Field>

          <Field label="Presentación / Volumen">
            <input value={volume} onChange={(event) => setVolume(event.target.value)} placeholder="Ej: 750ml" className="admin-input" />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Precio Oficial (COP) *">
              <input required type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Ej: 210000" className="admin-input text-lg font-black text-[#39ff14]" />
            </Field>
          </div>
        </div>

        <Field label="Sobre este Licor">
          <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Notas de cata, características especiales..." className="admin-input" />
        </Field>

        <div className="space-y-2">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Foto de la Botella o Cóctel</span>
          {previewUrl && (
            <div className="relative flex h-36 w-28 items-center justify-center overflow-hidden rounded-2xl border border-[#ff1b7a]/40 bg-white/5 p-2">
              <Image src={previewUrl} alt="Preview" fill sizes="112px" className="object-contain p-1" />
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-zinc-400 file:mr-3 file:rounded-xl file:border-0 file:bg-[#ff1b7a]/20 file:px-3 file:py-2 file:text-[#ff1b7a]" />
        </div>

        <div className="pt-2">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={isAvailable} onChange={(event) => setIsAvailable(event.target.checked)} className="h-4 w-4 accent-[#39ff14]" />
            <span className="text-xs font-bold text-zinc-200">Disponible para la venta</span>
          </label>
        </div>

        <button type="submit" disabled={loading} className="glow-magenta-btn mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black uppercase tracking-wider text-white disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Guardando..." : "Guardar y Publicar Bebida"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
