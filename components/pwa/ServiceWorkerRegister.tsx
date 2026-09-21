"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => {
            console.log("180 VIP PWA Service Worker registrado con éxito");
          })
          .catch((err) => {
            console.warn("Fallo registro de Service Worker:", err);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  return null;
}
