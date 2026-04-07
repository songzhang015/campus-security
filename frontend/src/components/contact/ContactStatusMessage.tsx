interface ContactStatusMessageProps {
    status: "idle" | "success" | "error";
    errorMessage: string;
}

export default function ContactStatusMessage({
    status,
    errorMessage,
}: ContactStatusMessageProps) {
    if (status === "success") {
        return (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-sm text-sm text-center">
                Inquiry received! Our team will contact you shortly.
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-sm text-sm text-center">
                {errorMessage}
            </div>
        );
    }

    return null;
}
