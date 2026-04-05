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
			case "EN ROUTE":
				return <span className="w-2 h-2 rounded-full bg-[#1a237e] mr-2"></span>;
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

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			{/* Filters Bar */}
			<div
				ref={filtersRef}
				className="px-6 py-4 border-b border-slate-100 flex gap-4 bg-slate-50/50 relative"
			>
				{/* Status Dropdown */}
				<div className="relative">
					<button
						onClick={() => toggleDropdown("status")}
						className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium transition-colors"
					>
						Status: {selectedStatus}{" "}
						<ChevronDown
							size={14}
							className={`transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`}
						/>
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
						className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium transition-colors"
					>
						Priority: {selectedPriority}{" "}
						<ChevronDown
							size={14}
							className={`transition-transform ${openDropdown === "priority" ? "rotate-180" : ""}`}
						/>
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
						className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium transition-colors"
					>
						Time: {selectedTime}{" "}
						<ChevronDown
							size={14}
							className={`transition-transform ${openDropdown === "time" ? "rotate-180" : ""}`}
						/>
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
						className="flex items-center gap-1 font-medium hover:text-slate-900 transition-colors"
					>
						{rowsPerPage}{" "}
						<ChevronDown
							size={14}
							className={`transition-transform ${openDropdown === "rows" ? "rotate-180" : ""}`}
						/>
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
					<button className="p-1 hover:text-slate-900 transition-colors">
						<ChevronLeft size={18} />
					</button>
					<button className="p-1 hover:text-slate-900 transition-colors">
						<ChevronRight size={18} />
					</button>
				</div>
			</div>

			{/* Editing Side Sheet */}
			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetContent
					className="w-full sm:max-w-md overflow-y-auto bg-white"
					side="right"
				>
					<SheetHeader>
						<SheetTitle>Edit Incident {activeIncident?.id}</SheetTitle>
					</SheetHeader>

					{activeIncident && (
						<div className="flex flex-col gap-5 py-6">
							<div className="grid grid-cols-2 gap-4">
								{/* Priority */}
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Priority
									</label>
									<select
										value={activeIncident.priority}
										onChange={(e) =>
											handleSheetChange("priority", e.target.value)
										}
										className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
									>
										<option value="LOW">Low</option>
										<option value="MEDIUM">Medium</option>
										<option value="HIGH">High</option>
										<option value="CRITICAL">Critical</option>
									</select>
								</div>
								{/* Status */}
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Status
									</label>
									<select
										value={activeIncident.status}
										onChange={(e) =>
											handleSheetChange("status", e.target.value)
										}
										className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
									>
										<option value="PENDING">Open (Pending)</option>
										<option value="DISPATCHED">Dispatched</option>
										<option value="RESOLVED">Resolved</option>
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								{/* Type */}
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Type
									</label>
									<select
										value={activeIncident.type}
										onChange={(e) => handleSheetChange("type", e.target.value)}
										className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
									>
										<option value="CAMPUS_SECURITY">Campus Security</option>
										<option value="POLICE">Police</option>
										<option value="MEDICAL">Medical</option>
										<option value="MAINTENANCE">Maintenance</option>
										<option value="RESIDENCE">Residence</option>
									</select>
								</div>
								{/* Category */}
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Category
									</label>
									<select
										value={activeIncident.category}
										onChange={(e) =>
											handleSheetChange("category", e.target.value)
										}
										className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
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
							</div>

							{/* Location */}
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
									className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
								/>
							</div>

							{/* Short Description */}
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
									className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
								/>
							</div>

							{/* Description */}
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
									Full Description
								</label>
								<textarea
									value={activeIncident.description}
									onChange={(e) =>
										handleSheetChange("description", e.target.value)
									}
									rows={3}
									className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none resize-y"
								/>
							</div>

							<hr className="border-slate-100 my-2" />

							{/* Assigned To */}
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
									Assigned Unit(s)
								</label>
								<input
									type="text"
									placeholder="e.g. Unit 4, EMS"
									value={activeIncident.assigned || ""}
									onChange={(e) =>
										handleSheetChange("assigned", e.target.value)
									}
									className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
								/>
							</div>

							{/* Timestamps */}
							<div className="grid grid-cols-2 gap-4">
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Created At
									</label>
									<input
										type="datetime-local"
										value={activeIncident.timestamp.slice(0, 16)} // slice to format for datetime-local
										onChange={(e) =>
											handleSheetChange(
												"timestamp",
												new Date(e.target.value).toISOString(),
											)
										}
										className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
									/>
								</div>
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Dispatched At
									</label>
									<input
										type="datetime-local"
										value={activeIncident.dispatchedAt || ""}
										onChange={(e) =>
											handleSheetChange("dispatchedAt", e.target.value)
										}
										className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
									/>
								</div>
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Resolved At
									</label>
									<input
										type="datetime-local"
										value={activeIncident.resolvedAt || ""}
										onChange={(e) =>
											handleSheetChange("resolvedAt", e.target.value)
										}
										className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
									/>
								</div>
							</div>

							<hr className="border-slate-100 my-2" />

							{/* Notes */}
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
									Dispatcher Notes
								</label>
								<textarea
									placeholder="Add updates or context..."
									value={activeIncident.notes || ""}
									onChange={(e) => handleSheetChange("notes", e.target.value)}
									rows={3}
									className="w-full p-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none resize-y"
								/>
							</div>
						</div>
					)}

					<SheetFooter className="mt-4">
						<Button variant="outline" onClick={() => setIsSheetOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleSaveSheet}
							className="bg-[#1a237e] hover:bg-[#121858]"
						>
							Save Changes
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}
