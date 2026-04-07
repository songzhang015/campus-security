import { Incident } from "../types";
import { Button } from "../button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "./sheet";
import Autocomplete from "react-google-autocomplete";
import DeleteEntryButton from "./DeleteEntryButton";

interface IncidentEditSheetProps {
    incident: Incident | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onIncidentChange: (incident: Incident) => void;
    onSave?: (updatedIncident: Incident) => void;
    onDelete?: (deletedIncidentId: string) => void;
}

const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    });
};

export default function IncidentEditSheet({
    incident,
    open,
    onOpenChange,
    onIncidentChange,
    onSave,
    onDelete,
}: IncidentEditSheetProps) {
    if (!incident) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    className="overflow-y-auto"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                />
            </Sheet>
        );
    }

    const handleSheetChange = (field: keyof Incident, value: string) => {
        onIncidentChange({ ...incident, [field]: value });
    };

    const handleSaveSheet = async () => {
        try {
            const res = await fetch(`/api/incidents/${incident._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(incident),
            });

            const data = await res.json();

            if (data.success) {
                onIncidentChange(data.response);
                onSave?.(data.response);
            }
        } catch (err) {
            console.error("Failed to update incident:", err);
        }

        onOpenChange(false);
    };

    const handleDispatchToggle = (checked: boolean) => {
        if (checked) {
            onIncidentChange({
                ...incident,
                status:
                    incident.status === "RESOLVED" ? "RESOLVED" : "DISPATCHED",
                dispatched_at:
                    incident.dispatched_at || new Date().toISOString(),
            });
        } else {
            onIncidentChange({
                ...incident,
                status: incident.status === "RESOLVED" ? "RESOLVED" : "PENDING",
                dispatched_at: null,
                assigned: "",
            });
        }
    };

    const handleResolveToggle = (checked: boolean) => {
        if (checked) {
            onIncidentChange({
                ...incident,
                status: "RESOLVED",
                resolved_at: incident.resolved_at || new Date().toISOString(),
            });
        } else {
            onIncidentChange({
                ...incident,
                status: incident.dispatched_at ? "DISPATCHED" : "PENDING",
                resolved_at: null,
            });
        }
    };

    const isDispatched = !!incident.dispatched_at;
    const isResolved = incident.status === "RESOLVED";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-3 px-2">
                        Edit Incident {incident.id}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 px-6 pb-6 pt-2">
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
                                    value={incident.priority}
                                    onChange={(e) =>
                                        handleSheetChange(
                                            "priority",
                                            e.target.value,
                                        )
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
                                    value={incident.type}
                                    onChange={(e) =>
                                        handleSheetChange(
                                            "type",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
                                >
                                    <option value="CAMPUS_SECURITY">
                                        Campus Security
                                    </option>
                                    <option value="POLICE">Police</option>
                                    <option value="MEDICAL">Medical</option>
                                    <option value="MAINTENANCE">
                                        Maintenance
                                    </option>
                                    <option value="RESIDENCE">Residence</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Category
                            </label>
                            <select
                                value={incident.category}
                                onChange={(e) =>
                                    handleSheetChange(
                                        "category",
                                        e.target.value,
                                    )
                                }
                                className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
                            >
                                <option value="NOISE_COMPLAINT">
                                    Noise Complaint
                                </option>
                                <option value="TRESPASSING">Trespassing</option>
                                <option value="THEFT">Theft</option>
                                <option value="PROPERTY_DAMAGE">
                                    Property Damage
                                </option>
                                <option value="WEAPON">Weapon</option>
                                <option value="HARASSMENT">Harassment</option>
                                <option value="SUSPICIOUS_PERSON">
                                    Suspicious Person
                                </option>
                                <option value="INJURY">Injury</option>
                                <option value="MISCONDUCT">Misconduct</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Location
                            </label>
                            <Autocomplete
                                apiKey={
                                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                                }
                                value={incident.location || ""}
                                onChange={(e) =>
                                    handleSheetChange(
                                        "location",
                                        e.target.value,
                                    )
                                }
                                onPlaceSelected={(place) => {
                                    if (place?.formatted_address) {
                                        handleSheetChange(
                                            "location",
                                            place.formatted_address,
                                        );
                                    }
                                }}
                                options={{ types: ["address"] }}
                                className="transition-all duration-300 w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
                                placeholder="1520 University St, Floor 21..."
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Description
                            </label>
                            <textarea
                                value={incident.description}
                                onChange={(e) =>
                                    handleSheetChange(
                                        "description",
                                        e.target.value,
                                    )
                                }
                                rows={2}
                                className="transition-all duration-300 w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none resize-y"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Short Description
                            </label>
                            <input
                                type="text"
                                value={incident.short_desc || ""}
                                onChange={(e) =>
                                    handleSheetChange(
                                        "short_desc",
                                        e.target.value,
                                    )
                                }
                                className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1a237e] focus:outline-none transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">
                            2. Action & Dispatch
                        </h3>

                        <div
                            className={`p-4 border rounded-lg transition-all duration-400 ease-out ${
                                isDispatched
                                    ? "bg-[#1a237e]/5 border-[#1a237e]/20"
                                    : "bg-slate-50 border-slate-200"
                            }`}
                        >
                            <label className="flex items-center gap-3 cursor-pointer mb-3">
                                <input
                                    type="checkbox"
                                    checked={isDispatched}
                                    onChange={(e) =>
                                        handleDispatchToggle(e.target.checked)
                                    }
                                    className="w-4 h-4 text-[#1a237e] rounded border-slate-300 focus:ring-[#1a237e] cursor-pointer"
                                />
                                <span className="font-semibold text-slate-800">
                                    Unit Dispatched?
                                </span>
                            </label>

                            <div className="pl-7">
                                <input
                                    type="text"
                                    placeholder="Assigned to unit 4..."
                                    disabled={!isDispatched}
                                    value={incident.assigned || ""}
                                    onChange={(e) =>
                                        handleSheetChange(
                                            "assigned",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full p-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:placeholder:text-slate-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#1a237e] focus:outline-none transition-all duration-300 ease-out"
                                />
                            </div>
                        </div>

                        <div
                            className={`p-4 border rounded-lg transition-all duration-400 ease-out ${
                                isResolved
                                    ? "bg-[#1a237e]/5 border-[#1a237e]/20"
                                    : "bg-slate-50 border-slate-200"
                            }`}
                        >
                            <label className="flex items-center gap-3 cursor-pointer mb-3">
                                <input
                                    type="checkbox"
                                    checked={isResolved}
                                    onChange={(e) =>
                                        handleResolveToggle(e.target.checked)
                                    }
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
                                    value={incident.follow_up || ""}
                                    onChange={(e) =>
                                        handleSheetChange(
                                            "follow_up",
                                            e.target.value,
                                        )
                                    }
                                    rows={2}
                                    className="w-full p-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:placeholder:text-slate-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#1a237e] focus:outline-none transition-all duration-300 ease-out"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500 space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="uppercase tracking-wider font-semibold text-slate-600">
                                Incident Timeline
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2">
                            <span>Created:</span>
                            <span className="font-medium text-slate-700">
                                {formatTime(incident.created_at)}
                            </span>
                        </div>
                        {incident.dispatched_at && (
                            <div className="flex justify-between">
                                <span>Dispatched:</span>
                                <span className="font-medium text-slate-700">
                                    {formatTime(incident.dispatched_at)}
                                </span>
                            </div>
                        )}
                        {incident.resolved_at && (
                            <div className="flex justify-between">
                                <span>Resolved:</span>
                                <span className="font-medium text-slate-700">
                                    {formatTime(incident.resolved_at)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <SheetFooter className="flex justify-between w-full px-6">
                    <div>
                        <DeleteEntryButton
                            incidentId={incident._id}
                            onDeleted={() => {
                                onOpenChange(false);
                                onDelete?.(incident._id);
                            }}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSaveSheet}
                            className="cursor-pointer"
                        >
                            Save Changes
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
