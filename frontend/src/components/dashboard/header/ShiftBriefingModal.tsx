import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "../button";

interface ShiftBriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ShiftBriefingModal({
    isOpen,
    onClose,
}: ShiftBriefingModalProps) {
    const [hours, setHours] = useState<number | "">(12);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedText, setGeneratedText] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!hours || hours < 1 || hours > 24) return;

        setIsGenerating(true);
        setGeneratedText(null);

        try {
            const res = await fetch(`/api/ai/handoff?hours=${hours}`);
            const data = await res.json();

            if (data.success) {
                setGeneratedText(data.response);
            } else {
                setGeneratedText(
                    `Error: ${data.response || "Failed to generate briefing."}`,
                );
            }
        } catch (error) {
            console.error("Failed to fetch shift briefing:", error);
            setGeneratedText(
                "A network error occurred while communicating with the AI service.",
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (generatedText) {
            await navigator.clipboard.writeText(generatedText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setHours(12);
        setGeneratedText(null);
        setIsCopied(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div
                className={`bg-white w-full rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-all ${generatedText ? "max-w-4xl" : "max-w-lg"}`}
            >
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">
                        {generatedText ? "Shift Briefing" : "Generate Briefing"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-700 text-2xl leading-none cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!generatedText ? (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">
                                Timeframe (Hours)
                            </label>
                            <p className="text-xs text-slate-500 mb-1">
                                Enter a value between 1 and 24 to summarize
                                recent activity.
                            </p>
                            <input
                                type="number"
                                min={1}
                                max={24}
                                value={hours}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setHours(isNaN(val) ? "" : val);
                                }}
                                className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a237e]"
                                placeholder="e.g. 8"
                            />
                        </div>
                    ) : (
                        <div className="relative group">
                            <button
                                onClick={handleCopy}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 border border-slate-200 rounded-md text-slate-500 hover:text-slate-800 hover:bg-white shadow-sm transition-all cursor-pointer z-10"
                                title="Copy to clipboard"
                            >
                                {isCopied ? (
                                    <Check
                                        size={16}
                                        className="text-green-600"
                                    />
                                ) : (
                                    <Copy size={16} />
                                )}
                            </button>
                            <div className="w-full h-[60vh] min-h-[400px] p-6 bg-slate-50 border border-slate-200 rounded-md overflow-y-auto">
                                <ReactMarkdown>{generatedText}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="cursor-pointer"
                    >
                        {generatedText ? "Close" : "Cancel"}
                    </Button>

                    {!generatedText && (
                        <Button
                            onClick={handleGenerate}
                            disabled={
                                isGenerating ||
                                !hours ||
                                hours < 1 ||
                                hours > 24
                            }
                            className="min-w-[120px] cursor-pointer"
                        >
                            {isGenerating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "Generate"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
