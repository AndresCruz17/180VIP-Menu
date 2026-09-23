"use client";

import { use, useEffect, useMemo, useState } from "react";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditDrinkPage({ params }: PageProps) {
  const { id: drinkId } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [volume, setVolume] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => {
    return newImageFile ? URL.createObjectURL(newImageFile) : null;
  }, [newImageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    async function loadData() {
      const { data: categoryData } = await supabase.from("categories").select("id, name").order("name");
      setCategories((categoryData as CategoryOption[]) || []);

      const { data: drink } = await supabase
        .from("drinks")
        .select("id, name, category_id, price, brand, volume, description, is_available, is_featured, image_url")
        .eq("id", drinkId)
        .maybeSingle();

      if (drink) {
        setName(drink.name || "");
        setCategoryId(drink.category_id || "");
        setPrice(drink.price ? String(drink.price) : "");
        setBrand(drink.brand || "");
        setVolume(drink.volume || "");
        setDescription(drink.description || "");
        setIsAvailable(Boolean(drink.is_available));
        setIsFeatured(Boolean(drink.is_featured));
        setInitialImageUrl(drink.image_url || null);
        setExistingImageUrl(drink.image_url || null);
      }

      setLoading(false);
    }

    loadData();
  }, [drinkId, supabase]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    const file = event.target.files?.[0] || null;
    if (!file) {
      setNewImageFile(null);
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMessage(validation.error || "Archivo de imagen inválido.");
      event.target.value = "";
      setNewImageFile(null);
      return;
    }

    setNewImageFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    let uploadedPath: string | null = null;
    let finalImageUrl = existingImageUrl;

    try {
      if (newImageFile) {
        const uploaded = await uploadOptimizedImage(newImageFile, "drinks");
        uploadedPath = uploaded.storagePath;
        finalImageUrl = uploaded.publicUrl;
      }

      const { error } = await supabase
        .from("drinks")
        .update({
          name,
          slug: slugify(`${name}-${brand}-${volume}`),
          category_id: categoryId || null,
          price: price ? Number(price) : null,
          brand: brand || null,
          volume: volume || null,
          description: description || null,
          image_url: finalImageUrl,
          is_available: isAvailable,
          is_featured: isFeatured,
        })
        .eq("id", drinkId);

      if (error) throw error;

      if (newImageFile && initialImageUrl && initialImageUrl !== finalImageUrl) {
        await deleteStorageFiles(supabase, [initialImageUrl], "drinks");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (uploadedPath) await deleteStorageFiles(supabase, [uploadedPath], "drinks");
      const errorMessage = err instanceof Error ? err.message : "No se pudo actualizar la bebida.";
      setMessage(`Error: ${errorMessage}`);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-xs text-zinc-400">
        Cargando datos de la bebida...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col py-4 w-full max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <Link href="/admin/dashboard" className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>
          <h1 className="font-[var(--font-outfit)] text-2xl font-black uppercase tracking-wide text-white">
            Editar <span className="text-[#00e5ff]">Bebida</span>
          </h1>
        </div>
      </div>

      {message && <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">{message}</div>}

      <form onSubmit={handleSubmit} className="liquid-card rounded-3xl border border-white/10 p-6 space-y-5 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre de la Bebida *">
            <input required value={name} onChange={(event) => setName(event.target.value)} className="admin-input" />
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
            <input value={brand} onChange={(event) => setBrand(event.target.value)} className="admin-input" />
          </Field>
          <Field label="Presentación / Volumen">
            <input value={volume} onChange={(event) => setVolume(event.target.value)} className="admin-input" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Precio Oficial (COP) *">
              <input required type="number" value={price} onChange={(event) => setPrice(event.target.value)} className="admin-input text-lg font-black text-[#39ff14]" />
            </Field>
          </div>
        </div>

        <Field label="Sobre este Licor">
          <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="admin-input" />
        </Field>

        <div className="space-y-2">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Foto de la Botella</span>
          {(previewUrl || existingImageUrl) && (
            <div className="relative flex h-36 w-28 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-2">
              <Image src={previewUrl || existingImageUrl || ""} alt="Preview" fill sizes="112px" className="object-contain p-1" />
              {previewUrl && <span className="absolute bottom-1 rounded-full bg-[#ff1b7a] px-2 py-0.5 text-[9px] font-black uppercase text-white">Nueva</span>}
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-zinc-400 file:mr-3 file:rounded-xl file:border-0 file:bg-[#00e5ff]/20 file:px-3 file:py-2 file:text-[#00e5ff]" />
        </div>

        <div className="pt-2">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={isAvailable} onChange={(event) => setIsAvailable(event.target.checked)} className="h-4 w-4 accent-[#39ff14]" />
            <span className="text-xs font-bold text-zinc-200">Disponible para la venta</span>
          </label>
        </div>

        <button type="submit" disabled={saving} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00e5ff] to-indigo-600 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:brightness-110 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Sparkles className="h-4 w-4 text-black" />}
          {saving ? "Guardando Cambios..." : "Actualizar Bebida"}
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
