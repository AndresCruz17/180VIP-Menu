"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AmbientParticles from "@/components/ui/AmbientParticles";
import NeonBorderBeam from "@/components/ui/NeonBorderBeam";
import { Camera, ChevronLeft, Heart, Music, Share2, Sparkles, X, WifiOff, Check } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import type { CommunityPhoto } from "@/lib/supabase/queries";

interface ComunidadClientProps {
  initialPhotos: CommunityPhoto[];
}

export default function ComunidadClient({ initialPhotos }: ComunidadClientProps) {
  const [photos, setPhotos] = useState<CommunityPhoto[]>(initialPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<CommunityPhoto | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Cargar likes del usuario y cache SWR
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem("180vip_user_likes");
      if (savedLikes) {
        setLikedPhotos(JSON.parse(savedLikes));
      }

      if (initialPhotos && initialPhotos.length > 0) {
        localStorage.setItem("180vip_comunidad_cache", JSON.stringify({
          photos: initialPhotos,
          savedAt: Date.now(),
        }));
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

  // Respaldo de contingencia offline
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

  const handleToggleLike = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const alreadyLiked = !!likedPhotos[photoId];
    const newLiked = !alreadyLiked;

    // Actualizar estado de like en el dispositivo
    const updatedLikesMap = { ...likedPhotos, [photoId]: newLiked };
    setLikedPhotos(updatedLikesMap);
    try {
      localStorage.setItem("180vip_user_likes", JSON.stringify(updatedLikesMap));
    } catch {}

    // Actualizar contador visualmente
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          const nextCount = newLiked ? p.likes + 1 : Math.max(0, p.likes - 1);
          return { ...p, likes: nextCount };
        }
        return p;
      })
    );

    if (selectedPhoto && selectedPhoto.id === photoId) {
      setSelectedPhoto((prev) =>
        prev
          ? {
              ...prev,
              likes: newLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
            }
          : null
      );
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://180vip.com/comunidad";
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Galería de Fiesta — 180° VIP",
          text: "¡Mira las mejores fotos de las noches en 180° VIP!",
          url: shareUrl,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 sm:px-6 pt-3 pb-12 relative overflow-hidden">
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
        <span className="text-xs font-bold tracking-widest text-[#ff1b7a] uppercase">Galería VIP</span>
        <button
          onClick={handleShare}
          aria-label="Compartir galería"
          className="w-11 h-11 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#ff1b7a]/40 transition-colors"
        >
          {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Titulo */}
      <div className="text-center mb-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#ff1b7a] mb-1 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-[#ff1b7a]" />
          Experiencias 180° VIP
        </p>
        <h1 className="font-[var(--font-outfit)] text-2xl sm:text-3xl font-black uppercase text-white tracking-wider">
          Nuestra Comunidad
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
          Los mejores momentos, la energía de la fiesta y los invitados especiales de cada noche.
        </p>
      </div>

      {/* Notificación Offline */}
      {isOffline && (
        <div className="mb-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-center text-[11px] font-bold text-amber-300 flex items-center justify-center gap-2 backdrop-blur-md">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Sin señal — Mostrando galería guardada en este dispositivo</span>
        </div>
      )}

      {/* Grid de Fotos */}
      <div className="grid grid-cols-2 gap-3 my-auto">
        {photos.map((photo) => {
          const isLiked = !!likedPhotos[photo.id];
          return (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative h-52 rounded-2xl overflow-hidden liquid-card cursor-pointer border border-white/10 hover:border-pink-500/50 transition-all select-none shadow-md bg-black/40"
            >
              <Image
                src={photo.image_url}
                alt={photo.caption || "Foto de Comunidad VIP"}
                fill
                sizes="(max-width: 768px) 200px, 300px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

              {/* Botón Me Gusta */}
              <button
                onClick={(e) => handleToggleLike(photo.id, e)}
                aria-label="Dar me gusta"
                className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white transition-transform active:scale-90"
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isLiked ? "text-[#ff1b7a] fill-[#ff1b7a]" : "text-zinc-400"
                  }`}
                />
                <span className="text-[11px] font-semibold">{photo.likes}</span>
              </button>

              {/* Pie de foto */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <p className="text-[11px] text-zinc-200 line-clamp-2 leading-snug font-medium">
                  {photo.caption}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con Redes Sociales */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-xs text-zinc-400 mb-3">
          ¿Estuviste en 180° VIP? Etiquétanos en tus fotos y videos:
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl liquid-card border border-white/10 hover:border-pink-500/40 text-xs font-bold text-white transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-pink-400" />
            Instagram
          </a>
          <a
            href={SITE_CONFIG.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl liquid-card border border-white/10 hover:border-cyan-400/40 text-xs font-bold text-white transition-colors"
          >
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            TikTok
          </a>
        </div>
      </div>

      {/* Modal de Foto Completa */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm liquid-card rounded-3xl border border-white/15 p-4 bg-[#0c0a14] shadow-2xl overflow-hidden"
          >
            <NeonBorderBeam variant="magenta" borderWidth={1.5} />

            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Cerrar modal"
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Foto completa con object-contain para no cortar */}
            <div className="relative w-full h-88 rounded-2xl overflow-hidden mb-3 bg-black/80 flex items-center justify-center border border-white/10">
              <Image
                src={selectedPhoto.image_url}
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
              <button
                onClick={() => handleToggleLike(selectedPhoto.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    likedPhotos[selectedPhoto.id]
                      ? "text-[#ff1b7a] fill-[#ff1b7a]"
                      : "text-zinc-400"
                  }`}
                />
                <span>{selectedPhoto.likes} Me gusta</span>
              </button>

              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                180° VIP NIGHTCLUB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
