// Preserve each caller's status and response handling while centralizing JSON writes.
export function requestJson(url: string, body: unknown, method: 'POST' | 'DELETE' = 'POST') {
  return fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
