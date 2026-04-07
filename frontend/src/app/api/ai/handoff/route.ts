import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const hours = searchParams.get("hours") || "12";

		const cookieStore = await cookies();
		const token = cookieStore.get("session_jwt")?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, response: "Unauthorized. Please log in." },
				{ status: 401 },
			);
		}

		const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

		const res = await fetch(`${backendUrl}/api/ai/handoff?hours=${hours}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		console.error("AI Handoff Next.js Error:", error);
		return NextResponse.json(
			{ response: "Internal server error." },
			{ status: 500 },
		);
	}
}
