import { DashboardStats } from "../types";

const cards = [
    {
        key: "highCritical" as const,
        label: "Unresolved High / Critical",
        accent: "border-l-red-500",
    },
    {
        key: "untouched" as const,
        label: "Pending Incidents",
        accent: "border-l-orange-500",
    },
    {
        key: "dispatched" as const,
        label: "Dispatched Incidents",
        accent: "border-l-blue-500",
    },
    {
        key: "resolved" as const,
        label: "Resolved Incidents",
        accent: "border-l-emerald-500",
    },
];

export default function StatCards({ stats }: { stats: DashboardStats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {cards.map(({ key, label, accent }) => (
                <div
                    key={key}
                    className={`bg-white px-6 py-6 rounded-xl shadow-sm border border-slate-100
					border-l-4 ${accent} transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md`}
                >
                    <h3 className="text-xs font-bold text-slate-500/80 tracking-wider uppercase mb-2">
                        {label}
                    </h3>
                    <p className="text-5xl font-bold text-black">
                        {stats[key].toString().padStart(2, "0")}
                    </p>
                </div>
            ))}
        </div>
    );
}
