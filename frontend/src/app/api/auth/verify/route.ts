import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

		const res = await fetch(`${backendUrl}/api/auth/verify`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				connect_code: body.accessCode,
			}),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (err) {
		return NextResponse.json(
			{
				response: "Internal server error.",
			},
			{ status: 500 },
		);
	}
}
