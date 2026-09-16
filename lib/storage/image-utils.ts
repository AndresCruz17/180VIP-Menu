import type { SupabaseClient } from "@supabase/supabase-js";

export const ALLOWED_IMAGE_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(
  file: File,
  maxSize = MAX_IMAGE_SIZE_BYTES
): ImageValidationResult {
  if (!file) {
    return { valid: false, error: "No se ha seleccionado ningún archivo." };
  }

  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime === "image/svg+xml" || name.endsWith(".svg") || !ALLOWED_IMAGE_MIME_TYPES[mime]) {
    return {
      valid: false,
      error: `Formato de archivo no admitido (${file.type || "desconocido"}). Formatos permitidos: JPG, PNG, WEBP.`,
    };
  }

  if (file.size > maxSize) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `El archivo "${file.name}" supera el tamaño máximo permitido de ${maxMb}MB (peso actual: ${sizeMb}MB).`,
    };
  }

  return { valid: true };
}

export function extractStoragePath(publicUrl: string, bucket = "drinks"): string | null {
  if (!publicUrl || typeof publicUrl !== "string") return null;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const parts = publicUrl.split(marker);

  if (parts.length > 1) {
    return decodeURIComponent(parts[1].split("?")[0]);
  }

  return publicUrl;
}

export async function deleteStorageFiles(
  supabase: SupabaseClient,
  urlsOrPaths: (string | null | undefined)[],
  bucket = "drinks"
): Promise<void> {
  const pathsToDelete = urlsOrPaths
    .map((item) => {
      if (!item) return null;
      if (item.includes("/storage/v1/object/public/")) {
        return extractStoragePath(item, bucket);
      }
      return item;
    })
    .filter((path): path is string => Boolean(path));

  if (pathsToDelete.length === 0) return;

  const { error } = await supabase.storage.from(bucket).remove(pathsToDelete);
  if (error) {
    console.error(`Error al eliminar archivos del bucket ${bucket}:`, error);
  }
}

export interface UploadOptimizedImageResult {
  publicUrl: string;
  storagePath: string;
}

export async function uploadOptimizedImage(
  file: File,
  folder: "drinks" | "categories" | "events" = "drinks"
): Promise<UploadOptimizedImageResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Archivo de imagen no válido.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/admin/upload-image", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Error al procesar y subir la imagen optimizada.");
  }

  return {
    publicUrl: data.publicUrl,
    storagePath: data.storagePath,
  };
}
