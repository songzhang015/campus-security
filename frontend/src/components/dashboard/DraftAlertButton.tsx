import React from "react";
import { Megaphone } from "lucide-react";

interface DraftAlertButtonProps {
	onClick: () => void;
}

export default function DraftAlertButton({ onClick }: DraftAlertButtonProps) {
	return (
		<button
			onClick={onClick}
			className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
		>
			<Megaphone size={16} />
			Draft Alert
		</button>
	);
}
