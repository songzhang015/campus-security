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
	| "PLUMBING ISSUE"
	| "OTHER";
export type IncidentType =
	| "CAMPUS_SECURITY"
	| "POLICE"
	| "MEDICAL"
	| "MAINTENANCE"
	| "RESIDENCE";

export interface Incident {
	id: string;
	priority: PriorityLevel;
	type: IncidentType;
	category: string;
	location: string;
	status: IncidentStatus;
	description: string;
	timestamp: string;
	short_desc?: string;
}

export interface DashboardStats {
	highCritical: number;
	dispatched: number;
	untouched: number;
	resolved: number;
}
