import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Incident, PaginationInfo } from "./types";
import { Button } from "./button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "./sheet";

interface IncidentTableProps {
	incidents: Incident[];
	pagination: PaginationInfo;
	selectedStatus: string;
	selectedPriority: string;
	selectedTime: string;
	onFilterChange: (status: string, priority: string, time: string) => void;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	onUpdate?: (updatedIncident: Incident) => void;
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
	pagination,
	selectedStatus,
	selectedPriority,
	selectedTime,
	onFilterChange,
	onPageChange,
	onLimitChange,
	onUpdate,
}: IncidentTableProps) {
	const [pageInput, setPageInput] = useState<string>(String(pagination.page));

	const [isFocused, setIsFocused] = useState(false);

	const handlePageInputCommit = () => {
		const parsed = parseInt(pageInput, 10);
		if (isNaN(parsed) || parsed <= 0) {
			onPageChange(1);
			setPageInput("1");
		} else if (parsed >= pagination.total_pages) {
			onPageChange(pagination.total_pages);
			setPageInput(String(pagination.total_pages));
		} else {
			onPageChange(parsed);
		}
	};

	// --- Table & Filter State ---
	const [openDropdown, setOpenDropdown] = useState<
		"status" | "priority" | "time" | "rows" | null
	>(null);

	const filtersRef = useRef<HTMLDivElement>(null);
	const paginationRef = useRef<HTMLDivElement>(null);

	// --- Side Sheet State ---
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

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

	// --- Side Sheet Handlers ---
	const handleRowClick = (incident: Incident) => {
		console.log(activeIncident);
		setActiveIncident({ ...incident }); // Clone to avoid direct mutation
		setIsSheetOpen(true);
	};

	const handleSheetChange = (field: keyof Incident, value: string) => {
		if (activeIncident) {
			setActiveIncident({ ...activeIncident, [field]: value });
		}
	};

	const handleSaveSheet = async () => {
		if (!activeIncident) return;

		try {
			const res = await fetch(`/api/incidents/${activeIncident._id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(activeIncident),
			});

			const data = await res.json();

			if (data.success && onUpdate) {
				onUpdate(data.response);
			}
		} catch (err) {
			console.error("Failed to update incident:", err);
		}

		setIsSheetOpen(false);
	};

	// --- Workflow Toggle Handlers ---
	const handleDispatchToggle = (checked: boolean) => {
		if (!activeIncident) return;
		if (checked) {
			setActiveIncident({
				...activeIncident,
				status:
					activeIncident.status === "RESOLVED" ? "RESOLVED" : "DISPATCHED",
				dispatched_at: activeIncident.dispatched_at || new Date().toISOString(),
			});
		} else {
			setActiveIncident({
				...activeIncident,
				status: activeIncident.status === "RESOLVED" ? "RESOLVED" : "PENDING",
				dispatched_at: null,
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
				resolved_at: activeIncident.resolved_at || new Date().toISOString(),
			});
		} else {
			setActiveIncident({
				...activeIncident,
				status: activeIncident.dispatched_at ? "DISPATCHED" : "PENDING",
				resolved_at: null,
			});
		}
	};

	// Derived state for the checkboxes
	const isDispatched = !!activeIncident?.dispatched_at;
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
										onClick={() => {
											onFilterChange(option, selectedPriority, selectedTime);
											setOpenDropdown(null);
										}}
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
										onClick={() => {
											onFilterChange(selectedStatus, option, selectedTime);
											setOpenDropdown(null);
										}}
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
											onClick={() => {
												onFilterChange(
													selectedStatus,
													selectedPriority,
													option,
												);
												setOpenDropdown(null);
											}}
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
							<th className="px-8 py-6">Priority</th>
							<th className="px-8 py-6">ID</th>
							<th className="px-8 py-6">Status</th>
							<th className="px-8 py-6">Category</th>
							<th className="px-8 py-6">Location</th>
							<th className="px-8 py-6">Description</th>
							<th className="px-8 py-6">Time</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{incidents.map((incident) => (
							<tr
								key={incident.id}
								onClick={() => handleRowClick(incident)}
								className="hover:bg-slate-50 transition-colors cursor-pointer"
							>
								<td className="px-8 py-6">
									<span
										className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${getPriorityStyles(incident.priority)}`}
									>
										{incident.priority}
									</span>
								</td>
								<td className="px-8 py-6 text-slate-500">{incident.id}</td>
								<td className="px-8 py-6">
									<div className="flex items-center text-xs font-bold text-slate-700 tracking-wider uppercase">
										{getStatusIndicator(incident.status)}
										{incident.status}
									</div>
								</td>
								<td className="px-8 py-6 font-semibold text-slate-900">
									{incident.category.replace(/_/g, " ")}
								</td>
								<td className="px-8 py-6 text-slate-600">
									{incident.location}
								</td>
								<td className="px-8 py-6 text-slate-500 truncate max-w-xs">
									{incident.short_desc || incident.description}
								</td>
								<td className="px-8 py-5 text-slate-400 text-xs whitespace-nowrap">
									{new Date(incident.created_at).toLocaleString("en-US", {
										month: "short",
										day: "numeric",
										hour: "numeric",
										minute: "2-digit",
									})}
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
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span>Page</span>
						<input
							type="number"
							min={1}
							max={pagination.total_pages}
							value={isFocused ? pageInput : pagination.page}
							onChange={(e) => setPageInput(e.target.value)}
							onFocus={() => {
								setPageInput(String(pagination.page));
								setIsFocused(true);
							}}
							onBlur={() => {
								setIsFocused(false);
								handlePageInputCommit();
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") e.currentTarget.blur();
							}}
							className="w-10 text-center text-sm font-medium border border-slate-200 rounded-md px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#1a237e] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						/>
						<span>
							of {pagination.total_pages} ({pagination.total})
						</span>
					</div>

					<div className="relative">
						<button
							onClick={() => toggleDropdown("rows")}
							className="flex items-center gap-1 font-medium hover:text-slate-900 transition-colors cursor-pointer"
						>
							{pagination.limit} rows <ChevronDown size={14} />
						</button>

						{openDropdown === "rows" && (
							<div className="absolute bottom-full left-0 mb-1 w-20 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
								{[10, 20, 50].map((option) => (
									<button
										key={option}
										onClick={() => {
											onLimitChange(option);
											setOpenDropdown(null);
										}}
										className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
									>
										{option}
									</button>
								))}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-4">
					<button
						onClick={() => onPageChange(pagination.page - 1)}
						disabled={pagination.page <= 1}
						className="p-1 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
					>
						<ChevronLeft size={18} />
					</button>
					<button
						onClick={() => onPageChange(pagination.page + 1)}
						disabled={pagination.page >= pagination.total_pages}
						className="p-1 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
					>
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
										Description
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
											value={activeIncident.follow_up || ""}
											onChange={(e) =>
												handleSheetChange("follow_up", e.target.value)
											}
											rows={2}
											className="w-full p-2 text-sm border border-slate-200 rounded-md bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:ring-2 focus:outline-none transition-all resize-y"
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
										{formatTime(activeIncident.created_at)}
									</span>
								</div>
								{activeIncident.dispatched_at && (
									<div className="flex justify-between">
										<span>Dispatched:</span>
										<span className="font-medium text-slate-700">
											{formatTime(activeIncident.dispatched_at)}
										</span>
									</div>
								)}
								{activeIncident.resolved_at && (
									<div className="flex justify-between">
										<span>Resolved:</span>
										<span className="font-medium text-slate-700">
											{formatTime(activeIncident.resolved_at)}
										</span>
									</div>
								)}
							</div>
						</div>
					)}

					<SheetFooter className="mt-4">
						<Button
							onClick={handleSaveSheet}
							className="bg-[#1a237e] hover:bg-[#121858] cursor-pointer"
						>
							Save Changes
						</Button>
						<Button
							variant="outline"
							onClick={() => setIsSheetOpen(false)}
							className="cursor-pointer"
						>
							Cancel
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}
