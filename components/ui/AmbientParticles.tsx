"use client";

import { useEffect, useState, memo } from "react";
import ClubSmokeGlow from "./ClubSmokeGlow";

interface ParticleData {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  color: string;
  isLarge: boolean;
}

function AmbientParticles() {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    // Paleta de partículas neón VIP
    const colors = [
      "rgba(255,27,122,0.85)", // magenta VIP
      "rgba(0,229,255,0.80)",  // cyan electric
      "rgba(157,78,221,0.80)", // ultraviolet
      "rgba(255,183,0,0.85)",  // champagne gold
      "rgba(255,255,255,0.90)"  // pure spark
    ];

    // 28 partículas divididas en 3 niveles de tamaño y presencia
    const newParticles: ParticleData[] = Array.from({ length: 28 }).map((_, i) => {
      // 25% partículas grandes bokeh (9px a 14px que crecen hasta 2.3x)
      const isLarge = i % 4 === 0;
      // 35% medianas (4.5px a 7.5px), 40% pequeñas (2px a 3.5px)
      const isMedium = i % 4 === 1 || i % 4 === 2;

      let size = 2 + Math.random() * 2;
      if (isLarge) {
        size = 9 + Math.random() * 5; // 9px a 14px
      } else if (isMedium) {
        size = 4.5 + Math.random() * 3; // 4.5px a 7.5px
      }

      const duration = isLarge
        ? `${12 + Math.random() * 8}s` // 12s a 20s (flotan suave)
        : `${8 + Math.random() * 6}s`;

      return {
        id: i,
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        size,
        delay: `${Math.random() * 6}s`,
        duration,
        color: colors[Math.floor(Math.random() * colors.length)],
        isLarge,
      };
    });

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Atmósfera sutil de niebla orgánica e iluminación líquida VIP */}
      <ClubSmokeGlow />

      {/* Partículas y orbes bokeh flotantes que aumentan de tamaño con luz */}
      {particles.map((p) => (
        <div
          key={p.id}
          className={p.isLarge ? "ambient-particle-large" : "ambient-particle"}
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            filter: p.isLarge ? "blur(1.2px)" : undefined,
            boxShadow: p.isLarge
              ? `0 0 22px 6px ${p.color}, 0 0 40px 12px ${p.color}55`
              : `0 0 12px 3px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

export default memo(AmbientParticles);
