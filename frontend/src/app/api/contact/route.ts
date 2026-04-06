import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const payload = {
			university: body.university,
			name: body.name,
			email: body.email,
			phone: body.phone,
			dispatchSystem: body.dispatchSystem,
			incidents: body.incidents,
			comments: body.comments,
		};

		const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

		const res = await fetch(`${backendUrl}/api/inquiries`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		const data = await res.json();

		return NextResponse.json(data, { status: res.status });
	} catch (err) {
		return NextResponse.json(
			{ response: "Internal server error." },
			{ status: 500 },
		);
	}
}
