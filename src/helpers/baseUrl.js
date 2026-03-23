export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
export const ADMIN_BASE_URL = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

function ensureLeadingSlash(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function apiUrl(path) {
  return `${API_BASE_URL}${ensureLeadingSlash(path)}`;
}

export function adminUrl(path) {
  return `${ADMIN_BASE_URL}${ensureLeadingSlash(path)}`;
}
