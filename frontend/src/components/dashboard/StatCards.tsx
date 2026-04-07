import React from "react";
import { DashboardStats } from "./types";

export default function StatCards({ stats }: { stats: DashboardStats }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
			<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
				<h3 className="text-xs font-bold text-slate-500 tracking-wider mb-2">
					Unresolved High / Critical Incidents
				</h3>
				<p className="text-5xl font-bold text-[#1a237e]">
					{stats.highCritical.toString().padStart(2, "0")}
				</p>
			</div>

			<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
				<h3 className="text-xs font-bold text-slate-500 tracking-wider mb-2">
					Pending Incidents
				</h3>
				<p className="text-5xl font-bold text-[#1a237e]">
					{stats.untouched.toString().padStart(2, "0")}
				</p>
			</div>

			<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
				<h3 className="text-xs font-bold text-slate-500 tracking-wider mb-2">
					Dispatched Incidents
				</h3>
				<p className="text-5xl font-bold text-[#1a237e]">
					{stats.dispatched.toString().padStart(2, "0")}
				</p>
			</div>

			<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
				<h3 className="text-xs font-bold text-slate-500 tracking-wider mb-2">
					Resolved Incidents
				</h3>
				<p className="text-5xl font-bold text-[#1a237e]">
					{stats.resolved.toString().padStart(2, "0")}
				</p>
			</div>
		</div>
	);
}
