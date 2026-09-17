"use client";

import Image from "next/image";
import { X, Calendar, Clock, Send, Sparkles, User, Maximize2 } from "lucide-react";
import { getWhatsAppEventUrl } from "@/lib/config";

export interface EventItem {
  id: string;
  title: string;
  tag: string;
  event_date: string;
  time: string;
  artist: string | null;
  description: string | null;
  image_url: string | null;
}

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
}

const MONTH_NAMES: Record<string, string> = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
};

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function formatFullDate(dateStr: string) {
  if (!dateStr || !dateStr.includes("-")) return dateStr;
  const [year, month, day] = dateStr.split("-");
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayName = DAYS_ES[dateObj.getDay()] || "";
  return `${dayName} ${parseInt(day)} de ${MONTH_NAMES[month] || month} de ${year}`;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const fullDate = formatFullDate(event.event_date);
  const waUrl = getWhatsAppEventUrl({
    eventTitle: event.title,
    date: fullDate,
    time: event.time,
    artist: event.artist,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-[2.5rem] bg-[#0c0916] border border-cyan-500/30 shadow-[0_0_60px_rgba(0,229,255,0.25)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glows */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 hover:bg-white/20 border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-all z-20 backdrop-blur-md shadow-lg cursor-pointer active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          {/* Full Flyer Image Display */}
          {event.image_url ? (
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/70 border border-white/10 shadow-2xl p-2 flex items-center justify-center">
              <div className="relative w-full max-h-[60vh] sm:max-h-[66vh] aspect-[9/16] max-w-[340px] mx-auto">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  sizes="(max-width: 640px) 90vw, 360px"
                  className="object-contain rounded-xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                  priority
                />
              </div>
            </div>
          ) : null}

          {/* Event Metadata */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
                {event.tag}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Cupos VIP Limitados
              </span>
            </div>

            <h3 className="font-[var(--font-outfit)] text-xl sm:text-2xl font-black text-white uppercase tracking-wide leading-tight">
              {event.title}
            </h3>

            {/* Date, Time, Artist Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold capitalize truncate">{fullDate}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold">{event.time}</span>
              </div>
            </div>

            {event.artist && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-400/20 text-cyan-200 text-xs">
                <User className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold">Artista: {event.artist}</span>
              </div>
            )}

            {event.description && (
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-1">
                  Detalles del Evento
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-light whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0f0c1c] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Reservar Palco VIP
          </a>
        </div>
      </div>
    </div>
  );
}
