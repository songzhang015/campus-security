import Image from "next/image";
import { User } from "lucide-react";

interface UniversityLogoProps {
	organizationName: string;
}

export default function UniversityLogo({
	organizationName,
}: UniversityLogoProps) {
	const getLogoPath = (name: string): string | null => {
		switch (name) {
			case "University of Oregon":
				return "/uo-logo.png";
			case "Oregon State University":
				return "/osu-logo.png";
			default:
				return null;
		}
	};

	const logoSrc = getLogoPath(organizationName);

	if (!logoSrc) {
		return <User size={18} className="text-slate-600" />;
	}

	return (
		<Image
			src={logoSrc}
			alt={`${organizationName} Logo`}
			width={32}
			height={32}
			className="object-contain"
		/>
	);
}
