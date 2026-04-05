import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
	Incident,
	PriorityLevel,
	IncidentType,
	IncidentCategory,
	IncidentStatus,
} from "./types";
import { Button } from "./button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "./sheet";

// Extended interface to handle the new fields for the side sheet
export interface ExtendedIncident extends Incident {
	assigned?: string;
	dispatchedAt?: string;
	resolvedAt?: string;
	notes?: string;
}

interface IncidentTableProps {
	incidents: Incident[];
	onUpdate?: (updatedIncident: ExtendedIncident) => void;
}

// Helper to format timestamps nicely
const formatTime = (isoString?: string) => {
	if (!isoString) return "";
	return new Date(isoString).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
	});
};

export default function IncidentTable({
	incidents,
	onUpdate,
}: IncidentTableProps) {
	// --- Table & Filter State ---
	const [openDropdown, setOpenDropdown] = useState<
		"status" | "priority" | "time" | "rows" | null
	>(null);

	const [selectedStatus, setSelectedStatus] = useState("All");
	const [selectedPriority, setSelectedPriority] = useState("High");
	const [selectedTime, setSelectedTime] = useState("Last 24h");
	const [rowsPerPage, setRowsPerPage] = useState<number>(10);

	const filtersRef = useRef<HTMLDivElement>(null);
	const paginationRef = useRef<HTMLDivElement>(null);

	// --- Side Sheet State ---
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [activeIncident, setActiveIncident] = useState<ExtendedIncident | null>(
		null,
	);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				filtersRef.current &&
				!filtersRef.current.contains(target) &&
				paginationRef.current &&
				!paginationRef.current.contains(target)
			) {
				setOpenDropdown(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getPriorityStyles = (priority: string) => {
		switch (priority) {
			case "CRITICAL":
			case "HIGH":
				return "bg-red-100 text-red-800";
			case "MEDIUM":
				return "bg-orange-100 text-orange-800";
			case "LOW":
				return "bg-slate-100 text-slate-600";
			default:
				return "bg-slate-100 text-slate-600";
		}
	};

	const getStatusIndicator = (status: string) => {
		switch (status) {
			case "DISPATCHED":
				return <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>;
			case "RESOLVED":
				return (
					<span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
				);
			case "PENDING":
				return (
					<span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
				);
			default:
				return <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>;
		}
	};

	const toggleDropdown = (
		dropdown: "status" | "priority" | "time" | "rows",
	) => {
		setOpenDropdown(openDropdown === dropdown ? null : dropdown);
	};

	// Generic type <T> replaces 'any' and ensures strict type safety
	const handleSelect = <T,>(
		setter: React.Dispatch<React.SetStateAction<T>>,
		value: T,
	) => {
		setter(value);
		setOpenDropdown(null);
	};

	// --- Side Sheet Handlers ---
	const handleRowClick = (incident: Incident) => {
		setActiveIncident({ ...incident }); // Clone to avoid direct mutation
		setIsSheetOpen(true);
	};

	const handleSheetChange = (field: keyof ExtendedIncident, value: string) => {
		if (activeIncident) {
			setActiveIncident({ ...activeIncident, [field]: value });
		}
	};

	const handleSaveSheet = () => {
		if (activeIncident && onUpdate) {
			onUpdate(activeIncident);
		}
		setIsSheetOpen(false);
	};

	// --- Workflow Toggle Handlers ---
	const handleDispatchToggle = (checked: boolean) => {
		if (!activeIncident) return;

		if (checked) {
			setActiveIncident({
				...activeIncident,
				// Only change status to DISPATCHED if it's not already RESOLVED
				status:
					activeIncident.status === "RESOLVED" ? "RESOLVED" : "DISPATCHED",
				dispatchedAt: activeIncident.dispatchedAt || new Date().toISOString(),
			});
		} else {
			// If un-dispatching, reset back to pending (unless it's already resolved)
			setActiveIncident({
				...activeIncident,
				status: activeIncident.status === "RESOLVED" ? "RESOLVED" : "PENDING",
				dispatchedAt: undefined,
				assigned: "",
			});
		}
	};

	const handleResolveToggle = (checked: boolean) => {
		if (!activeIncident) return;

		if (checked) {
			setActiveIncident({
				...activeIncident,
				status: "RESOLVED",
				resolvedAt: activeIncident.resolvedAt || new Date().toISOString(),
			});
		} else {
			// If un-resolving, fall back to dispatched (if it has a dispatched time) or pending
			setActiveIncident({
				...activeIncident,
				status: activeIncident.dispatchedAt ? "DISPATCHED" : "PENDING",
				resolvedAt: undefined,
			});
		}
	};

	// Derived state for the checkboxes
	const isDispatched = !!activeIncident?.dispatchedAt;
	const isResolved = activeIncident?.status === "RESOLVED";

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			{/* Header */}
			<div
				ref={filtersRef}
				className="px-6 py-4 border-b border-slate-100 flex gap-4 bg-slate-50/50 relative justify-between"
			>
				<div className="flex items-center gap-4">
					<h1 className=" font-semibold text-xl">Incident Feed</h1>
				</div>

				{/* Filters */}
				<div className="flex gap-4">
					{" "}
					{/* Status Dropdown */}
					<div className="relative">
						<button
							onClick={() => toggleDropdown("status")}
							className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium transition-colors cursor-pointer"
						>
							Status: {selectedStatus} <ChevronDown size={14} />
						</button>

						{openDropdown === "status" && (
							<div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
								{["All", "Pending", "Dispatched", "Resolved"].map((option) => (
									<button
										key={option}
										onClick={() => handleSelect(setSelectedStatus, option)}
										className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
									>
										{option}
									</button>
								))}
							</div>
						)}
					</div>
					{/* Priority Dropdown */}
					<div className="relative">
						<button
							onClick={() => toggleDropdown("priority")}
							className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium transition-colors cursor-pointer"
						>
							Priority: {selectedPriority} <ChevronDown size={14} />
						</button>

						{openDropdown === "priority" && (
							<div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
								{["All", "Critical", "High", "Medium", "Low"].map((option) => (
									<button
										key={option}
										onClick={() => handleSelect(setSelectedPriority, option)}
										className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
									>
										{option}
									</button>
								))}
							</div>
						)}
					</div>
					{/* Time Dropdown */}
					<div className="relative">
						<button
							onClick={() => toggleDropdown("time")}
							className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium transition-colors cursor-pointer"
						>
							Time: {selectedTime} <ChevronDown size={14} />
						</button>

						{openDropdown === "time" && (
							<div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
								{["Last 24h", "Last 7 Days", "Last 30 Days", "All Time"].map(
									(option) => (
										<button
											key={option}
											onClick={() => handleSelect(setSelectedTime, option)}
											className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
										>
											{option}
										</button>
									),
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm whitespace-nowrap">
					<thead>
						<tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
							<th className="px-6 py-4">Priority</th>
							<th className="px-6 py-4">ID</th>
							<th className="px-6 py-4">Category</th>
							<th className="px-6 py-4">Location</th>
							<th className="px-6 py-4">Status</th>
							<th className="px-6 py-4 w-full">Desc</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{incidents.map((incident) => (
							<tr
								key={incident.id}
								onClick={() => handleRowClick(incident)}
								className="hover:bg-slate-50 transition-colors cursor-pointer"
							>
								<td className="px-6 py-4">
									<span
										className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${getPriorityStyles(incident.priority)}`}
									>
										{incident.priority}
									</span>
								</td>
								<td className="px-6 py-4 text-slate-500">{incident.id}</td>
								<td className="px-6 py-4 font-semibold text-slate-900">
									{incident.category.replace("_", " ")}
								</td>
								<td className="px-6 py-4 text-slate-600">
									{incident.location}
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center text-xs font-bold text-slate-700 tracking-wider uppercase">
										{getStatusIndicator(incident.status)}
										{incident.status}
									</div>
								</td>
								<td className="px-6 py-4 text-slate-500 truncate max-w-xs">
									{incident.short_desc || incident.description}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div
				ref={paginationRef}
				className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50"
			>
				<div className="flex items-center gap-4 relative">
					<span>1 of 7 (23)</span>
					<button
						onClick={() => toggleDropdown("rows")}
						className="flex items-center gap-1 font-medium hover:text-slate-900 transition-colors cursor-pointer"
					>
						{rowsPerPage} <ChevronDown size={14} />
					</button>

					{openDropdown === "rows" && (
						<div className="absolute bottom-full left-16 mb-1 w-20 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
							{[10, 20, 50].map((option) => (
								<button
									key={option}
									onClick={() => handleSelect(setRowsPerPage, option)}
									className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
								>
									{option}
								</button>
							))}
						</div>
					)}
				</div>
				<div className="flex items-center gap-4">
					<button className="p-1 hover:text-slate-900 transition-colors cursor-pointer">
						<ChevronLeft size={18} />
					</button>
					<button className="p-1 hover:text-slate-900 transition-colors cursor-pointer">
						<ChevronRight size={18} />
					</button>
				</div>
			</div>

			{/* Editing Side Sheet */}
			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetContent
					className="w-full sm:max-w-xl overflow-y-auto bg-white"
					side="right"
				>
					<SheetHeader>
						<SheetTitle className="flex items-center gap-3">
							Edit Incident {activeIncident?.id}
							<span
								className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${getPriorityStyles(activeIncident?.priority || "LOW")}`}
							>
								{activeIncident?.status}
							</span>
						</SheetTitle>
					</SheetHeader>

					{activeIncident && (
						<div className="flex flex-col gap-6 p-6">
							{/* SECTION 1: Core Details */}
							<div className="space-y-4">
								<h3 className="text-sm font-bold text-slate-800 border-b pb-2">
									1. Incident Details
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="flex flex-col gap-1.5">
										<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
											Priority
										</label>
										<select
											value={activeIncident.priority}
											onChange={(e) =>
												handleSheetChange("priority", e.target.value)
											}
											className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
										>
											<option value="LOW">Low</option>
											<option value="MEDIUM">Medium</option>
											<option value="HIGH">High</option>
											<option value="CRITICAL">Critical</option>
										</select>
									</div>
									<div className="flex flex-col gap-1.5">
										<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
											Type
										</label>
										<select
											value={activeIncident.type}
											onChange={(e) =>
												handleSheetChange("type", e.target.value)
											}
											className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
										>
											<option value="CAMPUS_SECURITY">Campus Security</option>
											<option value="POLICE">Police</option>
											<option value="MEDICAL">Medical</option>
											<option value="MAINTENANCE">Maintenance</option>
											<option value="RESIDENCE">Residence</option>
										</select>
									</div>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Category
									</label>
									<select
										value={activeIncident.category}
										onChange={(e) =>
											handleSheetChange("category", e.target.value)
										}
										className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
									>
										<option value="NOISE_COMPLAINT">Noise Complaint</option>
										<option value="TRESPASSING">Trespassing</option>
										<option value="THEFT">Theft</option>
										<option value="PROPERTY_DAMAGE">Property Damage</option>
										<option value="WEAPON">Weapon</option>
										<option value="HARASSMENT">Harassment</option>
										<option value="SUSPICIOUS_PERSON">Suspicious Person</option>
										<option value="INJURY">Injury</option>
										<option value="MISCONDUCT">Misconduct</option>
										<option value="OTHER">Other</option>
									</select>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Location
									</label>
									<input
										type="text"
										value={activeIncident.location}
										onChange={(e) =>
											handleSheetChange("location", e.target.value)
										}
										className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
									/>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Short Description
									</label>
									<input
										type="text"
										value={activeIncident.short_desc || ""}
										onChange={(e) =>
											handleSheetChange("short_desc", e.target.value)
										}
										className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
									/>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Full Description
									</label>
									<textarea
										value={activeIncident.description}
										onChange={(e) =>
											handleSheetChange("description", e.target.value)
										}
										rows={2}
										className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none resize-y"
									/>
								</div>
							</div>

							{/* SECTION 2: Dispatch Workflow */}
							<div className="space-y-4">
								<h3 className="text-sm font-bold text-slate-800 border-b pb-2">
									2. Action & Dispatch
								</h3>

								{/* Dispatch Block */}
								<div
									className={`p-4 border rounded-lg transition-colors ${isDispatched ? "bg-[#1a237e]/5 border-[#1a237e]/20" : "bg-slate-50 border-slate-200"}`}
								>
									<label className="flex items-center gap-3 cursor-pointer mb-3">
										<input
											type="checkbox"
											checked={isDispatched}
											onChange={(e) => handleDispatchToggle(e.target.checked)}
											className="w-4 h-4 text-[#1a237e] rounded border-slate-300 focus:ring-[#1a237e] cursor-pointer"
										/>
										<span className="font-semibold text-slate-800">
											Unit Dispatched?
										</span>
									</label>

									<div className="pl-7">
										<input
											type="text"
											placeholder="Assign to (e.g. Unit 4)..."
											disabled={!isDispatched}
											value={activeIncident.assigned || ""}
											onChange={(e) =>
												handleSheetChange("assigned", e.target.value)
											}
											className="w-full p-2 text-sm border border-slate-200 rounded-md bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#1a237e] focus:outline-none transition-all"
										/>
									</div>
								</div>

								{/* Resolve Block */}
								<div
									className={`p-4 border rounded-lg transition-colors ${isResolved ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}
								>
									<label className="flex items-center gap-3 cursor-pointer mb-3">
										<input
											type="checkbox"
											checked={isResolved}
											onChange={(e) => handleResolveToggle(e.target.checked)}
											className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
										/>
										<span className="font-semibold text-slate-800">
											Incident Resolved?
										</span>
									</label>

									<div className="pl-7">
										<textarea
											placeholder="Resolution or follow-up notes..."
											disabled={!isResolved}
											value={activeIncident.notes || ""}
											onChange={(e) =>
												handleSheetChange("notes", e.target.value)
											}
											rows={2}
											className="w-full p-2 text-sm border border-slate-200 rounded-md bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:ring-2 focus:emerald-600 focus:outline-none transition-all resize-y"
										/>
									</div>
								</div>
							</div>

							{/* SECTION 3: Timeline / Logs */}
							<div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500 space-y-2">
								<div className="flex justify-between items-center mb-1">
									<span className="uppercase tracking-wider font-semibold text-slate-600">
										Incident Timeline
									</span>
								</div>
								<div className="flex justify-between border-t border-slate-200 pt-2">
									<span>Created:</span>
									<span className="font-medium text-slate-700">
										{formatTime(activeIncident.timestamp)}
									</span>
								</div>
								{activeIncident.dispatchedAt && (
									<div className="flex justify-between">
										<span>Dispatched:</span>
										<span className="font-medium text-slate-700">
											{formatTime(activeIncident.dispatchedAt)}
										</span>
									</div>
								)}
								{activeIncident.resolvedAt && (
									<div className="flex justify-between">
										<span>Resolved:</span>
										<span className="font-medium text-slate-700">
											{formatTime(activeIncident.resolvedAt)}
										</span>
									</div>
								)}
							</div>
						</div>
					)}

					<SheetFooter className="mt-4">
						<Button
							variant="outline"
							onClick={() => setIsSheetOpen(false)}
							className=" cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSaveSheet}
							className="bg-[#1a237e] hover:bg-[#121858] cursor-pointer"
						>
							Save Changes
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}
