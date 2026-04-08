import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Incident, PaginationInfo } from "../types";
import IncidentEditSheet from "./IncidentEditSheet";

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
	onDelete?: (deletedIncidentId: string) => void;
}

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
	onDelete,
}: IncidentTableProps) {
	const [pageInput, setPageInput] = useState<string>(String(pagination.page));

	const [isFocused, setIsFocused] = useState(false);
	const [openDropdown, setOpenDropdown] = useState<
		"status" | "priority" | "time" | "rows" | null
	>(null);
	const filtersRef = useRef<HTMLDivElement>(null);
	const paginationRef = useRef<HTMLDivElement>(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			const inFilters = filtersRef.current?.contains(target);
			const inPagination = paginationRef.current?.contains(target);
			if (!inFilters && !inPagination) {
				setOpenDropdown(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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
				return <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>;
			case "RESOLVED":
				return (
					<span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
				);
			case "PENDING":
				return (
					<span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
				);
			default:
				return <span className="w-2 h-2 rounded-full bg-slate-500 mr-2"></span>;
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
		setActiveIncident({ ...incident });
		setIsSheetOpen(true);
	};

	const handleActiveIncidentChange = (updatedIncident: Incident) => {
		setActiveIncident(updatedIncident);
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-100">
			{/* Header */}
			<div
				ref={filtersRef}
				className="px-6 py-4 border-b border-slate-100 flex gap-4 bg-slate-50/50 transition relative justify-between"
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
				<table className="w-full text-left text-sm">
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
						{incidents.length === 0 ? (
							<tr>
								<td colSpan={7} className="px-8 py-16 text-center">
									<div className="flex flex-col items-center justify-center gap-2">
										<p className="text-base font-semibold text-slate-700">
											No active incidents
										</p>
										<p className="text-sm text-slate-500">
											There are currently no incidents matching your criteria.
											Adjust your filters or log a new incident.
										</p>
									</div>
								</td>
							</tr>
						) : (
							incidents.map((incident) => (
								<tr
									key={incident.id}
									onClick={() => handleRowClick(incident)}
									className="group hover:bg-slate-50 transition-colors cursor-pointer"
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
										<div className="flex items-center justify-between gap-4">
											<span>
												{new Date(incident.created_at).toLocaleString("en-US", {
													month: "short",
													day: "numeric",
													hour: "numeric",
													minute: "2-digit",
												})}
											</span>
											<ChevronRight
												size={18}
												className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"
											/>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{pagination.total >= 10 && (
				<div
					ref={paginationRef}
					className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50 rounded-b-xl"
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
			)}

			{/* Editing Side Sheet */}
			<IncidentEditSheet
				incident={activeIncident}
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
				onIncidentChange={handleActiveIncidentChange}
				onSave={onUpdate}
				onDelete={onDelete}
			/>
		</div>
	);
}
