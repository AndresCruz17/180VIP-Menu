"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Edit2, Loader2, Plus, Trash2, X, AlertTriangle, Copy, Check, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteStorageFiles,
  uploadOptimizedImage,
  validateImageFile,
} from "@/lib/storage/image-utils";

interface EventItem {
  id: string;
  title: string;
  tag: string;
  event_date: string;
  time: string;
  artist: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

const MONTH_LABELS: Record<string, string> = {
  "01": "ENE","02": "FEB","03": "MAR","04": "ABR",
  "05": "MAY","06": "JUN","07": "JUL","08": "AGO",
  "09": "SEP","10": "OCT","11": "NOV","12": "DIC",
};

function formatDate(dateStr: string) {
  if (!dateStr || !dateStr.includes("-")) {
    return { day: "--", month: "---" };
  }
  const parts = dateStr.split("-");
  const month = parts[1];
  const day = parts[2]?.slice(0, 2) || parts[2];
  return { day, month: MONTH_LABELS[month] || month };
}

export default function AdminEventosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [flyerPreviewUrl, setFlyerPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    tag: "EVENTO ESPECIAL",
    event_date: "",
    time: "10:00 PM",
    artist: "",
    description: "",
  });

  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  );
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const fetchEvents = async () => {
    setFetching(true);
    setDbError(null);
    setDbErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, tag, event_date, time, artist, description, image_url, is_active")
        .order("event_date", { ascending: true });

      if (error) {
        console.error("Error al consultar events:", error);
        setDbErrorMessage(error.message);
        if (
          error.code === "PGRST205" ||
          error.code === "42P01" ||
          error.message?.includes("does not exist") ||
          error.message?.includes("not find") ||
          error.message?.includes("schema cache")
        ) {
          setDbError("missing_table");
        } else {
          setDbError("generic_error");
        }
      } else {
        setEvents((data as EventItem[]) || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setDbError("generic_error");
      setDbErrorMessage(msg);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openNewSheet = () => {
    setEditingEvent(null);
    setFormData({ title: "", tag: "EVENTO ESPECIAL", event_date: "", time: "10:00 PM", artist: "", description: "" });
    setImageFile(null);
    setSheetOpen(true);
  };

  const openEditSheet = (ev: EventItem) => {
    setEditingEvent(ev);
    setFormData({ title: ev.title, tag: ev.tag, event_date: ev.event_date, time: ev.time, artist: ev.artist || "", description: ev.description || "" });
    setImageFile(null);
    setSheetOpen(true);
  };

  const closeSheet = () => { setSheetOpen(false); setEditingEvent(null); setImageFile(null); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const vResult = validateImageFile(file);
    if (!vResult.valid) { alert(vResult.error || "Archivo inválido"); return; }
    setImageFile(file);
  };

  const handleToggleActive = async (ev: EventItem) => {
    const { error } = await supabase.from("events").update({ is_active: !ev.is_active }).eq("id", ev.id);
    if (error) {
      alert("Error al cambiar estado: " + error.message);
      return;
    }
    await fetchEvents();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.event_date) return;
    setLoading(true);
    try {
      let imageUrl: string | null = editingEvent?.image_url ?? null;
      if (imageFile) {
        const uploadResult = await uploadOptimizedImage(imageFile, "events");
        imageUrl = uploadResult.publicUrl;
        if (editingEvent?.image_url) await deleteStorageFiles(supabase, [editingEvent.image_url], "events");
      }
      const payload = {
        title: formData.title.trim(),
        tag: formData.tag.trim() || "EVENTO ESPECIAL",
        event_date: formData.event_date,
        time: formData.time,
        artist: formData.artist.trim() || null,
        description: formData.description.trim() || null,
        image_url: imageUrl,
      };
      if (editingEvent) {
        const { error } = await supabase.from("events").update(payload).eq("id", editingEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
      closeSheet();
      await fetchEvents();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("Error al guardar evento:", err);
      alert("Error al guardar: " + message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ev: EventItem) => {
    if (!window.confirm("¿Eliminar el evento: " + ev.title + "?")) return;
    const { error } = await supabase.from("events").delete().eq("id", ev.id);
    if (error) { alert("Error: " + error.message); return; }
    if (ev.image_url) await deleteStorageFiles(supabase, [ev.image_url], "events");
    if (editingEvent?.id === ev.id) closeSheet();
    await fetchEvents();
  };

  const copySqlScript = () => {
    const sql = `-- ==============================================================================
-- TABLA DE EVENTOS Y STORAGE COMPLETO
-- Ejecuta este script en: Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Eliminar tabla events anterior para recrearla con todas las columnas
drop table if exists public.events cascade;

-- 2. Crear tabla events con todas las columnas necesarias
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  tag         text not null default 'EVENTO ESPECIAL',
  slug        text default '',
  event_date  date not null,
  time        text not null default '10:00 PM',
  artist      text,
  description text,
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 3. Habilitar RLS
alter table public.events enable row level security;

-- 4. Índices
create index if not exists events_event_date_idx on public.events (event_date);
create index if not exists events_is_active_idx on public.events (is_active);

-- 5. Políticas RLS
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read"
  on public.events for select
  to public
  using (
    is_active = true
    or auth.role() = 'authenticated'
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  );

drop policy if exists "events_admin_all" on public.events;
create policy "events_admin_all"
  on public.events for all
  to authenticated
  using (true)
  with check (true);

-- 6. Storage Bucket
insert into storage.buckets (id, name, public)
values ('events', 'events', true)
on conflict (id) do update set public = true;

drop policy if exists "events_storage_public_read" on storage.objects;
create policy "events_storage_public_read"
  on storage.objects for select to public
  using (bucket_id = 'events');

drop policy if exists "events_storage_auth_insert" on storage.objects;
create policy "events_storage_auth_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'events');

drop policy if exists "events_storage_auth_update" on storage.objects;
create policy "events_storage_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'events') with check (bucket_id = 'events');

drop policy if exists "events_storage_auth_delete" on storage.objects;
create policy "events_storage_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'events');

-- 7. Evento de prueba
insert into public.events (title, tag, event_date, time, artist, description, is_active)
values (
  'Noche VIP & Live DJ Set',
  'EVENTO ESPECIAL',
  (current_date + interval '2 days')::date,
  '10:00 PM',
  'DJ Invitado Especial',
  'Vive la mejor fiesta con show de luces, pirotecnia fría, servicio de botellas y coctelería premium.',
  true
);

notify pgrst, 'reload schema';`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-1 flex-col pt-4 pb-10 w-full max-w-lg mx-auto px-4 sm:px-6">
      <div className="mb-5">
        <Link href="/admin/dashboard" className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />Dashboard
        </Link>
        <h1 className="font-[var(--font-outfit)] text-2xl font-black uppercase tracking-wide text-white">
          <span className="text-cyan-400">Eventos</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">Cartelera de fechas especiales y artistas invitados</p>
      </div>

      {/* Alerta de error de base de datos */}
      {dbError && (
        <div className="mb-6 liquid-card rounded-2xl p-4 border border-amber-500/40 bg-amber-950/20 text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-amber-300 text-sm mb-1">
                {dbError === "missing_table"
                  ? "La tabla 'events' necesita actualizarse en Supabase"
                  : "Error al consultar la base de datos"}
              </p>
              <p className="text-zinc-300 leading-relaxed mb-2">
                {dbError === "missing_table"
                  ? "Faltan columnas requeridas o la tabla debe recrearse con el script completo en el SQL Editor de tu panel de Supabase."
                  : `Detalle del error: ${dbErrorMessage || "Error de conexión"}`}
              </p>
              {dbErrorMessage && (
                <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-black/40 border border-amber-500/20 font-mono text-[11px] text-amber-200 break-all">
                  {dbErrorMessage}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copySqlScript}
                  className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "¡SQL Copiado!" : "Copiar SQL de Actualización"}
                </button>
                <button
                  type="button"
                  onClick={fetchEvents}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="space-y-3 flex-1">
        {fetching ? (
          <div className="flex items-center justify-center py-20 text-zinc-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <span className="text-xs font-bold">Cargando eventos...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
            <p className="text-sm font-bold text-white">No hay eventos registrados</p>
            <p className="text-xs text-zinc-500 mt-1">Toca el botón + para crear la primera fecha especial</p>
          </div>
        ) : (
          events.map((ev) => {
            const { day, month } = formatDate(ev.event_date);
            return (
              <div key={ev.id} className="liquid-card rounded-2xl p-4 flex items-center gap-3.5 border border-white/10 hover:border-cyan-400/40 transition-all">
                {ev.image_url ? (
                  <div onClick={() => ev.image_url && setFlyerPreviewUrl(ev.image_url)} title="Clic para ver flyer completo" className="relative w-16 h-18 rounded-2xl overflow-hidden border border-cyan-400/40 shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.2)] bg-black/40 cursor-pointer hover:scale-105 transition-transform">
                    <Image
                      src={ev.image_url}
                      alt={ev.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-xs py-0.5 text-center border-t border-cyan-400/30">
                      <span className="text-[9px] font-black text-cyan-300 leading-none block">{day} {month}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-16 rounded-2xl bg-cyan-950/70 border border-cyan-400/40 flex flex-col items-center justify-center text-center shrink-0">
                    <span className="font-[var(--font-outfit)] text-lg font-black text-cyan-300 leading-none">{day}</span>
                    <span className="text-[10px] font-extrabold text-white uppercase tracking-wider mt-1">{month}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block mb-0.5">{ev.tag}</span>
                  <h3 className="text-sm font-extrabold text-white leading-tight truncate">{ev.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{ev.time}{ev.artist ? " · " + ev.artist : ""}</p>
                  <button onClick={() => handleToggleActive(ev)}
                    className={"mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-colors " + (ev.is_active ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400" : "border-rose-500/40 bg-rose-950/40 text-rose-400")}>
                    <span className={"w-1.5 h-1.5 rounded-full " + (ev.is_active ? "bg-emerald-400" : "bg-rose-400")} />
                    {ev.is_active ? "Activo" : "Oculto"}
                  </button>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button onClick={() => openEditSheet(ev)} className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-zinc-300 hover:border-cyan-400/50 hover:text-white transition-colors cursor-pointer">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(ev)} className="w-10 h-10 rounded-xl border border-rose-900/60 bg-rose-950/20 flex items-center justify-center text-rose-400 hover:border-rose-500 transition-colors cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={openNewSheet} aria-label="Nuevo evento"
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95 bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_25px_rgba(0,229,255,0.5)] cursor-pointer">
        <Plus className="w-7 h-7 text-black" />
      </button>

      {sheetOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={closeSheet} />
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-[#0f0c1a] border border-white/10 border-b-0 rounded-t-[2rem] p-6 pt-4 space-y-4 max-w-lg mx-auto">
              <div className="flex justify-center mb-2"><div className="w-10 h-1 rounded-full bg-white/20" /></div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-[var(--font-outfit)] text-base font-black uppercase text-white">
                  {editingEvent ? "Editar Evento" : "Nuevo Evento"}
                </h2>
                <button type="button" onClick={closeSheet} className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Título *</span>
                <input required autoFocus value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Noche de Reggaeton VIP"
                  className="admin-input" />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Tipo de Evento</span>
                <input value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="Ej. DJ SET INTERNACIONAL"
                  className="admin-input" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Fecha *</span>
                  <input required type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="admin-input [color-scheme:dark]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Hora</span>
                  <select value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#120f20] p-3 text-sm text-white outline-none focus:border-cyan-400 transition-colors">
                    {["9:00 PM","9:30 PM","10:00 PM","10:30 PM","11:00 PM","11:30 PM","12:00 AM"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Artista / DJ</span>
                <input value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  placeholder="Ej. DJ Alex Rivas (Special Guest)"
                  className="admin-input" />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Descripción</span>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles del evento, show, promociones..."
                  className="admin-input resize-none" />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Imagen (opcional)</span>
                {(previewUrl || editingEvent?.image_url) && (
                  <div className="mb-2.5 flex items-center gap-3">
                    <div className="relative h-12 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <Image src={previewUrl || editingEvent?.image_url || ""} alt="Preview" fill sizes="80px" className="object-cover" />
                    </div>
                    <span className="text-xs text-zinc-400">{previewUrl ? "Nueva imagen" : "Imagen actual"}</span>
                  </div>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-zinc-400 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-400/20 file:px-3 file:py-2 file:text-cyan-400 file:font-bold" />
              </label>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all mt-2 cursor-pointer">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingEvent ? "Actualizar Evento" : "Guardar Evento"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
