"use client";

import React, { useState, useEffect } from "react";
import { User, Plus } from "lucide-react";

interface HeaderProps {
	onNewIncidentClick: () => void;
}

export default function Header({ onNewIncidentClick }: HeaderProps) {
	const [currentTime, setCurrentTime] = useState<string>("");

	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			setCurrentTime(
				now.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					timeZoneName: "short",
				}),
			);
		};
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
			<div className="flex-1">
				<h1 className="text-xl font-bold tracking-widest text-[#1a237e]">
					CAMPUS SAFETY
				</h1>
			</div>

			<div className="flex-1 text-center font-medium text-slate-800 text-lg">
				{currentTime || "Loading time..."}
			</div>

			<div className="flex-1 flex items-center justify-end gap-6">
				<button
					onClick={onNewIncidentClick}
					className="flex items-center gap-2 bg-[#1a237e] hover:bg-[#121858] text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
				>
					<Plus size={18} />
					New Incident
				</button>

				<div className="flex items-center gap-3">
					<span className="text-sm font-medium text-slate-700">
						University of Oregon
					</span>
					<div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
						<User size={18} className="text-slate-600" />
					</div>
				</div>
			</div>
		</header>
	);
}
