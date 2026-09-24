"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import NeonBorderBeam from "@/components/ui/NeonBorderBeam";
import EventDetailModal, { type EventItem } from "@/components/events/EventDetailModal";
import { ChevronLeft, Clock, Send, Sparkles, Maximize2, WifiOff } from "lucide-react";
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
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Mantener sincronizado el estado si initialEvents cambia en el servidor
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Manejo de conexión y caché offline
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onOnline = () => {
      setIsOffline(false);
    };

    const onOffline = () => {
      setIsOffline(true);
      // Recuperar de la memoria local SOLO si realmente estamos sin internet
      try {
        const cached = localStorage.getItem("180vip_events_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.events) setEvents(parsed.events);
        }
      } catch {}
    };

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // Guardar en caché la lista oficial del servidor para modo sin conexión
    if (navigator.onLine && initialEvents) {
      try {
        localStorage.setItem(
          "180vip_events_cache",
          JSON.stringify({
            events: initialEvents,
            savedAt: Date.now(),
          })
        );
      } catch {}
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [initialEvents]);

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

      <div className="text-center mb-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-cyan-400 mb-1 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Noches Exclusivas
        </p>
        <h1 className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black uppercase text-white tracking-wider">
          Próximos Eventos
        </h1>
      </div>

      {/* Notificación de Modo Offline */}
      {isOffline && (
        <div className="mb-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-center text-[11px] font-bold text-amber-300 flex items-center justify-center gap-2 backdrop-blur-md">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Sin señal de internet — Mostrando cartelera guardada en este dispositivo</span>
        </div>
      )}

      {/* Lista de Eventos */}
      <div className="space-y-4 my-auto">
        {events.length === 0 ? (
          <div className="liquid-card rounded-3xl p-8 text-center border border-white/10">
            <span className="text-3xl mb-3 block">🎉</span>
            <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Próximamente más eventos
            </p>
            <p className="text-xs text-zinc-400">
              Estamos preparando las mejores noches VIP. ¡Atento a nuestras redes!
            </p>
          </div>
        ) : (
          events.map((ev) => {
            const { day, month, fullDate } = formatEventDate(ev.event_date);
            return (
              <div
                key={ev.id}
                className="relative rounded-3xl p-4 overflow-hidden border border-white/15 bg-black/40 backdrop-blur-md transition-all hover:border-cyan-400/40"
              >
                <NeonBorderBeam variant="cyan" duration={6} />

                {/* Badge de etiqueta arriba */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                    {ev.tag || "Noche VIP"}
                  </span>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {ev.time}
                  </span>
                </div>

                {/* Banner de Flyer con botón para ver completo */}
                {ev.image_url && (
                  <div
                    onClick={() => setSelectedEvent(ev)}
                    className="group relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-3 bg-black/60 border border-white/10 cursor-pointer"
                  >
                    <Image
                      src={ev.image_url}
                      alt={ev.title}
                      fill
                      sizes="(max-width: 768px) 380px, 480px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 group-hover:border-cyan-400 transition-colors">
                      <Maximize2 className="w-3 h-3 text-cyan-400" />
                      Ver flyer completo
                    </div>
                  </div>
                )}

                {/* Contenido: Fecha + Info */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Badge de Fecha */}
                  <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex flex-col items-center justify-center shrink-0">
                    <span className="font-[var(--font-outfit)] text-xl font-black text-white leading-none">
                      {day}
                    </span>
                    <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-wider leading-none mt-0.5">
                      {month}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-[var(--font-outfit)] text-lg font-black uppercase text-white tracking-wide truncate">
                      {ev.title}
                    </h2>
                    {ev.artist && (
                      <p className="text-xs font-bold text-cyan-400 truncate mt-0.5">
                        {ev.artist}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-400 capitalize mt-0.5">
                      {fullDate}
                    </p>
                  </div>
                </div>

                {ev.description && (
                  <p className="text-xs text-zinc-300 leading-relaxed mb-3 line-clamp-2">
                    {ev.description}
                  </p>
                )}

                {/* Boton de Reserva directa por WhatsApp */}
                <a
                  href={getWhatsAppEventUrl({ eventTitle: ev.title, date: fullDate, time: ev.time, artist: ev.artist })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,229,255,0.25)] hover:shadow-[0_0_25px_rgba(0,229,255,0.45)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reservar Mi Palco
                </a>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Flyer Completo */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
