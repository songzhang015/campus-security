import IntroAnimation from "@/src/components/dashboard/IntroAnimation";
import Dashboard from "@/src/components/dashboard/Dashboard";

export default function DashboardPage() {
	return (
		<IntroAnimation
			orgName="University of Oregon"
			orgLogoSrc="/uo-logo.png"
			orgLogoAltSrc="/uo-logo-alt.png"
			companyLogoSrc="/campus-security.png"
		>
			<Dashboard />
		</IntroAnimation>
	);
}
