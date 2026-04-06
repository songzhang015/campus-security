import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

		const res = await fetch(`${backendUrl}/api/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				connect_code: body.accessCode,
				password: body.password,
			}),
		});

		const data = await res.json();

		if (data.success && data.response?.token) {
			const cookieStore = await cookies();

			cookieStore.set({
				name: "session_jwt",
				value: data.response.token,
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24,
			});

			delete data.response.token;
		}

		return NextResponse.json(data, { status: res.status });
	} catch (err) {
		return NextResponse.json(
			{ response: "Internal server error." },
			{ status: 500 },
		);
	}
}
