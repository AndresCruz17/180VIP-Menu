"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NeonBorderBeam from "@/components/ui/NeonBorderBeam";
import EventDetailModal, { type EventItem } from "@/components/events/EventDetailModal";
import { ChevronLeft, Clock, Send, Sparkles, Maximize2 } from "lucide-react";
import { getWhatsAppEventUrl } from "@/lib/config";

const MONTH_LABELS: Record<string, string> = {
  "01": "ENE","02": "FEB","03": "MAR","04": "ABR",
  "05": "MAY","06": "JUN","07": "JUL","08": "AGO",
  "09": "SEP","10": "OCT","11": "NOV","12": "DIC",
};

const MONTH_NAMES: Record<string, string> = {
  "01": "Enero","02": "Febrero","03": "Marzo","04": "Abril",
  "05": "Mayo","06": "Junio","07": "Julio","08": "Agosto",
  "09": "Septiembre","10": "Octubre","11": "Noviembre","12": "Diciembre",
};

const DAYS_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

function formatEventDate(dateStr: string) {
  if (!dateStr || !dateStr.includes("-")) {
    return { day: "--", month: "---", fullDate: dateStr };
  }
  const parts = dateStr.split("-");
  const year = parts[0];
  const month = parts[1];
  const day = parts[2]?.slice(0, 2) || parts[2];
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayName = DAYS_ES[dateObj.getDay()] || "";
  return {
    day,
    month: MONTH_LABELS[month] || month,
    fullDate: `${dayName} ${parseInt(day)} de ${MONTH_NAMES[month] || month} de ${year}`,
  };
}

interface EventosClientProps {
  initialEvents: EventItem[];
}

export default function EventosClient({ initialEvents }: EventosClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 sm:px-6 pt-3 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="w-11 h-11 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white hover:border-cyan-400/40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Cartelera VIP</span>
        <div className="w-11" />
      </div>

      {/* Titular */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border border-cyan-400/40 text-cyan-300 bg-cyan-950/50 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Próximas Fechas
        </div>
        <h1 className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
          Fechas <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]">Especiales</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
          Toca cualquier evento para ver el flyer oficial y todos los detalles.
        </p>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-6 my-auto">
        {initialEvents.length === 0 ? (
          <div className="liquid-card rounded-3xl p-10 border border-white/10 text-center">
            <p className="text-zinc-500 text-sm font-bold">Próximamente nuevas fechas</p>
            <p className="text-zinc-600 text-xs mt-1">Síguenos en redes para no perderte nada</p>
          </div>
        ) : (
          initialEvents.map((event) => {
            const { day, month, fullDate } = formatEventDate(event.event_date);
            const waUrl = getWhatsAppEventUrl({
              eventTitle: event.title,
              date: fullDate,
              time: event.time,
              artist: event.artist,
            });

            return (
              <div
                key={event.id}
                className="liquid-card rounded-3xl p-4 sm:p-5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 overflow-hidden relative group shadow-lg"
              >
                <NeonBorderBeam variant="cyan" borderWidth={1.5} />
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

                {/* Si el evento tiene flyer */}
                {event.image_url ? (
                  <>
                    {/* Flyer Container Clickeable */}
                    <div
                      onClick={() => setSelectedEvent(event)}
                      className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden mb-4 border border-white/10 group-hover:border-cyan-400/40 transition-colors shadow-2xl bg-black/60 cursor-pointer"
                    >
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0714] via-black/20 to-transparent" />

                      {/* Tag flotante */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md border border-cyan-400/50 text-cyan-300 shadow-md">
                          {event.tag}
                        </span>
                      </div>

                      {/* Fecha flotante */}
                      <div className="absolute top-3 right-3 w-14 h-14 rounded-2xl bg-black/85 backdrop-blur-md border border-cyan-400/60 flex flex-col items-center justify-center text-center shadow-lg shrink-0 overflow-hidden">
                        <span className="font-[var(--font-outfit)] text-lg font-black text-cyan-300 leading-none">{day}</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-wider mt-0.5">{month}</span>
                      </div>

                      {/* Botón flotante para ver flyer completo */}
                      <div className="absolute bottom-3 right-3">
                        <div className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-cyan-400 hover:text-black backdrop-blur-md border border-cyan-400/50 text-cyan-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all">
                          <Maximize2 className="w-3.5 h-3.5" />
                          Ver Flyer Completo
                        </div>
                      </div>
                    </div>

                    {/* Información del Evento */}
                    <div onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                      <h2 className="font-[var(--font-outfit)] text-lg font-black text-white leading-tight hover:text-cyan-300 transition-colors">
                        {event.title}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-zinc-200">{event.time}</span>
                        {event.artist && (
                          <>
                            <span className="text-zinc-600">·</span>
                            <span className="text-zinc-300 font-medium truncate">{event.artist}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Formato sin imagen */
                  <div onClick={() => setSelectedEvent(event)} className="flex gap-4 cursor-pointer">
                    <div className="w-14 h-16 rounded-2xl bg-cyan-950/70 border border-cyan-400/40 flex flex-col items-center justify-center text-center shrink-0 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
                      <span className="font-[var(--font-outfit)] text-lg font-black text-cyan-300 leading-none">{day}</span>
                      <span className="text-[10px] font-extrabold text-white uppercase tracking-wider mt-1">{month}</span>
                    </div>

                    <div className="flex-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block mb-1">{event.tag}</span>
                      <h2 className="font-[var(--font-outfit)] text-base font-extrabold text-white leading-tight">{event.title}</h2>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{event.time}</span>
                        {event.artist && (
                          <>
                            <span>·</span>
                            <span className="text-zinc-300 font-medium truncate">{event.artist}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {event.description && (
                  <p className="text-xs text-zinc-300 mt-3 font-light leading-relaxed line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* Acciones */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    Ver Flyer
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Reservar
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Detalle Completo del Evento */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
