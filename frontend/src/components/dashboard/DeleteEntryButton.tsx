"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { resetDashboardCaches } from "./dashboardCache";

interface DeleteEntryButtonProps {
    incidentId: string;
    onDeleted?: () => void;
}

export default function DeleteEntryButton({
    incidentId,
    onDeleted,
}: DeleteEntryButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this incident?",
        );

        if (!confirmed) return;

        setIsDeleting(true);

        try {
            const res = await fetch(`/api/incidents/${incidentId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                console.error("Delete failed:", data.response);
                return;
            }

            resetDashboardCaches();

            if (onDeleted) {
                onDeleted?.();
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
            className="cursor-pointer"
        >
            <Trash2 size={14} />
            Delete
        </Button>
    );
}
