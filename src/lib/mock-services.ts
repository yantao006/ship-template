// Local-only stand-in; no real provider call or media production.
export const mockVideo = { async submit() { return { status: 'mock-complete' as const, url: null }; } };
