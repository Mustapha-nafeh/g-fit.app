// API URLs are injected at build time via eas.json `env` — never from app.json extras.
// For local `npx expo start`, fall back to the hardcoded dev URL.
export const API_BASE_URL = process.env.API_BASE_URL ?? "https://backend.g-fit.app/api/v1";

export const STORAGE_BASE_URL = process.env.STORAGE_BASE_URL ?? "https://backend.g-fit.app/storage";
