"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Contact() {
	const router = useRouter();

	return (
		<motion.div
			key="contact-form"
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
		>
			<div className="w-full max-w-lg bg-white border border-gray-300 rounded-md p-8">
				<Image
					src="/campus-security.png"
					width={42}
					height={42}
					alt="Campus Security"
					onClick={() => router.push("/")}
					className="cursor-pointer mx-auto mb-2"
				/>

				<h1 className="text-xl text-center font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">
					Contact
				</h1>

				<form className="flex flex-col gap-4 text-sm">
					<div className="flex flex-col gap-1.5">
						<label htmlFor="university" className="text-gray-700">
							University
						</label>
						<input
							type="text"
							id="university"
							name="university"
							placeholder="University of Oregon"
							className="w-full p-2.5 text-gray-900 bg-transparent border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label htmlFor="name" className="text-gray-700">
							Contact Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							placeholder="John Doe"
							className="w-full p-2.5 text-gray-900 bg-transparent border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label htmlFor="email" className="text-gray-700">
							Email Address
						</label>
						<input
							type="email"
							id="email"
							name="email"
							placeholder="johndoe@email.com"
							className="w-full p-2.5 text-gray-900 bg-transparent border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label htmlFor="phone" className="text-gray-700">
							Phone Number
						</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							placeholder="(123) 456-7890"
							className="w-full p-2.5 text-gray-900 bg-transparent border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label htmlFor="dispatchSystem" className="text-gray-700">
							Current Dispatch System
						</label>
						<input
							type="text"
							id="dispatchSystem"
							name="dispatchSystem"
							placeholder="Excel, Pen & Paper, Older Software"
							className="w-full p-2.5 text-gray-900 bg-transparent border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label htmlFor="incidents" className="text-gray-700">
							Estimated Daily Incidents
						</label>
						<select
							id="incidents"
							name="incidents"
							defaultValue=""
							className="w-full p-2.5 text-gray-900 bg-transparent border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors appearance-none"
						>
							<option value="" disabled>
								Select an estimate
							</option>
							<option value="<20">&lt; 20</option>
							<option value="20-50">20 - 50</option>
							<option value="51-100">51-100</option>
							<option value="100+">100+</option>
						</select>
					</div>

					<div className="flex flex-col gap-1.5">
						<label htmlFor="comments" className="text-gray-700">
							Comments
						</label>
						<textarea
							id="comments"
							name="comments"
							rows={5}
							className="w-full p-2.5 text-gray-900 bg-transparent border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-y"
						></textarea>
					</div>

					<button
						type="submit"
						className="mt-4 w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-sm hover:bg-gray-800 focus:outline-none
						focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition cursor-pointer duration-300 hover:-translate-y-[3px]"
					>
						Send Inquiry
					</button>
				</form>
			</div>
		</motion.div>
	);
}
