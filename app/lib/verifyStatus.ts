import fs from "fs";
import path from "path";

export type VerifyStatus = "pending" | "approved" | "rejected";

interface VerifyEntry {
  status: VerifyStatus;
  updatedAt: number;
}

const verifyStatusMap = new Map<string, VerifyEntry>();

function getCachePaths(): string[] {
  return [
    path.resolve(process.cwd(), "verify-status-cache.json"),
    path.resolve(process.cwd(), "frontend", "verify-status-cache.json"),
    path.resolve(process.cwd(), "..", "verify-status-cache.json"),
    "B:\\Project\\madar-store\\verify-status-cache.json",
    "B:\\Project\\madar-store\\frontend\\verify-status-cache.json",
  ];
}

function readCache(): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const p of getCachePaths()) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw);
        Object.assign(merged, parsed);
      }
    } catch {}
  }
  return merged;
}

function writeCache(orderId: string, status: VerifyStatus) {
  for (const p of getCachePaths()) {
    try {
      let current: Record<string, string> = {};
      if (fs.existsSync(p)) {
        try {
          current = JSON.parse(fs.readFileSync(p, "utf-8"));
        } catch {}
      }
      current[orderId] = status;
      fs.writeFileSync(p, JSON.stringify(current, null, 2), "utf-8");
    } catch {}
  }
}

export function updateVerifyStatusLocally(orderId: string, status: VerifyStatus) {
  const cleanId = String(orderId).trim();
  verifyStatusMap.set(cleanId, { status, updatedAt: Date.now() });
  writeCache(cleanId, status);

  // Sync to backend MongoDB asynchronously
  const backendUrl = process.env.BACKEND_URL || "https://madar-phone-backend.onrender.com";
  fetch(`${backendUrl}/api/checkout/verify-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: cleanId, status }),
    signal: AbortSignal.timeout(3000),
  }).catch(() => {});
}

export async function fetchVerifyStatus(orderId: string): Promise<VerifyStatus> {
  const cleanId = String(orderId).trim();

  // 1. Check local cache files first (instant local response)
  const cached = readCache();
  if (cached[cleanId] && cached[cleanId] !== "pending") {
    const s = cached[cleanId] as VerifyStatus;
    verifyStatusMap.set(cleanId, { status: s, updatedAt: Date.now() });
    return s;
  }

  // 2. In-memory check
  const inMem = verifyStatusMap.get(cleanId);
  if (inMem && inMem.status !== "pending") {
    return inMem.status;
  }

  // 3. Backend / Render / Mongo check
  const backendUrl = process.env.BACKEND_URL || "https://madar-phone-backend.onrender.com";
  try {
    const res = await fetch(`${backendUrl}/api/checkout/verify-status/${encodeURIComponent(cleanId)}`, {
      signal: AbortSignal.timeout(7000),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status && data.status !== "pending") {
        const s = data.status as VerifyStatus;
        verifyStatusMap.set(cleanId, { status: s, updatedAt: Date.now() });
        writeCache(cleanId, s);
        return s;
      }
    }
  } catch {}

  return inMem?.status || "pending";
}
