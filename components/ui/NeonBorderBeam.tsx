"use client";

import { memo } from "react";

export type NeonBeamVariant =
  | "electric" // Cyan -> Magenta -> White spark head
  | "magenta"  // Magenta VIP -> White spark head
  | "cyan"     // Electric Cyan -> White spark head
  | "gold"     // Champagne Gold -> White spark head
  | "purple"   // Ultraviolet Purple -> White spark head
  | "admin";   // Calm Indigo/Cyan for dashboard

interface NeonBorderBeamProps {
  variant?: NeonBeamVariant;
  duration?: number;          // Segundos por rotación
  delay?: number;             // Delay de inicio (para romper la monotonía)
  direction?: "cw" | "ccw";   // Horario o antihorario
  borderWidth?: number;       // Grosor en px
  className?: string;
  intensity?: "vibrant" | "subtle";
  pulsing?: boolean;          // Respiración/parpadeo de corriente eléctrica
}

const GRADIENTS: Record<NeonBeamVariant, string> = {
  electric: `conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 260deg,
    rgba(0, 229, 255, 0.35) 295deg,
    #00e5ff 325deg,
    #ff1b7a 348deg,
    #ffffff 360deg
  )`,
  magenta: `conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 270deg,
    rgba(255, 27, 122, 0.3) 305deg,
    #ff1b7a 335deg,
    #ff69b4 350deg,
    #ffffff 360deg
  )`,
  cyan: `conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 270deg,
    rgba(0, 229, 255, 0.3) 305deg,
    #00e5ff 335deg,
    #70f3ff 352deg,
    #ffffff 360deg
  )`,
  gold: `conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 270deg,
    rgba(255, 183, 0, 0.3) 305deg,
    #ffb700 335deg,
    #ffe082 352deg,
    #ffffff 360deg
  )`,
  purple: `conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 270deg,
    rgba(147, 51, 234, 0.3) 305deg,
    #9333ea 335deg,
    #c084fc 352deg,
    #ffffff 360deg
  )`,
  admin: `conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 285deg,
    rgba(99, 102, 241, 0.2) 320deg,
    #6366f1 345deg,
    #00e5ff 355deg,
    #ffffff 360deg
  )`,
};

function NeonBorderBeam({
  variant = "electric",
  duration,
  delay = 0,
  direction = "cw",
  borderWidth = 1.5,
  className = "",
  intensity,
  pulsing = true,
}: NeonBorderBeamProps) {
  const defaultDuration = variant === "admin" ? 6.5 : 4.0;
  const animDuration = duration ?? defaultDuration;
  const isSubtle = intensity === "subtle" || variant === "admin";
  const animName = direction === "ccw" ? "neon-beam-rotate-ccw" : "neon-beam-rotate-cw";

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit] select-none transition-opacity duration-500 ${className}`}
      style={{
        padding: `${borderWidth}px`,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        opacity: isSubtle ? 0.6 : 0.95,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute"
        style={{
          top: "-100%",
          left: "-100%",
          width: "300%",
          height: "300%",
          background: GRADIENTS[variant] || GRADIENTS.electric,
          animation: pulsing
            ? `${animName} ${animDuration}s linear infinite, neon-beam-pulse-surge ${animDuration * 1.6}s ease-in-out infinite`
            : `${animName} ${animDuration}s linear infinite`,
          animationDelay: `${delay}s, ${delay * 0.7}s`,
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}

export default memo(NeonBorderBeam);
