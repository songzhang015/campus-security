"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ContactHeader() {
    const router = useRouter();

    return (
        <>
            <Image
                src="/campus-security.png"
                width={42}
                height={42}
                alt="Campus Security"
                onClick={() => router.push("/")}
                className="mx-auto mb-2 cursor-pointer transition duration-300 hover:-translate-y-0.5"
            />

            <h1 className="text-xl text-center font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">
                Contact
            </h1>
        </>
    );
}
