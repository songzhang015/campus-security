"use client";

import { useState, useEffect } from "react";
import Header from "./header/Header";
import StatCards from "./stats/StatCards";
import IncidentTable from "./incidents-table/IncidentTable";
import NewIncidentModal from "./header/NewIncidentModal";
import ShiftBriefingModal from "./header/ShiftBriefingModal";
import {
    Incident,
    DashboardStats,
    PriorityLevel,
    IncidentType,
    IncidentCategory,
} from "./types";
import SignOutButton from "./SignOutButton";
import { incidentCache, statsCache, setStatsCache } from "./dashboardCache";

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
    const [orgName, setOrgName] = useState<string>("");
    const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);

    const fetchStats = async (force = false) => {
        if (
            !force &&
            statsCache &&
            Date.now() - statsCache.fetchedAt < CACHE_TTL_MS
        ) {
            setStats(statsCache.data);
            return;
        }

        try {
            const res = await fetch("/api/stats");
            const data = await res.json();
            if (data.success) {
                setStats(data.response);
                setStatsCache({
                    data: data.response,
                    fetchedAt: Date.now(),
                });
            }
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    useEffect(() => {
        async function loadInitialData() {
            try {
                const [authRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetchStats(),
                ]);

                const authData = await authRes.json();
                if (authData.success) {
                    setOrgName(authData.response.organizationName);
                }
            } catch (err) {
                console.error("Initialization error:", err);
            }
        }
        loadInitialData();
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
        fetchStats(true);
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

            incidentCache.clear();
            await fetchStats(true);

            setIsModalOpen(false);
        } catch (err) {
            console.error("Network error creating incident:", err);
        }
    };

    const handleDeleteIncident = (deletedIncidentId: string) => {
        incidentCache.clear();
        setIncidents((prev) =>
            prev.filter((inc) => inc._id !== deletedIncidentId),
        );
        fetchStats(true);
    };

    return (
        <div className="min-h-screen pb-12 font-sans text-slate-900 bg-[#f8f9fc]">
            {orgName && (
                <Header
                    onNewIncidentClick={() => setIsModalOpen(true)}
                    onGenerateBriefingClick={() => setIsBriefingModalOpen(true)}
                    organizationName={orgName}
                />
            )}

            <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">
                <div className="space-y-4">
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
                    onDelete={handleDeleteIncident}
                />
            </main>

            <NewIncidentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveIncident}
            />

            <ShiftBriefingModal
                isOpen={isBriefingModalOpen}
                onClose={() => setIsBriefingModalOpen(false)}
            />

            <div className="fixed bottom-6 right-6 z-50">
                <SignOutButton />
            </div>
        </div>
    );
}
