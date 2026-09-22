"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Users, Sparkles, CalendarCheck, Clock, Calendar } from "lucide-react";
import { getWhatsAppReservationUrl } from "@/lib/config";
import type { ReservationDetails } from "@/lib/config";
import AmbientParticles from "@/components/ui/AmbientParticles";
import NeonBorderBeam from "@/components/ui/NeonBorderBeam";

export default function ReservasPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 PM");
  const [guests, setGuests] = useState("4");
  const [zone, setZone] = useState<ReservationDetails["zone"]>("VIP Palco");
  const [specialRequests, setSpecialRequests] = useState("");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Helpers para selección rápida de fecha
  const getUpcomingDay = (targetDay: number) => {
    const now = new Date();
    const currentDay = now.getDay();
    let diff = targetDay - currentDay;
    if (diff <= 0) diff += 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    return targetDate.toISOString().split("T")[0];
  };

  const upcomingFri = useMemo(() => getUpcomingDay(5), []);
  const upcomingSat = useMemo(() => getUpcomingDay(6), []);

  const formattedDateLabel = useMemo(() => {
    if (!date || !date.includes("-")) return null;
    const [year, month, day] = date.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${days[d.getDay()]}, ${parseInt(day)} de ${months[d.getMonth()]}`;
  }, [date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) {
      alert("Por favor completa tu nombre y la fecha de la reserva.");
      return;
    }

    const url = getWhatsAppReservationUrl({
      name,
      phone,
      date: formattedDateLabel || date,
      time,
      guests,
      zone,
      specialRequests,
    });

    window.open(url, "_blank");
  };

  const inputStyles = "w-full max-w-full min-w-0 block box-border bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/[0.12] focus:border-indigo-400 focus:outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]";

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 sm:px-6 pt-3 pb-8 relative overflow-hidden">
      <AmbientParticles />
      
      {/* Header Fijo */}
      <div className="flex items-center justify-between pt-2 pb-4 shrink-0 relative z-20">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="w-11 h-11 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase drop-shadow-md">
          Reservas VIP
        </span>
        <div className="w-11" />
      </div>

      {/* Contenedor escrolleable */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8 bounce-enter relative z-10">
        <div className="liquid-card rounded-[2.5rem] p-5 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden mt-2 mb-4">
          <NeonBorderBeam variant="purple" borderWidth={2} />
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h1 className="font-[var(--font-title)] text-3xl font-black text-white uppercase tracking-wide">
              Reserva Tu <span className="text-indigo-400">Mesa o Palco</span>
            </h1>
            <p className="text-[12px] text-zinc-300 mt-2 max-w-[260px] mx-auto leading-relaxed">
              Garantiza el mejor spot para vivir la experiencia 180° VIP con tus amigos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-300 mb-2 ml-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Carlos Ramírez"
                className={inputStyles}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-300 mb-2 ml-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 300 123 4567"
                className={inputStyles}
              />
            </div>

            {/* Fecha y Hora - Diseño limpio y funcional sin desbordes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-full">
              <div className="w-full min-w-0 max-w-full">
                <label className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-300 mb-2 ml-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Fecha *
                  </span>
                </label>

                {/* Input de Fecha con altura h-12 controlada, min-w-0 y max-w-full */}
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${inputStyles} [color-scheme:dark]`}
                />

                {/* Atajos rápidos muy funcionales para noche de fiesta */}
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setDate(todayStr)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      date === todayStr
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        : "bg-white/[0.04] hover:bg-white/10 text-zinc-400 border-white/10"
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(upcomingFri)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      date === upcomingFri
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        : "bg-white/[0.04] hover:bg-white/10 text-zinc-400 border-white/10"
                    }`}
                  >
                    Viernes
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(upcomingSat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      date === upcomingSat
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        : "bg-white/[0.04] hover:bg-white/10 text-zinc-400 border-white/10"
                    }`}
                  >
                    Sábado
                  </button>
                </div>

                {formattedDateLabel && (
                  <p className="text-[11px] text-indigo-300 font-semibold mt-1.5 ml-1">
                    📅 {formattedDateLabel}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-300 mb-2 ml-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Hora Llegada
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`${inputStyles} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]`}
                >
                  <option value="9:30 PM" className="bg-[#120f20]">9:30 PM</option>
                  <option value="10:00 PM" className="bg-[#120f20]">10:00 PM</option>
                  <option value="10:30 PM" className="bg-[#120f20]">10:30 PM</option>
                  <option value="11:00 PM" className="bg-[#120f20]">11:00 PM</option>
                  <option value="11:30 PM" className="bg-[#120f20]">11:30 PM</option>
                  <option value="12:00 AM" className="bg-[#120f20]">12:00 AM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-full">
              <div className="w-full min-w-0 max-w-full">
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-300 mb-2 ml-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Personas
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className={`${inputStyles} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]`}
                >
                  <option value="2" className="bg-[#120f20]">2 personas</option>
                  <option value="4" className="bg-[#120f20]">4 personas</option>
                  <option value="6" className="bg-[#120f20]">6 personas</option>
                  <option value="8" className="bg-[#120f20]">8 personas</option>
                  <option value="10+" className="bg-[#120f20]">10 o más personas</option>
                </select>
              </div>

              <div className="w-full min-w-0 max-w-full">
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-300 mb-2 ml-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Zona Deseada
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as ReservationDetails["zone"])}
                  className="w-full h-12 bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-xl px-3.5 text-white text-sm focus:bg-white/[0.12] focus:border-indigo-400 focus:outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]"
                >
                  <option value="VIP Palco" className="bg-[#120f20]">💎 Palco VIP</option>
                  <option value="Mesa VIP" className="bg-[#120f20]">✨ Mesa VIP</option>
                  <option value="Barra" className="bg-[#120f20]">🥂 Barra VIP</option>
                  <option value="General" className="bg-[#120f20]">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-300 mb-2 ml-1">
                Notas Especiales
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Cumpleaños, Old Parr preferida..."
                rows={2}
                className="w-full bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:bg-white/[0.12] focus:border-indigo-400 focus:outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-[var(--font-title)] text-xl tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              <Send className="w-5 h-5" />
              Solicitar por WhatsApp
            </button>
          </form>

          <p className="text-[11px] text-zinc-400 text-center mt-7">
            Te atenderemos de inmediato confirmando disponibilidad y tarifa mínima de consumo.
          </p>
        </div>
      </div>
    </div>
  );
}
