import Link from "next/link";
import { ChevronLeft, Clock, Send, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWhatsAppReservationUrl } from "@/lib/config";

interface EventItem {
  id: string;
  title: string;
  tag: string;
  event_date: string;
  time: string;
  artist: string | null;
  description: string | null;
  image_url: string | null;
}

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

const DAYS_ES = ["Domingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"];

function formatEventDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayName = DAYS_ES[dateObj.getDay()];
  return {
    day,
    month: MONTH_LABELS[month] || month,
    fullDate: `${dayName} ${parseInt(day)} de ${MONTH_NAMES[month]} de ${year}`,
  };
}

export const revalidate = 60;

export default async function EventosPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("events")
    .select("id, title, tag, event_date, time, artist, description, image_url")
    .eq("is_active", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true });

  const events = (data as EventItem[]) || [];

  return (
    <div className="flex-1 flex flex-col justify-between py-2">
      <div className="flex items-center justify-between pt-2 pb-4">
        <Link href="/" aria-label="Volver al inicio"
          className="w-11 h-11 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white hover:border-cyan-400/40 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Cartelera VIP</span>
        <div className="w-11" />
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border border-cyan-400/40 text-cyan-300 bg-cyan-950/50 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Proximas Fechas
        </div>
        <h1 className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
          Fechas <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]">Especiales</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
          Artistas invitados, noches tematicas y los mejores espectaculos en vivo.
        </p>
      </div>

      <div className="space-y-4 my-auto">
        {events.length === 0 ? (
          <div className="liquid-card rounded-3xl p-10 border border-white/10 text-center">
            <p className="text-zinc-500 text-sm font-bold">Proximamente nuevas fechas</p>
            <p className="text-zinc-600 text-xs mt-1">Siguenos en redes para no perderte nada</p>
          </div>
        ) : (
          events.map((event) => {
            const { day, month, fullDate } = formatEventDate(event.event_date);
            const waUrl = getWhatsAppReservationUrl({
              name: "Cliente VIP",
              date: fullDate,
              time: event.time,
              guests: "4",
              zone: "VIP Palco",
              eventTitle: event.title,
              specialRequests: `Reserva para evento: ${event.title} (${fullDate})`,
            });

            return (
              <div key={event.id}
                className="liquid-card rounded-3xl p-5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

                <div className="flex gap-4">
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

                {event.description && (
                  <p className="text-xs text-zinc-300 mt-3 font-light leading-relaxed">{event.description}</p>
                )}

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Cupos limitados
                  </span>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Reservar
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
