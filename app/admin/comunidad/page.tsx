"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  Edit2,
  Eye,
  EyeOff,
  Heart,
  ImagePlus,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validateImageFile } from "@/lib/storage/image-utils";
import NeonBorderBeam from "@/components/ui/NeonBorderBeam";

interface CommunityPhotoItem {
  id: string;
  caption: string;
  image_url: string;
  likes: number;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export default function AdminComunidadPage() {
  const [photos, setPhotos] = useState<CommunityPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal de Subida / Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<CommunityPhotoItem | null>(null);

  // Form State
  const [caption, setCaption] = useState("");
  const [likes, setLikes] = useState(150);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal de Eliminación
  const [deleteTarget, setDeleteTarget] = useState<CommunityPhotoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Cargar fotos desde Supabase
  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from("community_photos")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (fetchErr) {
        // Si la tabla no existe todavia, mostrar aviso informativo
        if (fetchErr.message.includes("does not exist") || fetchErr.message.includes("schema cache")) {
          setError("La tabla 'community_photos' aún no ha sido creada en Supabase. Ejecuta el archivo 'supabase/add_community_table.sql' en el editor SQL de Supabase.");
          setPhotos([]);
          setLoading(false);
          return;
        }
        throw fetchErr;
      }

      setPhotos((data as CommunityPhotoItem[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar fotos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const openCreateModal = () => {
    setEditingPhoto(null);
    setCaption("");
    setLikes(Math.floor(Math.random() * 150) + 120);
    setIsActive(true);
    setImageUrl("");
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (photo: CommunityPhotoItem) => {
    setEditingPhoto(photo);
    setCaption(photo.caption || "");
    setLikes(photo.likes || 0);
    setIsActive(photo.is_active);
    setImageUrl(photo.image_url);
    setImageFile(null);
    setImagePreview(photo.image_url);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleUploadImage = async (fileToUpload: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", "community");

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar y subir imagen");
      }

      return data.publicUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      let finalImageUrl = imageUrl;

      // Si seleccionó un archivo nuevo, subirlo primero
      if (imageFile) {
        finalImageUrl = await handleUploadImage(imageFile);
      }

      if (!finalImageUrl) {
        throw new Error("Debes seleccionar una imagen para la tarjeta.");
      }

      const supabase = createClient();

      if (editingPhoto) {
        // Actualizar foto existente
        const { error: updateErr } = await supabase
          .from("community_photos")
          .update({
            caption,
            image_url: finalImageUrl,
            likes: Number(likes),
            is_active: isActive,
          })
          .eq("id", editingPhoto.id);

        if (updateErr) throw updateErr;

        setSuccessMsg("Foto actualizada con éxito");
      } else {
        // Crear nueva foto
        const nextOrder = photos.length > 0 ? Math.max(...photos.map((p) => p.display_order || 0)) + 1 : 1;

        const { error: insertErr } = await supabase.from("community_photos").insert({
          caption,
          image_url: finalImageUrl,
          likes: Number(likes),
          is_active: isActive,
          display_order: nextOrder,
        });

        if (insertErr) throw insertErr;

        setSuccessMsg("Foto agregada a la galería con éxito");
      }

      setIsModalOpen(false);
      await fetchPhotos();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar foto";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (photo: CommunityPhotoItem) => {
    const nextState = !photo.is_active;
    // Optimistic UI
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, is_active: nextState } : p))
    );

    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("community_photos")
        .update({ is_active: nextState })
        .eq("id", photo.id);

      if (err) throw err;
    } catch (err) {
      // Revertir en caso de error
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, is_active: photo.is_active } : p))
      );
      alert("No se pudo actualizar el estado de la foto.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const supabase = createClient();
      const { error: delErr } = await supabase
        .from("community_photos")
        .delete()
        .eq("id", deleteTarget.id);

      if (delErr) throw delErr;

      setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccessMsg("Foto eliminada correctamente");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar foto";
      alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = photos.filter((p) => p.is_active).length;
  const totalLikes = photos.reduce((acc, curr) => acc + (curr.likes || 0), 0);

  return (
    <div className="min-h-screen bg-[#06050a] text-white p-4 sm:p-6 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Panel Principal
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff1b7a] flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          180° VIP • Administración
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
            Galería de Comunidad
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Agrega, edita o elimina las fotos y momentos VIP que los clientes ven en la web pública.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="glow-magenta-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Subir Nueva Foto
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="liquid-card rounded-2xl p-4 text-center border border-white/10">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Total Fotos
          </span>
          <span className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black text-white">
            {photos.length}
          </span>
        </div>

        <div className="liquid-card rounded-2xl p-4 text-center border border-emerald-500/20 bg-emerald-500/[0.03]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
            Visibles
          </span>
          <span className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black text-emerald-400">
            {activeCount}
          </span>
        </div>

        <div className="liquid-card rounded-2xl p-4 text-center border border-[#ff1b7a]/20 bg-[#ff1b7a]/[0.03]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#ff1b7a] mb-1">
            Total Likes
          </span>
          <span className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black text-[#ff1b7a]">
            {totalLikes.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grid de Fotos */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#ff1b7a] animate-spin" />
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
            Cargando galería VIP...
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="liquid-card rounded-3xl p-12 text-center border border-white/10 my-4">
          <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-[var(--font-outfit)] text-lg font-bold text-white mb-1">
            No hay fotos en la galería
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
            Empieza subiendo la primera foto de la fiesta, cócteles o clientes VIP.
          </p>
          <button
            onClick={openCreateModal}
            className="glow-magenta-btn inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Agregar Primera Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative rounded-2xl overflow-hidden liquid-card border transition-all ${
                photo.is_active
                  ? "border-white/15 hover:border-pink-500/40"
                  : "border-white/5 opacity-60 bg-black/60"
              }`}
            >
              {/* Imagen con badge */}
              <div className="relative w-full h-48 bg-black/80">
                <Image
                  src={photo.image_url}
                  alt={photo.caption || "Foto VIP"}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Badge de Estado Activa / Oculta */}
                <button
                  onClick={() => handleToggleActive(photo)}
                  title={photo.is_active ? "Click para ocultar" : "Click para hacer visible"}
                  className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border transition-all cursor-pointer ${
                    photo.is_active
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-zinc-800/80 text-zinc-400 border-white/10"
                  }`}
                >
                  {photo.is_active ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-400" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-zinc-400" />
                      Oculta
                    </>
                  )}
                </button>

                {/* Contador de Likes */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-pink-300">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  {photo.likes || 0}
                </div>
              </div>

              {/* Contenido / Caption */}
              <div className="p-3.5 flex flex-col justify-between min-h-[96px]">
                <p className="text-xs text-white line-clamp-2 leading-relaxed font-medium">
                  {photo.caption || <span className="text-zinc-500 italic">Sin pie de foto</span>}
                </p>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-1.5 pt-3 mt-2 border-t border-white/10">
                  <button
                    onClick={() => openEditModal(photo)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    title="Editar foto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(photo)}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md liquid-card rounded-3xl border border-white/15 p-6 bg-[#0c0a14] shadow-2xl overflow-hidden">
            <NeonBorderBeam variant="magenta" borderWidth={1.5} />

            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h2 className="font-[var(--font-outfit)] text-lg font-black uppercase text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#ff1b7a]" />
                {editingPhoto ? "Editar Foto VIP" : "Nueva Foto para la Galería"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4">
              {/* Selector de Imagen */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Fotografía
                </span>

                {imagePreview ? (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-black/80 border border-white/20 mb-2 group">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity cursor-pointer">
                      <Upload className="w-6 h-6 mb-1 text-[#ff1b7a]" />
                      Cambiar Imagen
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] hover:border-[#ff1b7a]/50 hover:bg-[#ff1b7a]/[0.02] transition-colors cursor-pointer p-4 text-center">
                    <ImagePlus className="w-8 h-8 text-zinc-500 mb-2" />
                    <span className="text-xs font-bold text-zinc-300">
                      Toca para subir desde el carrete o archivos
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-1">
                      PNG, JPG o WebP (se optimizará automáticamente)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      required={!editingPhoto}
                    />
                  </label>
                )}
              </div>

              {/* Pie de foto / Caption */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Pie de Foto / Descripción
                </label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ej: Celebrando las mejores noches en zona VIP 🥂✨"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder:text-zinc-600 focus:border-[#ff1b7a] focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Likes iniciales y Visibilidad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Likes Iniciales
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <input
                      type="number"
                      min={0}
                      value={likes}
                      onChange={(e) => setLikes(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Visibilidad
                  </label>
                  <label className="flex items-center gap-2 h-10 px-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#ff1b7a] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-zinc-300">Visible en web</span>
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="glow-magenta-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white disabled:opacity-60 cursor-pointer"
                >
                  {(saving || uploadingImage) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingPhoto ? "Guardar Cambios" : "Publicar Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm liquid-card rounded-3xl border border-rose-500/30 p-6 bg-[#0c0a14] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-[var(--font-outfit)] text-lg font-black uppercase text-white mb-1">
              ¿Eliminar esta foto?
            </h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Esta foto se quitará de la galería de comunidad de 180° VIP de forma permanente.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black uppercase tracking-wider text-white disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
