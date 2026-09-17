"use client";

import { memo } from "react";

/**
 * ClubSmokeGlow
 * Atmósfera de discoteca VIP: Niebla de club (haze/smoke) e iluminación orgánica líquida (mesh glow)
 * en tonos Magenta VIP, Azul Cian Eléctrico, Púrpura Ultravioleta y Oro Champaña.
 * Estado suave, sutil y aterciopelado (fondo relajado y elegante).
 */
function ClubSmokeGlow() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <style>{`
        /* --- ANIMACIONES DE LA NIEBLA Y MESH GLOW --- */
        @keyframes mesh-drift-1 {
          0% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          33% {
            transform: translate3d(35px, -45px, 0) scale(1.15) rotate(15deg);
          }
          66% {
            transform: translate3d(-30px, 30px, 0) scale(0.92) rotate(-10deg);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
        }

        @keyframes mesh-drift-2 {
          0% {
            transform: translate3d(0, 0, 0) scale(1.05) rotate(0deg);
          }
          40% {
            transform: translate3d(-45px, 35px, 0) scale(0.88) rotate(-20deg);
          }
          75% {
            transform: translate3d(25px, -35px, 0) scale(1.18) rotate(12deg);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1.05) rotate(0deg);
          }
        }

        @keyframes mesh-drift-3 {
          0% {
            transform: translate3d(0, 0, 0) scale(0.95);
          }
          50% {
            transform: translate3d(40px, 40px, 0) scale(1.22);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(0.95);
          }
        }

        @keyframes smoke-billow-horizontal {
          0% {
            transform: translate3d(-10%, 0, 0) scaleY(1);
            opacity: 0.18;
          }
          50% {
            transform: translate3d(10%, -20px, 0) scaleY(1.15);
            opacity: 0.32;
          }
          100% {
            transform: translate3d(-10%, 0, 0) scaleY(1);
            opacity: 0.18;
          }
        }

        @keyframes smoke-billow-reverse {
          0% {
            transform: translate3d(8%, 0, 0) scaleY(1.1);
            opacity: 0.22;
          }
          50% {
            transform: translate3d(-12%, 15px, 0) scaleY(0.95);
            opacity: 0.14;
          }
          100% {
            transform: translate3d(8%, 0, 0) scaleY(1.1);
            opacity: 0.22;
          }
        }

        @keyframes haze-breathe {
          0%, 100% {
            opacity: 0.22;
          }
          50% {
            opacity: 0.40;
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

        .smoke-orb-purple {
          animation: mesh-drift-3 26s ease-in-out infinite;
          will-change: transform;
        }

        .smoke-layer-1 {
          animation: smoke-billow-horizontal 20s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .smoke-layer-2 {
          animation: smoke-billow-reverse 24s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .smoke-haze-ambient {
          animation: haze-breathe 14s ease-in-out infinite;
        }
      `}</style>

      {/* CAPA 1: RESPLANDOR ULTRAVIOLETA BASE (ATMÓSFERA PROFUNDA) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(147, 51, 234, 0.14) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(255, 27, 122, 0.12) 0%, transparent 65%)",
        }}
      />

      {/* CAPA 2: NUBES DE LUZ LÍQUIDA ORGÁNICAS (MESH GLOW) */}
      {/* Nube 1: Magenta Club VIP (Superior izquierda) */}
      <div
        className="smoke-orb-magenta absolute"
        style={{
          top: "-10%",
          left: "-15%",
          width: "580px",
          height: "580px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 27, 122, 0.26) 0%, rgba(255, 27, 122, 0.10) 45%, transparent 70%)",
          filter: "blur(75px)",
        }}
      />

      {/* Nube 2: Cian Eléctrico (Centro derecha) */}
      <div
        className="smoke-orb-cyan absolute"
        style={{
          top: "35%",
          right: "-15%",
          width: "620px",
          height: "620px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0, 229, 255, 0.20) 0%, rgba(0, 229, 255, 0.07) 45%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Nube 3: Púrpura Ultravioleta & Índigo (Inferior centro-izquierda) */}
      <div
        className="smoke-orb-purple absolute"
        style={{
          bottom: "-5%",
          left: "10%",
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(147, 51, 234, 0.22) 0%, rgba(76, 29, 149, 0.10) 50%, transparent 75%)",
          filter: "blur(90px)",
        }}
      />

      {/* Nube 4: Acento Dorado VIP (Toque de champán sutil) */}
      <div
        className="smoke-orb-magenta absolute"
        style={{
          top: "20%",
          left: "55%",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 183, 0, 0.12) 0%, rgba(255, 183, 0, 0.03) 40%, transparent 65%)",
          filter: "blur(65px)",
        }}
      />

      {/* CAPA 3: ONDAS Y VOLUTAS DE HUMO DE DISCOTECA (HAZE BILLOWS) */}
      <div
        className="smoke-layer-1 absolute inset-x-[-20%] top-[18%] h-[400px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 35% at 50% 50%, rgba(255, 255, 255, 0.06) 0%, rgba(0, 229, 255, 0.04) 30%, transparent 70%)",
          filter: "blur(45px)",
          transformOrigin: "center",
        }}
      />

      <div
        className="smoke-layer-2 absolute inset-x-[-20%] bottom-[8%] h-[450px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 50%, rgba(255, 27, 122, 0.06) 0%, rgba(147, 51, 234, 0.04) 35%, transparent 75%)",
          filter: "blur(55px)",
          transformOrigin: "center",
        }}
      />

      {/* CAPA 4: NIEBLA AMBIENTAL HOMOGÉNEA DE DISCOTECA */}
      <div
        className="smoke-haze-ambient absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

export default memo(ClubSmokeGlow);
