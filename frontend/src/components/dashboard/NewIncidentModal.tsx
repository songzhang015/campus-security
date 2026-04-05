import React, { useState } from "react";
import { PriorityLevel, IncidentType, IncidentCategory } from "./types";

interface NewIncidentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (incidentData: {
		description: string;
		location: string;
		priority: PriorityLevel;
		type: IncidentType;
		category: IncidentCategory | "OTHER";
	}) => void;
}

export default function NewIncidentModal({
	isOpen,
	onClose,
	onSave,
}: NewIncidentModalProps) {
	const [description, setDescription] = useState("");
	const [location, setLocation] = useState("");
	const [priority, setPriority] = useState<PriorityLevel>("LOW");
	const [type, setType] = useState<IncidentType>("CAMPUS_SECURITY");
	const [category, setCategory] = useState<IncidentCategory | "OTHER">("OTHER");

	if (!isOpen) return null;

	const handleSave = () => {
		onSave({ description, location, priority, type, category });
		// Reset form
		setDescription("");
		setLocation("");
		setPriority("LOW");
		setType("CAMPUS_SECURITY");
		setCategory("OTHER");
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				<div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
					<h2 className="text-lg font-bold text-slate-800">New Incident</h2>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
					>
						&times;
					</button>
				</div>

				<div className="p-6 space-y-4">
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-semibold text-slate-700">
							Description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a237e] resize-y"
							rows={3}
							placeholder="Provide brief details of the incident..."
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-semibold text-slate-700">
							Location
						</label>
						<input
							type="text"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a237e]"
							placeholder="e.g. North Hall, Room 102"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-semibold text-slate-700">
								Priority
							</label>
							<select
								value={priority}
								onChange={(e) => setPriority(e.target.value as PriorityLevel)}
								className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a237e] bg-white"
							>
								<option value="LOW">Low</option>
								<option value="MEDIUM">Medium</option>
								<option value="HIGH">High</option>
							</select>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-semibold text-slate-700">
								Type
							</label>
							<select
								value={type}
								onChange={(e) => setType(e.target.value as IncidentType)}
								className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a237e] bg-white"
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
						<label className="text-sm font-semibold text-slate-700">
							Category
						</label>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value as IncidentCategory)}
							className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a237e] bg-white"
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
							<option value="FIRE_ALARM">Fire Alarm</option>
							<option value="PLUMBING ISSUE">Plumbing Issue</option>
							<option value="OTHER">Other</option>
						</select>
					</div>
				</div>

				<div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={!description || !location}
						className="px-4 py-2 text-sm font-semibold text-white bg-[#1a237e] rounded-md hover:bg-[#121858] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Save Incident
					</button>
				</div>
			</div>
		</div>
	);
}
