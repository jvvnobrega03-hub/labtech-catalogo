export interface ApiErrorPayload {
  success?: boolean;
  error?: string;
  message?: string;
  fields?: Record<string, string>;
}

/**
 * Reads an API response without assuming that proxies or server failures
 * returned JSON. This prevents a secondary JSON parsing error from hiding
 * the original HTTP failure from the user and the browser console.
 */
export async function readJsonResponse<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type')?.toLowerCase() || '';

  if (!contentType.includes('application/json')) {
    console.error('[API_RESPONSE_UNEXPECTED]', {
      url: response.url,
      status: response.status,
      contentType: contentType || 'missing',
    });
    await response.text();
    return null;
  }

  try {
    return await response.json() as T;
  } catch (error) {
    console.error('[API_RESPONSE_INVALID_JSON]', {
      url: response.url,
      status: response.status,
      error: error instanceof Error ? error.message : 'Unknown JSON parsing error',
    });
    return null;
  }
}
