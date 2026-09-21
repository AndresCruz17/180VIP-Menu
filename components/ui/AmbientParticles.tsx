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
}

function AmbientParticles() {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    const colors = [
      "rgba(255,27,122,0.85)", // magenta VIP
      "rgba(0,229,255,0.80)",  // cyan electric
      "rgba(157,78,221,0.80)", // ultraviolet
      "rgba(255,183,0,0.85)",  // champagne gold
      "rgba(255,255,255,0.90)"  // pure spark
    ];

    // 12 partículas ultra-ligeras (solo GPU transform/opacity)
    const newParticles: ParticleData[] = Array.from({ length: 12 }).map((_, i) => {
      const isLarge = i % 3 === 0;
      const size = isLarge ? 5.5 : 2.5;
      const duration = isLarge ? "14s" : "9s";

      return {
        id: i,
        left: `${(i * 8.3 + Math.random() * 4).toFixed(1)}vw`,
        top: `${(10 + Math.random() * 80).toFixed(1)}vh`,
        size,
        delay: `${(i * 0.7).toFixed(1)}s`,
        duration,
        color: colors[i % colors.length],
      };
    });

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      <ClubSmokeGlow />

      {particles.map((p) => (
        <div
          key={p.id}
          className="ambient-particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            boxShadow: `0 0 8px 1px ${p.color}`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}

export default memo(AmbientParticles);
