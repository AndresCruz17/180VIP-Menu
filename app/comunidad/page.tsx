"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, ChevronLeft, Heart, Music, Share2, Sparkles, X } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  likes: number;
}

const PARTY_PHOTOS: GalleryPhoto[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
    caption: "Noche de DJs invitados y luces neón en el Main Stage",
    likes: 248,
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=600&q=80",
    caption: "Celebración en Palco VIP con botellas luminosas",
    likes: 189,
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    caption: "Coctelería de autor y la mejor vibra de la ciudad",
    likes: 312,
  },
  {
    id: "p4",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
    caption: "El ambiente 180° VIP a su máxima potencia",
    likes: 420,
  },
  {
    id: "p5",
    url: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=600&q=80",
    caption: "Show de pirotecnia fría y shots para todos",
    likes: 275,
  },
  {
    id: "p6",
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    caption: "Vibra electrónica y ritmos urbanos hasta el amanecer",
    likes: 390,
  },
];

export default function ComunidadPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPhotos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2">
      <div className="flex items-center justify-between pt-2 pb-4">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="w-11 h-11 rounded-2xl liquid-card flex items-center justify-center text-zinc-300 hover:text-white hover:border-pink-500/40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="text-xs font-bold tracking-widest text-[#ff1b7a] uppercase">
          Comunidad VIP
        </span>
        <div className="w-11" />
      </div>

      <div className="space-y-6 my-auto">
        <div className="liquid-card rounded-[2.5rem] p-6 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-pink-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500/20 via-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-400 mx-auto mb-3 shadow-[0_0_15px_rgba(236,72,153,0.3)] flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>

          <h1 className="font-[var(--font-outfit)] text-2xl font-black text-white uppercase tracking-wide">
            Únete a la <span className="text-[#ff1b7a]">Comunidad</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto mb-5">
            Sube tus historias y fotos etiquetando a <span className="text-white font-bold">@180vip</span> para aparecer en nuestras pantallas.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl liquid-card flex items-center justify-center gap-2 hover:border-pink-500/60 group transition-all"
            >
              <Camera className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold text-white tracking-wider">
                Instagram
              </span>
            </a>

            <a
              href={SITE_CONFIG.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl liquid-card flex items-center justify-center gap-2 hover:border-cyan-400/60 group transition-all"
            >
              <Music className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold text-white tracking-wider">
                TikTok
              </span>
            </a>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-[var(--font-outfit)] text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#ff1b7a]" />
              Galería de Fiesta
            </h2>
            <span className="text-[11px] font-bold text-zinc-500 uppercase">
              Momentos VIP
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PARTY_PHOTOS.map((photo) => {
              const isLiked = likedPhotos[photo.id];
              return (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative h-48 rounded-2xl overflow-hidden liquid-card cursor-pointer border border-white/10 select-none"
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    fill
                    sizes="(max-width: 768px) 200px, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <button
                    onClick={(e) => toggleLike(photo.id, e)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isLiked ? "fill-pink-500 text-pink-500" : ""
                      }`}
                    />
                  </button>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="text-[11px] font-semibold text-white line-clamp-2 leading-tight drop-shadow-md">
                      {photo.caption}
                    </p>
                    <span className="text-[10px] text-pink-400 font-bold mt-1 block">
                      {photo.likes + (isLiked ? 1 : 0)} me gusta
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-[#0f0d18] border border-white/15 p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative w-full h-80 rounded-2xl overflow-hidden mb-3">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                fill
                sizes="400px"
                className="object-cover"
              />
            </div>

            <p className="text-xs text-white font-medium mb-3">
              {selectedPhoto.caption}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs text-pink-400 font-bold">
                180° VIP Club Night
              </span>
              <a
                href={SITE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-bold"
              >
                <Share2 className="w-3.5 h-3.5" />
                Ver en Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
