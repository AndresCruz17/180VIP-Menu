"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProgressBarInternal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // Al cambiar de ruta o parámetros, completamos la animación
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Interceptar navegación por enlaces internos
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.shiftKey
      ) {
        return;
      }

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("https://wa.me") ||
        targetAttr === "_blank"
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (
          url.origin === currentUrl.origin &&
          (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search)
        ) {
          setVisible(true);
          setProgress(25);

          const t1 = setTimeout(() => setProgress((prev) => (prev < 70 ? 70 : prev)), 100);
          const t2 = setTimeout(() => setProgress((prev) => (prev < 88 ? 88 : prev)), 300);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      } catch {
        // Ignorar URLs no parseables
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none select-none h-[2.5px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full transition-all ease-out duration-250 relative"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          background: "linear-gradient(90deg, #ff1b7a 0%, #9333ea 50%, #00e5ff 100%)",
          boxShadow: "0 0 10px rgba(255, 27, 122, 0.9), 0 0 18px rgba(0, 229, 255, 0.8)",
        }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-3 bg-cyan-300 rounded-full blur-[2px] opacity-90" />
      </div>
    </div>
  );
}

export default function NeonTopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInternal />
    </Suspense>
  );
}
