import Image from "next/image";
import { User } from "lucide-react";
import { getOrgAssets } from "@/src/lib/orgConfig";

interface UniversityLogoProps {
    organizationName: string;
}

export default function UniversityLogo({
    organizationName,
}: UniversityLogoProps) {
    const orgDetails = getOrgAssets(organizationName);

    if (!orgDetails.link) {
        return <User size={18} className="text-slate-600" />;
    }

    return (
        <a href={orgDetails.link} target="_blank" rel="noopener noreferrer">
            <Image
                src={orgDetails.logoSrc}
                alt={`${orgDetails.name} Logo`}
                width={32}
                height={32}
                className="object-contain mb-[3px] hover:-translate-y-0.5 transition duration-300"
                priority
            />
        </a>
    );
}
