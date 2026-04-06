import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("session_jwt")?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, response: "Unauthorized." },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

		const res = await fetch(
			`${backendUrl}/api/incidents?${searchParams.toString()}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			},
		);

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch {
		return NextResponse.json(
			{ success: false, response: "Internal server error." },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const cookieStore = await cookies();
		const token = cookieStore.get("session_jwt")?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, response: "Unauthorized." },
				{ status: 401 },
			);
		}

		const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

		const res = await fetch(`${backendUrl}/api/incidents`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(body),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch {
		return NextResponse.json(
			{ response: "Internal server error." },
			{ status: 500 },
		);
	}
}
