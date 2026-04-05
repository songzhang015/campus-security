"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import StatCards from "./StatCards";
import IncidentTable from "./IncidentTable";
import NewIncidentModal from "./NewIncidentModal";
import {
	Incident,
	DashboardStats,
	PriorityLevel,
	IncidentType,
	IncidentCategory,
} from "./types";

export default function Dashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		// TODO: Replace with actual API call: fetch('/api/incidents')
		const loadMockData = () => {
			setStats({
				highCritical: 4,
				dispatched: 12,
				untouched: 7,
				resolved: 42,
			});

			setIncidents([
				{
					id: "#123456",
					priority: "HIGH",
					type: "MEDICAL",
					category: "INJURY",
					location: "Knight Library, Floor 2",
					status: "DISPATCHED",
					short_desc: "Student experiencing respiratory distress",
					description:
						"Student experiencing severe respiratory distress in the second-floor study area. EMS has been notified and is en route.",
					timestamp: new Date().toISOString(),
				},
				{
					id: "#123457",
					priority: "MEDIUM",
					type: "CAMPUS_SECURITY",
					category: "PROPERTY_DAMAGE",
					location: "Lot 54, East Entrance",
					status: "PENDING",
					short_desc: "Vandalism to parked vehicles",
					description:
						"Vandalism reported on three parked vehicles near the east entrance. Broken windows and paint damage.",
					timestamp: new Date(Date.now() - 3600000).toISOString(),
				},
				{
					id: "#123458",
					priority: "LOW",
					type: "MAINTENANCE",
					category: "PLUMBING ISSUE",
					location: "Erb Memorial Union",
					status: "RESOLVED",
					short_desc: "Minor flooding in men's restroom",
					description:
						"Reporting a broken pipe causing minor flooding in the first-floor men's restroom. Water shut off.",
					timestamp: new Date(Date.now() - 7200000).toISOString(),
				},
			]);
		};

		loadMockData();
	}, []);

	const handleSaveIncident = (newIncidentData: {
		description: string;
		location: string;
		priority: PriorityLevel;
		type: IncidentType;
		category: IncidentCategory | "OTHER";
	}) => {
		// Create a new incident object simulating server creation
		const newIncident: Incident = {
			id: `#${Math.floor(100000 + Math.random() * 900000)}`, // Generate random 6-digit ID
			priority: newIncidentData.priority,
			type: newIncidentData.type,
			category: newIncidentData.category,
			location: newIncidentData.location,
			status: "PENDING", // New incidents start as pending
			description: newIncidentData.description,
			short_desc: newIncidentData.description.substring(0, 40) + "...", // Auto-generate short description
			timestamp: new Date().toISOString(),
		};

		// Add to the top of the table
		setIncidents((prev) => [newIncident, ...prev]);

		// Update stats optimistically
		if (stats) {
			setStats({
				...stats,
				untouched: stats.untouched + 1,
				highCritical:
					newIncident.priority === "HIGH"
						? stats.highCritical + 1
						: stats.highCritical,
			});
		}

		setIsModalOpen(false);
	};

	return (
		<div className="min-h-screen bg-[#f8f9fc] pb-12 font-sans text-slate-900">
			<Header onNewIncidentClick={() => setIsModalOpen(true)} />

			<main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
				<div className="space-y-4">
					<h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
						Real Time Operational Status
					</h2>
					{stats && <StatCards stats={stats} />}
				</div>

				<IncidentTable incidents={incidents} />
			</main>

			<NewIncidentModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveIncident}
			/>
		</div>
	);
}
