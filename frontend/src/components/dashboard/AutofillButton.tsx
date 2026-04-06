import { useState } from "react";
import { Sparkles } from "lucide-react";

interface AutofillResult {
	priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	type: "CAMPUS_SECURITY" | "POLICE" | "MEDICAL" | "MAINTENANCE" | "RESIDENCE";
	category:
		| "NOISE_COMPLAINT"
		| "TRESPASSING"
		| "THEFT"
		| "PROPERTY_DAMAGE"
		| "WEAPON"
		| "HARASSMENT"
		| "SUSPICIOUS_PERSON"
		| "INJURY"
		| "MISCONDUCT"
		| "FIRE_ALARM"
		| "PLUMBING_ISSUE"
		| "OTHER";
	short_desc: string;
}

interface AutofillButtonProps {
	description: string;
	onAutofill: (result: AutofillResult) => void;
}

export default function AutofillButton({
	description,
	onAutofill,
}: AutofillButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async () => {
		if (isLoading || description.length < 10) return;
		setIsLoading(true);

		try {
			const res = await fetch("/api/ai/parse", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ description }),
			});

			if (!res.ok) return;

			const data = await res.json();
			if (data.success && data.response) {
				onAutofill(data.response as AutofillResult);
			}
		} catch {
			// Silently fail — user keeps their current selections
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleClick}
			disabled={description.length < 10 || isLoading}
			className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1a237e] border border-[#1a237e]/30 rounded-md hover:bg-[#1a237e]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
		>
			<Sparkles size={13} className={isLoading ? "animate-pulse" : ""} />
			{isLoading ? "Analyzing..." : "Autofill"}
		</button>
	);
}
