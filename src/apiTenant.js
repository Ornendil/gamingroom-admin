// src/apiTenant.js
import { apiUrl } from "./helpers/baseUrl";

export async function fetchTenant() {
  const res = await fetch(apiUrl("/api/tenant/"), {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error(`Tenant fetch failed: ${res.status}`);
  const json = await res.json();

  if (json?.status !== "success" || !json?.tenant) {
    throw new Error("Tenant fetch returned unexpected payload");
  }

  return json.tenant;
}
