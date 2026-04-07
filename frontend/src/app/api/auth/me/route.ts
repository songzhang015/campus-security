import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface SessionJwtPayload {
	org_id: string;
	org_name: string;
	exp: number;
}

export async function GET() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("session_jwt")?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, response: "Unauthorized." },
				{ status: 401 },
			);
		}

		const decoded = jwtDecode<SessionJwtPayload>(token);

		return NextResponse.json({
			success: true,
			response: {
				organizationName: decoded.org_name || "Campus Security",
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, response: "Failed to parse session token." },
			{ status: 500 },
		);
	}
}
