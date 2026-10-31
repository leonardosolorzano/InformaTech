/**
 * Manejo uniforme de errores de la API.
 *
 * Centralizamos aquí el `ApiError` y la extracción de mensajes para que
 * formularios, hooks y páginas no repitan la misma lógica de parsing.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Extrae un mensaje legible de un cuerpo de error de FastAPI.
 * Soporta `detail` como string, como lista de validación (`[{ msg }]`) y `message`.
 */
export function getApiErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const { detail, message } = data as { detail?: unknown; message?: unknown };

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail.flatMap((item: unknown) => {
      if (item && typeof item === "object" && "msg" in item) {
        const value = item.msg;
        return typeof value === "string" ? [value] : [];
      }
      return [];
    });
    if (messages.length > 0) return messages.join(" ");
  }

  return typeof message === "string" ? message : null;
}

/** Convierte cualquier error capturado en un mensaje apto para la UI. */
export function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
