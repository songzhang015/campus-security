export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "PENDING" | "DISPATCHED" | "RESOLVED";
export type IncidentCategory =
	| "NOISE_COMPLAINT"
	| "TRESPASSING"
	| "THEFT"
	| "PROPERTY_DAMAGE"
	| "WEAPON"
	| "HARASSMENT"
	| "SUSPICIOUS_PERSON"
	| "INJURY"
	| "MISCONDUCT"
	| "FIRE_ALARM"
	| "PLUMBING_ISSUE"
	| "OTHER";
export type IncidentType =
	| "CAMPUS_SECURITY"
	| "POLICE"
	| "MEDICAL"
	| "MAINTENANCE"
	| "RESIDENCE";

export interface Incident {
	_id: string;
	id: string;
	priority: PriorityLevel;
	type: IncidentType;
	category: string;
	location: string;
	status: IncidentStatus;
	description: string;
	created_at: string;
	short_desc?: string;
	assigned?: string | null;
	dispatched_at?: string | null;
	resolved_at?: string | null;
	follow_up?: string | null;
}

export interface DashboardStats {
	highCritical: number;
	dispatched: number;
	untouched: number;
	resolved: number;
}

export interface PaginationInfo {
	total: number;
	page: number;
	limit: number;
	total_pages: number;
}
