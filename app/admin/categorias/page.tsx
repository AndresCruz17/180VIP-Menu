"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Edit2, Loader2, Plus, Tag, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/seo/slugify";
import {
  deleteStorageFiles,
  uploadOptimizedImage,
  validateImageFile,
} from "@/lib/storage/image-utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  description?: string | null;
}

export default function AdminCategoriasPage() {
  const supabase = useMemo(() => createClient(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const previewUrl = useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : null;
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchCategories = async () => {
    setFetching(true);
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, image_url, description")
      .order("name");
    setCategories((data as Category[]) || []);
    setFetching(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openNewSheet = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setImageFile(null);
    setSheetOpen(true);
  };

  const openEditSheet = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setImageFile(null);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = validateImageFile(file);
    if (!result.valid) { alert(result.error || "Archivo invalido"); return; }
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      let imageUrl: string | null = editingCategory?.image_url ?? null;

      if (imageFile) {
        const uploadResult = await uploadOptimizedImage(imageFile, "categories");
        imageUrl = uploadResult.publicUrl;

        if (editingCategory?.image_url) {
          await deleteStorageFiles(supabase, [editingCategory.image_url], "drinks");
        }
      }

      const payload = {
        name: formData.name.trim(),
        slug: slugify(formData.name),
        description: formData.description.trim() || null,
        image_url: imageUrl,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }

      closeSheet();
      await fetchCategories();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      alert(`Error al guardar: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Eliminar la categoria "${category.name}"?`)) return;
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);
    if (error) { alert(`Error: ${error.message}`); return; }
    if (category.image_url) {
      await deleteStorageFiles(supabase, [category.image_url], "drinks");
    }
    if (editingCategory?.id === category.id) closeSheet();
    await fetchCategories();
  };

  return (
    <div className="flex flex-1 flex-col py-4 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Link
            href="/admin/dashboard"
            className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="font-[var(--font-outfit)] text-2xl font-black uppercase tracking-wide text-white">
            <span className="text-[#00e5ff]">Categorias</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">{categories.length} en el menu</p>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 space-y-2 pb-28">
        {fetching ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#00e5ff]" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl liquid-card flex items-center justify-center mb-4 border border-white/10">
              <Tag className="w-7 h-7 text-zinc-600" />
            </div>
            <p className="text-sm font-bold text-zinc-400">Sin categorias aun</p>
            <p className="text-xs text-zinc-600 mt-1">Toca el boton + para agregar la primera</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="liquid-card rounded-2xl border border-white/10 p-4 flex items-center gap-4"
            >
              {/* Icono / imagen */}
              {category.image_url ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl">
                  🍹
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-white truncate">{category.name}</h3>
                <span className="block font-mono text-[10px] text-[#00e5ff]">/{category.slug}</span>
                {category.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">{category.description}</p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditSheet(category)}
                  className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-zinc-300 hover:border-[#00e5ff]/50 hover:text-white transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="w-10 h-10 rounded-xl border border-rose-900/60 bg-rose-950/20 flex items-center justify-center text-rose-400 hover:border-rose-500 hover:bg-rose-900/40 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB — boton flotante + */}
      <button
        onClick={openNewSheet}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full glow-magenta-btn flex items-center justify-center shadow-2xl transition-transform active:scale-95"
        aria-label="Nueva categoria"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {/* Bottom Sheet */}
      {sheetOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={closeSheet}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
            <form
              onSubmit={handleSubmit}
              className="bg-[#0f0c1a] border border-white/10 border-b-0 rounded-t-[2rem] p-6 pt-4 space-y-4 max-w-lg mx-auto"
            >
              {/* Handle bar */}
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Titulo sheet */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-[var(--font-outfit)] text-base font-black uppercase tracking-wide text-white">
                  {editingCategory ? "Editar Categoria" : "Nueva Categoria"}
                </h2>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nombre */}
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Nombre *
                </span>
                <input
                  required
                  autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Tequilas"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none transition-colors focus:border-[#ff1b7a]"
                />
              </label>

              {/* Descripcion */}
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Descripcion (opcional)
                </span>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej. Tequilas reposados y anejos"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none transition-colors focus:border-[#ff1b7a]"
                />
              </label>

              {/* Imagen */}
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Imagen (opcional)
                </span>
                {(previewUrl || editingCategory?.image_url) && (
                  <div className="mb-2.5 flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <Image
                        src={previewUrl || editingCategory?.image_url || ""}
                        alt="Vista previa"
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="text-xs text-zinc-400">
                      {previewUrl ? "Nueva imagen seleccionada" : "Imagen actual"}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-zinc-400 file:mr-3 file:rounded-xl file:border-0 file:bg-[#ff1b7a]/20 file:px-3 file:py-2 file:text-[#ff1b7a] file:font-bold"
                />
              </label>

              {/* Boton guardar */}
              <button
                type="submit"
                disabled={loading}
                className="glow-magenta-btn w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black uppercase tracking-wider text-white disabled:opacity-50 mt-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingCategory ? "Actualizar" : "Guardar Categoria"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

