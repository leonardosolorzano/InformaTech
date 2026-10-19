import { ApiError, getApiErrorMessage } from "./errors";

/**
 * `fetch` + JSON con manejo uniforme de errores.
 *
 * - Lanza `ApiError` con un mensaje legible cuando la respuesta no es OK.
 * - Devuelve `undefined` en respuestas `204 No Content`.
 * - Acepta `FormData` sin tocar el `Content-Type` (lo pone el navegador).
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      getApiErrorMessage(data) ?? `Error ${response.status}`,
      data ?? undefined
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
