import IntroAnimation from "@/src/components/dashboard/IntroAnimation";
import Dashboard from "@/src/components/dashboard/Dashboard";
import { getOrgAssets } from "@/src/lib/orgConfig";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface SessionJwtPayload {
    org_id: string;
    org_name: string;
    exp: number;
}

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_jwt")?.value;

    let orgName = "Campus Security";

    if (token) {
        try {
            const decoded = jwtDecode<SessionJwtPayload>(token);
            if (decoded.org_name) {
                orgName = decoded.org_name;
            }
        } catch (error) {
            console.error("Failed to decode session token:", error);
        }
    }

    const orgAssets = getOrgAssets(orgName);

    return (
        <IntroAnimation
            orgName={orgAssets.name}
            orgLogoSrc={orgAssets.logoSrc}
            orgLogoAltSrc={orgAssets.logoAltSrc}
            companyLogoSrc="/campus-security.png"
            brandColor={orgAssets.brandColor}
        >
            <Dashboard />
        </IntroAnimation>
    );
}
