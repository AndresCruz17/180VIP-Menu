"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Users, Sparkles, CalendarCheck } from "lucide-react";
import { getWhatsAppReservationUrl } from "@/lib/config";
import type { ReservationDetails } from "@/lib/config";
import AmbientParticles from "@/components/ui/AmbientParticles";

export default function ReservasPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 PM");
  const [guests, setGuests] = useState("4");
  const [zone, setZone] = useState<ReservationDetails["zone"]>("VIP Palco");
  const [specialRequests, setSpecialRequests] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) {
      alert("Por favor completa tu nombre y la fecha de la reserva.");
      return;
    }

    const url = getWhatsAppReservationUrl({
      name,
      phone,
      date,
      time,
      guests,
      zone,
      specialRequests,
    });

    window.open(url, "_blank");
  };

  return (
    <div className="flex-1 flex flex-col py-2 relative">
      <AmbientParticles />
      
      {/* Header Fijo */}
      <div className="flex items-center justify-between pt-2 pb-4 shrink-0">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="w-11 h-11 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
          Reservas VIP
        </span>
        <div className="w-11" />
      </div>

      {/* Contenedor escrolleable para que no se aplaste en pantallas pequeñas */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8 bounce-enter">
        <div className="liquid-card rounded-[2.5rem] p-5 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden mt-2 mb-4">
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h1 className="font-[var(--font-outfit)] text-2xl font-black text-white uppercase tracking-wide">
              Reserva Tu <span className="text-indigo-400">Mesa o Palco</span>
            </h1>
            <p className="text-[11px] text-zinc-400 mt-2 max-w-[260px] mx-auto leading-relaxed">
              Garantiza el mejor spot para vivir la experiencia 180° VIP con tus amigos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Carlos Ramírez"
                className="w-full bg-[#0d0a16] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-400 focus:outline-none transition-colors shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 300 123 4567"
                className="w-full bg-[#0d0a16] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-400 focus:outline-none transition-colors shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0d0a16] border border-white/10 rounded-xl px-3 py-3 text-white text-xs focus:border-indigo-400 focus:outline-none transition-colors [color-scheme:dark] shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                  Hora Llegada
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#0d0a16] border border-white/10 rounded-xl px-3 py-3 text-white text-xs focus:border-indigo-400 focus:outline-none transition-colors shadow-inner appearance-none"
                >
                  <option value="9:30 PM">9:30 PM</option>
                  <option value="10:00 PM">10:00 PM</option>
                  <option value="10:30 PM">10:30 PM</option>
                  <option value="11:00 PM">11:00 PM</option>
                  <option value="11:30 PM">11:30 PM</option>
                  <option value="12:00 AM">12:00 AM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Personas
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-[#0d0a16] border border-white/10 rounded-xl px-3 py-3 text-white text-xs focus:border-indigo-400 focus:outline-none transition-colors shadow-inner appearance-none"
                >
                  <option value="2">2 personas</option>
                  <option value="4">4 personas</option>
                  <option value="6">6 personas</option>
                  <option value="8">8 personas</option>
                  <option value="10+">10 o más personas</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Zona Deseada
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as ReservationDetails["zone"])}
                  className="w-full bg-[#0d0a16] border border-white/10 rounded-xl px-3 py-3 text-white text-xs focus:border-indigo-400 focus:outline-none transition-colors shadow-inner appearance-none"
                >
                  <option value="VIP Palco">💎 Palco VIP</option>
                  <option value="Mesa VIP">✨ Mesa VIP</option>
                  <option value="Barra">🥂 Barra VIP</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                Notas Especiales
              </label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Cumpleaños, Old Parr preferida..."
                className="w-full bg-[#0d0a16] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-400 focus:outline-none transition-colors shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-extrabold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Send className="w-4 h-4" />
              Solicitar por WhatsApp
            </button>
          </form>

          <p className="text-[10px] text-zinc-500 text-center mt-6">
            Te atenderemos de inmediato confirmando disponibilidad y tarifa mínima de consumo.
          </p>
        </div>
      </div>
    </div>
  );
}