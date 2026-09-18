"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AmbientParticles from "@/components/ui/AmbientParticles";
import NeonBorderBeam from "@/components/ui/NeonBorderBeam";
import { Camera, ChevronLeft, Heart, Music, Share2, Sparkles, X, WifiOff } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import type { CommunityPhoto } from "@/lib/supabase/queries";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

interface ComunidadClientProps {
  initialPhotos: CommunityPhoto[];
}

export default function ComunidadClient({ initialPhotos }: ComunidadClientProps) {
  const [photos, setPhotos] = useState<CommunityPhoto[]>(initialPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<CommunityPhoto | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [isOffline, setIsOffline] = useState(false);

  // Cargar likes y cache SWR
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem("180vip_user_likes");
      if (savedLikes) {
        setLikedPhotos(JSON.parse(savedLikes));
      }

      if (initialPhotos && initialPhotos.length > 0) {
        localStorage.setItem(
          "180vip_comunidad_cache",
          JSON.stringify({
            photos: initialPhotos,
            savedAt: Date.now(),
          })
        );
      }
    } catch {}

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const onOnline = () => setIsOffline(false);
      const onOffline = () => setIsOffline(true);
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      return () => {
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      };
    }
  }, [initialPhotos]);

  // Respaldo de contingencia si no hay red
  useEffect(() => {
    if ((!initialPhotos || initialPhotos.length === 0) && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("180vip_comunidad_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.photos?.length > 0) setPhotos(parsed.photos);
        }
      } catch {}
    }
  }, [initialPhotos]);

  const toggleLike = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const alreadyLiked = !!likedPhotos[photoId];
    const newLiked = !alreadyLiked;

    const updatedMap = { ...likedPhotos, [photoId]: newLiked };
    setLikedPhotos(updatedMap);

    try {
      localStorage.setItem("180vip_user_likes", JSON.stringify(updatedMap));
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 sm:px-6 pt-3 pb-8 relative overflow-hidden">
      <AmbientParticles />

      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="w-11 h-11 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#ff1b7a]/40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="text-xs font-bold tracking-widest text-[#ff1b7a] uppercase">
          Comunidad VIP
        </span>
        <div className="w-11" />
      </div>

      {/* Notificación Offline si se pierde la señal */}
      {isOffline && (
        <div className="mb-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-center text-[11px] font-bold text-amber-300 flex items-center justify-center gap-2 backdrop-blur-md">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Sin señal — Mostrando fotos guardadas en este dispositivo</span>
        </div>
      )}

      <div className="space-y-6 my-auto bounce-enter relative z-10">
        {/* Banner Superior de Redes (Original con Instagram, TikTok y Facebook) */}
        <div className="liquid-card rounded-[2.5rem] p-6 border border-white/10 text-center relative overflow-hidden">
          <NeonBorderBeam variant="magenta" borderWidth={1.8} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-pink-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500/20 via-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-400 mx-auto mb-3 shadow-[0_0_15px_rgba(236,72,153,0.3)] flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>

          <h1 className="font-[var(--font-outfit)] text-2xl font-black text-white uppercase tracking-wide strobe-effect">
            Únete a la <span className="text-[#ff1b7a]">Comunidad</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto mb-5">
            Sube tus historias y fotos etiquetando a <span className="text-white font-bold">@180vip</span> para aparecer en nuestras pantallas.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <a
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl liquid-card flex flex-col items-center justify-center gap-1.5 hover:border-pink-500/60 group transition-all"
            >
              <Camera className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-extrabold text-white tracking-wider">Insta</span>
            </a>

            <a
              href={SITE_CONFIG.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl liquid-card flex flex-col items-center justify-center gap-1.5 hover:border-cyan-400/60 group transition-all"
            >
              <Music className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-extrabold text-white tracking-wider">TikTok</span>
            </a>

            <a
              href={SITE_CONFIG.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl liquid-card flex flex-col items-center justify-center gap-1.5 hover:border-blue-500/60 group transition-all"
            >
              <FacebookIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-extrabold text-white tracking-wider">Facebook</span>
            </a>
          </div>
        </div>

        {/* Galería de Fotos Reales Dinámicas */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-[var(--font-outfit)] text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#ff1b7a]" />
              Galería 180° VIP
            </h2>
            <span className="text-[11px] font-bold text-zinc-500 uppercase">
              Momentos Reales
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => {
              const isLiked = !!likedPhotos[photo.id];
              const photoUrl = photo.image_url || (photo as unknown as { url?: string }).url || "";
              return (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative h-52 rounded-2xl overflow-hidden liquid-card cursor-pointer border border-white/10 hover:border-pink-500/50 transition-all select-none shadow-md bg-black/40"
                >
                  <Image
                    src={photoUrl}
                    alt={photo.caption || "Foto de Comunidad VIP"}
                    fill
                    sizes="(max-width: 768px) 200px, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                  {/* Botón Me Gusta */}
                  <button
                    onClick={(e) => toggleLike(photo.id, e)}
                    aria-label="Dar me gusta"
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all shadow-md active:scale-90 cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isLiked ? "fill-pink-500 text-pink-500 scale-110" : ""
                      }`}
                    />
                  </button>

                  {/* Pie de Foto */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                      {photo.caption}
                    </p>
                    <span className="text-[10px] text-pink-400 font-extrabold mt-1 block">
                      {(photo.likes || 0) + (isLiked ? 1 : 0)} me gusta
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Foto Completa */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-[#0f0d18] border border-pink-500/30 p-4 overflow-hidden shadow-[0_0_50px_rgba(255,27,122,0.25)] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Cerrar modal"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Foto completa con object-contain para no cortar */}
            <div className="relative w-full h-88 rounded-2xl overflow-hidden mb-3 bg-black/80 flex items-center justify-center border border-white/10">
              <Image
                src={selectedPhoto.image_url || (selectedPhoto as unknown as { url?: string }).url || ""}
                alt={selectedPhoto.caption || "Foto completa"}
                fill
                sizes="400px"
                className="object-contain"
                priority
              />
            </div>

            <p className="text-xs text-white font-medium mb-3 leading-relaxed">
              {selectedPhoto.caption}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs text-pink-400 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                180° VIP Club Night
              </span>
              <a
                href={SITE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-bold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-pink-400" />
                Ver en Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
