// Local-only stand-ins; no real provider call, media production, checkout or payment state.
export const mockVideo = { async submit() { return { status: 'mock-complete' as const, url: null }; } };
export const mockPayment = { async checkout() { return { status: 'mock-only' as const, charged: false }; } };
