import { ClipboardList } from "lucide-react";

interface GenerateBriefingButtonProps {
    onClick: () => void;
}

export default function GenerateBriefingButton({
    onClick,
}: GenerateBriefingButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border
			border-slate-300 px-4 py-2.5 rounded-md text-sm font-medium transition duration-300
			hover:-translate-y-0.5 cursor-pointer"
        >
            <ClipboardList size={18} />
            Shift Briefing
        </button>
    );
}
