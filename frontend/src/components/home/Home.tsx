"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Home() {
    const router = useRouter();

    const [code, setCode] = useState(new Array(6).fill(""));
    const [step, setStep] = useState<1 | 2>(1);

    const [universityName, setUniversityName] = useState("");
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [codeError, setCodeError] = useState("");

    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const verifyAccessCode = async (fullCode: string) => {
        if (isVerifyingCode) return;

        setIsVerifyingCode(true);
        setCodeError("");

        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessCode: fullCode }),
            });

            const result = await res.json();

            if (result.success) {
                setUniversityName(result.response.name);
                setTimeout(() => setStep(2), 300);
            } else {
                setCodeError(result.response || "Invalid Access Code");
                setCode(new Array(6).fill(""));
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            console.log(err);
            setCodeError("Network error. Please try again.");
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const handleChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);

        if (value !== "" && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newCode.every((digit) => digit !== "")) {
            inputRefs.current[index]?.blur();
            verifyAccessCode(newCode.join(""));
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (
            e.key === "Backspace" &&
            code[index] === "" &&
            index > 0 &&
            inputRefs.current[index - 1]
        ) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleGoBack = () => {
        setStep(1);
        setCode(new Array(6).fill(""));
        setPassword("");
        setStatus("idle");
        setErrorMessage("");
        setUniversityName("");
        setCodeError("");
    };

    const handleLogin = async () => {
        setErrorMessage("");

        const accessCode = code.join("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessCode, password }),
            });

            const result = await res.json();

            if (result.success) {
                router.push("/dashboard");
            } else {
                setStatus("error");
                setErrorMessage(result.response || "Invalid password.");
            }
        } catch (err) {
            console.log(err);
            setStatus("error");
            setErrorMessage("A network error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center -mt-4 overflow-hidden relative">
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-6 w-full max-w-sm"
                    >
                        <div onClick={() => window.location.reload()}>
                            <Image
                                src="/campus-security.png"
                                width={60}
                                height={60}
                                alt="Campus Security"
                                className="cursor-pointer transition duration-300 hover:-translate-y-0.5"
                            />
                        </div>

                        <h1 className="text-lg font-semibold text-gray-900">
                            Sign in to Campus Security
                        </h1>
                        <h2 className="text-gray-700">Access Code</h2>
                        <div className="flex justify-between w-full gap-2 px-2">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                    }}
                                    className="w-12 h-14 text-center text-2xl font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                                />
                            ))}
                        </div>
                        <div className="text-sm text-gray-950">
                            New inquiries?{" "}
                            <Link
                                href="/contact"
                                className="font-medium text-gray-600 hover:underline"
                            >
                                Contact us
                            </Link>
                        </div>
                        <div className="h-6 mt-1 w-full flex items-center justify-center">
                            {codeError && (
                                <p className="text-red-600 text-sm">
                                    {codeError}
                                </p>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step-2"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center w-full max-w-sm gap-6 relative px-4"
                    >
                        <button
                            onClick={handleGoBack}
                            className="absolute left-4 top-1 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <h1 className="text-xl font-bold text-gray-900 mt-1">
                            {universityName || "University Login"}
                        </h1>

                        <input
                            type="password"
                            placeholder="Password"
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleLogin();
                            }}
                            className="w-full h-12 px-4 mt-2 text-lg text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />

                        <button
                            onClick={handleLogin}
                            className="w-full h-12 bg-black text-white font-medium rounded-lg hover:bg-black/90 transition
                            cursor-pointer duration-300 hover:-translate-y-0.5"
                        >
                            Sign In
                        </button>
                        <div className="h-6 mt-2 w-full flex items-start justify-center">
                            {status === "error" && (
                                <p className="text-red-600 text-sm text-center">
                                    {errorMessage}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
