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
import SignOutButton from "./SignOutButton";

interface CacheEntry {
	incidents: Incident[];
	pagination: { total: number; total_pages: number };
	fetchedAt: number;
}

const incidentCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export default function Dashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [selectedStatus, setSelectedStatus] = useState("All");
	const [selectedPriority, setSelectedPriority] = useState("All");
	const [selectedTime, setSelectedTime] = useState("Last 24h");
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		setStats({
			highCritical: 4,
			dispatched: 12,
			untouched: 7,
			resolved: 42,
		});
	}, []);

	useEffect(() => {
		const fetchIncidents = async () => {
			const params = new URLSearchParams({
				status: selectedStatus,
				priority: selectedPriority,
				time: selectedTime,
				page: String(page),
				limit: String(limit),
			});
			const cacheKey = params.toString();

			const cached = incidentCache.get(cacheKey);
			if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
				setIncidents(cached.incidents);
				setTotalPages(cached.pagination.total_pages);
				setTotal(cached.pagination.total);
				return;
			}

			try {
				const res = await fetch(`/api/incidents?${cacheKey}`);
				const data = await res.json();

				if (data.success) {
					const { incidents, pagination } = data.response;
					setIncidents(incidents);
					setTotalPages(pagination.total_pages);
					setTotal(pagination.total);

					// Store in cache
					incidentCache.set(cacheKey, {
						incidents,
						pagination,
						fetchedAt: Date.now(),
					});
				}
			} catch (err) {
				console.error("Failed to fetch incidents:", err);
			}
		};

		fetchIncidents();
	}, [selectedStatus, selectedPriority, selectedTime, page, limit]);

	const handleFilterChange = (
		status: string,
		priority: string,
		time: string,
	) => {
		setSelectedStatus(status);
		setSelectedPriority(priority);
		setSelectedTime(time);
		setPage(1);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handleLimitChange = (newLimit: number) => {
		setLimit(newLimit);
		setPage(1);
	};

	const handleUpdateIncident = (updatedIncident: Incident) => {
		incidentCache.clear();
		setIncidents((prev) =>
			prev.map((inc) =>
				inc._id === updatedIncident._id ? updatedIncident : inc,
			),
		);
	};

	const handleSaveIncident = async (newIncidentData: {
		description: string;
		location: string;
		priority: PriorityLevel;
		type: IncidentType;
		category: IncidentCategory | "OTHER";
		short_desc?: string;
	}) => {
		try {
			const res = await fetch("/api/incidents", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newIncidentData),
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				console.error("Failed to create incident:", data.response);
				return;
			}

			const created: Incident = data.response;
			setIncidents((prev) => [created, ...prev]);

			if (stats) {
				setStats({
					...stats,
					untouched: stats.untouched + 1,
					highCritical:
						created.priority === "HIGH" || created.priority === "CRITICAL"
							? stats.highCritical + 1
							: stats.highCritical,
				});
			}

			setIsModalOpen(false);
		} catch (err) {
			console.error("Network error creating incident:", err);
		}
	};

	return (
		<div className="min-h-screen pb-12 font-sans text-slate-900 bg-[#f8f9fc]">
			<Header onNewIncidentClick={() => setIsModalOpen(true)} />

			<main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">
				<div className="space-y-4">
					<h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
						Real Time Operational Status
					</h2>
					{stats && <StatCards stats={stats} />}
				</div>

				<IncidentTable
					incidents={incidents}
					pagination={{ page, limit, total_pages: totalPages, total }}
					selectedStatus={selectedStatus}
					selectedPriority={selectedPriority}
					selectedTime={selectedTime}
					onFilterChange={handleFilterChange}
					onPageChange={handlePageChange}
					onLimitChange={handleLimitChange}
					onUpdate={handleUpdateIncident}
				/>
			</main>

			<NewIncidentModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveIncident}
			/>

			<div className="fixed bottom-6 right-6 z-50">
				<SignOutButton />
			</div>
		</div>
	);
}
