"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ContactHeader from "./ContactHeader";
import ContactForm from "./ContactForm";
import ContactStatusMessage from "./ContactStatusMessage";

export default function Contact() {
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setStatus("idle");

        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (result.success) {
                setStatus("success");
                form.reset();
            } else {
                setStatus("error");
                setErrorMessage(result.response || "Failed to send inquiry.");
            }
        } catch (err) {
            console.log(err);
            setStatus("error");
            setErrorMessage("A network error occurred. Please try again.");
        }
    };

    return (
        <motion.div
            key="contact-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
        >
            <div className="w-full max-w-lg bg-white border border-gray-300 rounded-md p-8">
                <ContactHeader />

                <ContactForm onSubmit={handleSubmit} />

                <ContactStatusMessage
                    status={status}
                    errorMessage={errorMessage}
                />
            </div>
        </motion.div>
    );
}
