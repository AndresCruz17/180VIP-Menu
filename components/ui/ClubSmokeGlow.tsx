"use client";

import { memo } from "react";

/**
 * ClubSmokeGlow
 * Atmósfera de discoteca VIP optimizada para GPU y Core Web Vitals en móviles.
 * Utiliza radial-gradients nativos con paradas suaves que no requieren filtros de desenfoque por CPU.
 */
function ClubSmokeGlow() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" style={{ contain: "paint", clipPath: "inset(0)" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes mesh-drift-1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(25px, -25px, 0) scale(1.1);
          }
        }

        @keyframes mesh-drift-2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1.05);
          }
          50% {
            transform: translate3d(-25px, 20px, 0) scale(0.95);
          }
        }

        @keyframes smoke-billow-horizontal {
          0%, 100% {
            transform: translate3d(-5%, 0, 0);
            opacity: 0.18;
          }
          50% {
            transform: translate3d(5%, -10px, 0);
            opacity: 0.32;
          }
        }

        .smoke-orb-magenta {
          animation: mesh-drift-1 18s ease-in-out infinite;
          will-change: transform;
        }

        .smoke-orb-cyan {
          animation: mesh-drift-2 22s ease-in-out infinite;
          will-change: transform;
        }

        .smoke-layer-1 {
          animation: smoke-billow-horizontal 20s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>

      {/* CAPA 1: RESPLANDOR ULTRAVIOLETA BASE */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(147, 51, 234, 0.16) 0%, transparent 65%), radial-gradient(ellipse at 50% 100%, rgba(255, 27, 122, 0.14) 0%, transparent 70%)",
        }}
      />

      {/* CAPA 2: NUBES DE LUZ LÍQUIDA ORGÁNICAS (Gradients puros sin blur costoso) */}
      <div
        className="smoke-orb-magenta absolute"
        style={{
          top: "-5%",
          left: "-10%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 27, 122, 0.22) 0%, rgba(255, 27, 122, 0.08) 40%, transparent 70%)",
        }}
      />

      <div
        className="smoke-orb-cyan absolute"
        style={{
          top: "30%",
          right: "-10%",
          width: "580px",
          height: "580px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0, 229, 255, 0.18) 0%, rgba(0, 229, 255, 0.06) 42%, transparent 70%)",
        }}
      />

      <div
        className="smoke-orb-magenta absolute"
        style={{
          bottom: "-5%",
          left: "5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(147, 51, 234, 0.20) 0%, rgba(76, 29, 149, 0.07) 45%, transparent 70%)",
        }}
      />

      <div
        className="smoke-layer-1 absolute inset-x-[-15%] top-[20%] h-[350px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 35% at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(0, 229, 255, 0.03) 35%, transparent 70%)",
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

export default memo(ClubSmokeGlow);
