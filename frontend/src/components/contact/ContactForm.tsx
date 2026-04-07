import * as React from "react";

interface ContactFormProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const fieldClassName =
    "w-full p-2.5 text-gray-900 bg-transparent border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors";

export default function ContactForm({ onSubmit }: ContactFormProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-1.5">
                <label htmlFor="university" className="text-gray-700">
                    University
                </label>
                <input
                    type="text"
                    id="university"
                    name="university"
                    required
                    placeholder="University of Oregon"
                    className={fieldClassName}
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
                    required
                    placeholder="John Doe"
                    className={fieldClassName}
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
                    required
                    placeholder="johndoe@email.com"
                    className={fieldClassName}
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
                    className={fieldClassName}
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
                    className={fieldClassName}
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
                    className={`${fieldClassName} appearance-none`}
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
                    className={`${fieldClassName} resize-y`}
                />
            </div>

            <button
                type="submit"
                className="mt-4 w-full py-3 px-4 bg-black text-white font-medium rounded-sm hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition cursor-pointer duration-300 hover:-translate-y-0.5"
            >
                Send Inquiry
            </button>
        </form>
    );
}
