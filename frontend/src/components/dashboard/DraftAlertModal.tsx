import React, { useState, useEffect } from "react";
import { Copy, Check, Loader2, X, AlertTriangle } from "lucide-react";
import { PriorityLevel, IncidentType, IncidentCategory } from "./types";

interface DraftAlertModalProps {
	isOpen: boolean;
	onClose: () => void;
	incidentData: {
		description: string;
		location: string;
		priority: PriorityLevel;
		type: IncidentType;
		category: IncidentCategory | "OTHER";
	};
}

export default function DraftAlertModal({
	isOpen,
	onClose,
	incidentData,
}: DraftAlertModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [drafts, setDrafts] = useState<{
		sms_draft: string;
		email_draft: string;
	} | null>(null);
	const [error, setError] = useState("");
	const [copiedSms, setCopiedSms] = useState(false);
	const [copiedEmail, setCopiedEmail] = useState(false);

	useEffect(() => {
		if (!isOpen) return;

		const fetchDrafts = async () => {
			setIsLoading(true);
			setError("");
			try {
				const res = await fetch("/api/ai/alert", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ incident: incidentData }),
				});
				const data = await res.json();

				if (data.success) {
					setDrafts(data.response);
				} else {
					setError(data.response || "Failed to generate drafts.");
				}
			} catch (err) {
				setError("Network error generating alert.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchDrafts();
	}, [isOpen]);

	const handleCopy = async (text: string, type: "sms" | "email") => {
		await navigator.clipboard.writeText(text);
		if (type === "sms") {
			setCopiedSms(true);
			setTimeout(() => setCopiedSms(false), 2000);
		} else {
			setCopiedEmail(true);
			setTimeout(() => setCopiedEmail(false), 2000);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[550px] animate-in slide-in-from-left-4 duration-300">
			<div className="px-5 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
				<div className="flex items-center gap-2 text-red-800 font-bold">
					<AlertTriangle size={18} />
					<h3>Emergency Alert Drafts</h3>
				</div>
				<button
					onClick={onClose}
					className="text-red-400 hover:text-red-700 cursor-pointer"
				>
					<X size={20} />
				</button>
			</div>

			<div className="p-5 flex-1 overflow-y-auto bg-slate-50 space-y-6">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
						<Loader2 size={24} className="animate-spin text-red-600" />
						<p className="text-sm font-medium">Drafting alert protocols...</p>
					</div>
				) : error ? (
					<div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
						{error}
					</div>
				) : drafts ? (
					<>
						{/* SMS SECTION */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
									SMS Blast
								</label>
								<button
									onClick={() => handleCopy(drafts.sms_draft, "sms")}
									className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm cursor-pointer transition-colors"
								>
									{copiedSms ? (
										<Check size={14} className="text-green-600" />
									) : (
										<Copy size={14} />
									)}
									Copy
								</button>
							</div>
							<div className="p-3 bg-white border border-slate-200 rounded-md text-sm text-slate-800 font-medium">
								{drafts.sms_draft}
							</div>
						</div>

						{/* EMAIL SECTION */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
									Email Communication
								</label>
								<button
									onClick={() => handleCopy(drafts.email_draft, "email")}
									className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm cursor-pointer transition-colors"
								>
									{copiedEmail ? (
										<Check size={14} className="text-green-600" />
									) : (
										<Copy size={14} />
									)}
									Copy
								</button>
							</div>
							<div className="p-3 bg-white border border-slate-200 rounded-md text-sm text-slate-700 whitespace-pre-wrap leading-relaxed h-48 overflow-y-auto">
								{drafts.email_draft}
							</div>
						</div>
					</>
				) : null}
			</div>
		</div>
	);
}
