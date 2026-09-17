"use client";

import { useEffect, useState } from "react";

export default function AmbientParticles() {
  const [particles, setParticles] = useState<{ id: number; left: string; top: string; size: string; delay: string; duration: string; color: string }[]>([]);

  useEffect(() => {
    // Generar particulas de colores neon (magenta, cyan, verde, morado)
    const colors = [
      "rgba(255,27,122,0.7)", // magenta
      "rgba(0,229,255,0.7)",  // cyan
      "rgba(157,78,221,0.7)", // purple
      "rgba(57,255,20,0.6)"   // green
    ];
    
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      size: `${Math.random() * 6 + 1.5}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 5}s`,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="ambient-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            boxShadow: `0 0 12px 3px ${p.color}`
          }}
        />
      ))}
      {/* Laser sweeps aleatorios en el fondo */}
      <div className="laser-beam laser-magenta" />
      <div className="laser-beam laser-cyan" />
    </div>
  );
}