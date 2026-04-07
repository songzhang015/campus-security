"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import UniversityLogo from "../UniversityLogo";
import Image from "next/image";
import GenerateBriefingButton from "./GenerateBriefingButton";

interface HeaderProps {
    onNewIncidentClick: () => void;
    onGenerateBriefingClick: () => void;
    organizationName?: string;
}

export default function Header({
    onNewIncidentClick,
    onGenerateBriefingClick,
    organizationName = "Campus Security",
}: HeaderProps) {
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
            <div className="flex-1 flex items-center gap-3">
                <div onClick={() => window.location.reload()}>
                    <Image
                        src="/campus-security.png"
                        alt="Campus Security"
                        width={32}
                        height={32}
                        className="cursor-pointer hover:-translate-y-0.5 transition duration-300"
                    />
                </div>
                <h1 className="text-xl font-bold tracking-widest text-black">
                    Campus Security
                </h1>
            </div>

            <div className="flex-1 text-center font-medium text-slate-800 text-lg">
                {currentTime || "Loading time..."}
            </div>

            <div className="flex-1 flex items-center justify-end gap-6">
                <GenerateBriefingButton onClick={onGenerateBriefingClick} />
                <button
                    onClick={onNewIncidentClick}
                    className="flex items-center gap-2 bg-black hover:bg-black/90 text-white
                    px-4 py-2.5 rounded-md text-sm font-medium transition duration-300
                    hover:-translate-y-0.5 cursor-pointer"
                >
                    <Plus size={18} />
                    New Incident
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-md font-medium text-slate-700">
                        {organizationName}
                    </span>
                    <UniversityLogo organizationName={organizationName} />
                </div>
            </div>
        </header>
    );
}
