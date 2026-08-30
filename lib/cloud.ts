import { CLOUD_KEY, CLOUD_SYNCED_KEYS } from "./storage";

export type CloudConfig = { url: string; key: string; code: string; auto: boolean };
const LAST = "starlight-last-sync";

export function readCloudConfig(): CloudConfig | null {
  try { return JSON.parse(localStorage.getItem(CLOUD_KEY) ?? "null"); } catch { return null; }
}
export function saveCloudConfig(c: CloudConfig) { localStorage.setItem(CLOUD_KEY, JSON.stringify(c)); }
export function lastSyncISO(): string { return localStorage.getItem(LAST) ?? ""; }
export function genCode(): string {
  return Array.from({ length: 8 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
}

function payload(): Record<string, string> {
  const data: Record<string, string> = {};
  CLOUD_SYNCED_KEYS.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  });
  return data;
}

export async function cloudPush(): Promise<string> {
  const c = readCloudConfig();
  if (!c?.url || !c.key || !c.code) return "no-config";
  try {
    const res = await fetch(`${c.url}/rest/v1/starlight_data`, {
      method: "POST",
      headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ code: c.code, data: payload(), updated_at: new Date().toISOString() }),
    });
    if (!res.ok) return `error-${res.status}`;
    localStorage.setItem(LAST, new Date().toISOString());
    return "pushed";
  } catch { return "error-network"; }
}

export async function cloudPull(): Promise<"pulled" | "up-to-date" | "no-config" | "empty" | "error"> {
  const c = readCloudConfig();
  if (!c?.url || !c.key || !c.code) return "no-config";
  try {
    const res = await fetch(`${c.url}/rest/v1/starlight_data?select=data,updated_at&code=eq.${encodeURIComponent(c.code)}`, {
      headers: { apikey: c.key, Authorization: `Bearer ${c.key}` },
    });
    if (!res.ok) return "error";
    const rows = (await res.json()) as { data: Record<string, string>; updated_at: string }[];
    if (!rows.length) return "empty";
    const row = rows[0];
    const last = localStorage.getItem(LAST) ?? "";
    if (row.updated_at <= last) return "up-to-date";
    Object.entries(row.data).forEach(([k, v]) => localStorage.setItem(k, v));
    localStorage.setItem(LAST, row.updated_at);
    return "pulled";
  } catch { return "error"; }
}