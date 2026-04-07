import { Incident, DashboardStats } from "./types";

interface CacheEntry {
    incidents: Incident[];
    pagination: { total: number; total_pages: number };
    fetchedAt: number;
}

export const incidentCache = new Map<string, CacheEntry>();

export let statsCache: { data: DashboardStats; fetchedAt: number } | null =
    null;

export function setStatsCache(
    value: { data: DashboardStats; fetchedAt: number } | null,
) {
    statsCache = value;
}

export function resetDashboardCaches() {
    incidentCache.clear();
    statsCache = null;
}
