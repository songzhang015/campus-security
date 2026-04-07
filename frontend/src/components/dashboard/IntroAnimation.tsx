"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useAnimationControls, AnimatePresence } from "framer-motion";

interface IntroAnimationProps {
    orgName: string;
    orgLogoSrc: string;
    orgLogoAltSrc: string;
    companyLogoSrc: string;
    brandColor: string;
    children: React.ReactNode;
}

// Timings
const T_GRAY_HOLD = 500;
const T_FADE_TO_OFFWHITE = 250;
const T_LETTER_STAGGER = 25;
const T_AFTER_LETTERS = 250;
const T_LOGO_FADE = 500;
const T_HOLD_INTRO = 750;
const T_SWAP_FADE = 500;
const T_CUT_DURATION = 750;
const T_SPREAD_DURATION = 750;
const T_HOLD_REVEAL = 1250;
const T_SPREAD_CONTENT_FADE_OUT = 500;
const T_WELCOME_FADE_IN = 500;
const T_WELCOME_HOLD = 1250;
const T_WELCOME_FADE_OUT = 500;
const T_PAUSE_BEFORE_EXIT = 500;
const T_FINAL_FADE = 500;

const OFF_WHITE = "#f2f2f2";
const BRAND_COLOR = "#00702F";
const GRAY_START = "#dbdbdb";

function sleep(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Phase =
    | "gray"
    | "offwhite"
    | "companyLetters"
    | "companyLogo"
    | "swap"
    | "univFadeIn"
    | "cut"
    | "spread"
    | "reveal"
    | "welcome"
    | "exiting"
    | "done";

export default function IntroAnimation({
    orgName,
    orgLogoSrc,
    orgLogoAltSrc,
    companyLogoSrc,
    brandColor = "#1a237e",
    children,
}: IntroAnimationProps) {
    const [phase, setPhase] = useState<Phase>("gray");
    const [visibleLetters, setVisible] = useState(-1);
    const [showSpreadContent, setShowSpreadContent] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);

    const overlayControls = useAnimationControls();

    const companyText = "Campus Security";
    const letters = companyText.split("");
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        (async () => {
            // 1. Gray hold
            setPhase("gray");
            await sleep(T_GRAY_HOLD);

            // 2. Fade to off-white
            setPhase("offwhite");
            await sleep(T_FADE_TO_OFFWHITE + 80);

            // 3. Campus Security drops in sequentially
            setPhase("companyLetters");
            for (let i = 0; i < letters.length; i++) {
                setVisible(i);
                await sleep(T_LETTER_STAGGER);
            }
            await sleep(T_AFTER_LETTERS);

            // 4. Campus Security logo fades in
            setPhase("companyLogo");
            await sleep(T_LOGO_FADE + T_HOLD_INTRO);

            // 5. Fade out Campus Security
            setPhase("swap");
            await sleep(T_SWAP_FADE);

            // 6. Fade in University Logo + Name
            setPhase("univFadeIn");
            await sleep(T_SWAP_FADE + T_HOLD_INTRO);

            // 7. Green line cuts top → bottom
            setPhase("cut");
            await sleep(T_CUT_DURATION); // Wait exactly the cut duration

            // 8. Spread left + right from center
            setPhase("spread");
            setShowSpreadContent(true);
            await sleep(T_SPREAD_DURATION + 60);

            // 9. Hold on alternate university logo + name
            setPhase("reveal");
            await sleep(T_HOLD_REVEAL);

            // 10. Fade spread content out
            setShowSpreadContent(false);
            await sleep(T_SPREAD_CONTENT_FADE_OUT);

            // 11. Fade "Welcome back!" in, hold, fade out
            setShowWelcome(true);
            setPhase("welcome");
            await sleep(T_WELCOME_FADE_IN + T_WELCOME_HOLD);
            setShowWelcome(false);
            await sleep(T_WELCOME_FADE_OUT + T_PAUSE_BEFORE_EXIT);

            // 12. Reveal dashboard behind overlay, fade white overlay out
            setPhase("exiting");
            setShowDashboard(true);
            await sleep(30);
            overlayControls.start({
                opacity: 0,
                transition: {
                    duration: T_FINAL_FADE / 1000,
                    ease: "easeInOut",
                },
            });
            await sleep(T_FINAL_FADE + 100);

            setPhase("done");
        })();
    }, [letters.length, overlayControls]);

    if (phase === "done") return <>{children}</>;

    const isPreCut = [
        "gray",
        "offwhite",
        "companyLetters",
        "companyLogo",
        "swap",
        "univFadeIn",
        "cut",
        "spread",
        "reveal",
        "welcome",
    ].includes(phase);

    const isSpread = ["spread", "reveal", "welcome"].includes(phase);

    return (
        <div className="fixed inset-0 z-[9999]">
            {/* Dashboard renders beneath everything once we're exiting */}
            {showDashboard && (
                <div className="absolute inset-0 z-0">{children}</div>
            )}

            {/* ── Layer 10: Animated Background ─────────────────────────────── */}
            <AnimatePresence>
                {isPreCut && (
                    <motion.div
                        key="bg-layer"
                        className="absolute inset-0 z-10"
                        initial={{ backgroundColor: GRAY_START }}
                        animate={{
                            backgroundColor:
                                phase === "gray" ? GRAY_START : OFF_WHITE,
                        }}
                        transition={{
                            duration: T_FADE_TO_OFFWHITE / 1000,
                            ease: "easeInOut",
                        }}
                        exit={{ opacity: 0, transition: { duration: 0 } }}
                    />
                )}
            </AnimatePresence>

            {/* ── Layer 20: Green Cut Line ──────────────────────────────────── */}
            {phase === "cut" && (
                <motion.div
                    initial={{ height: "0%" }}
                    animate={{ height: "100%" }}
                    transition={{
                        duration: T_CUT_DURATION / 1000,
                        ease: [0.76, 0, 0.24, 1],
                    }}
                    className="absolute z-[35] pointer-events-none"
                    style={{
                        top: 0,
                        left: "calc(50% - 1px)",
                        width: "2px",
                        backgroundColor: brandColor,
                    }}
                />
            )}

            {/* ── Layer 30: Pre-cut Logos & Text ────────────────────────────── */}
            <AnimatePresence>
                {isPreCut && (
                    <motion.div
                        key="content-layer"
                        className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
                        style={{ gap: "1.25rem" }}
                        exit={{ opacity: 0, transition: { duration: 0 } }}
                    >
                        {/* ── Campus Security Intro ── */}
                        <motion.div
                            animate={{
                                opacity:
                                    phase === "companyLetters" ||
                                    phase === "companyLogo"
                                        ? 1
                                        : 0,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute flex flex-col items-center justify-center pointer-events-none"
                            style={{ gap: "1.25rem" }}
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: phase === "companyLogo" ? 1 : 0,
                                }}
                                transition={{
                                    duration: T_LOGO_FADE / 1000,
                                    ease: "easeInOut",
                                }}
                                className="w-14 h-14 relative"
                            >
                                <Image
                                    src={companyLogoSrc}
                                    alt="Company logo"
                                    fill
                                    className="object-contain"
                                />
                            </motion.div>

                            <div
                                className="flex flex-wrap justify-center"
                                aria-label={companyText}
                            >
                                {letters.map((char, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: -18 }}
                                        animate={
                                            visibleLetters >= i
                                                ? { opacity: 1, y: 0 }
                                                : { opacity: 0, y: -18 }
                                        }
                                        transition={{
                                            duration: 0.55,
                                            ease: [0.22, 1.6, 0.36, 1],
                                        }}
                                        style={{
                                            display: "inline-block",
                                            fontSize: "1.35rem",
                                            fontWeight: 500,
                                            letterSpacing: "0.05em",
                                            color: "#4a4a4a",
                                            whiteSpace: "pre",
                                        }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>

                        {/* ── University Fade In (Sits on top of the green line) ── */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [
                                    "univFadeIn",
                                    "cut",
                                    "spread",
                                    "reveal",
                                    "welcome",
                                ].includes(phase)
                                    ? 1
                                    : 0,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute flex flex-col items-center justify-center pointer-events-none"
                            style={{ gap: "1.25rem" }}
                        >
                            {/* CLEAN LOGO - NO CSS FILTERS */}
                            <div className="w-14 h-14 relative">
                                <Image
                                    src={orgLogoSrc}
                                    alt="University logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div
                                style={{
                                    fontSize: "1.35rem",
                                    fontWeight: 500,
                                    letterSpacing: "0.05em",
                                    color: "#4a4a4a",
                                }}
                            >
                                {orgName}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Layer 40: Spread Panel ────────────────────────────────────── */}
            {isSpread && (
                <motion.div
                    initial={{
                        clipPath:
                            "inset(0% calc(50% - 1px) 0% calc(50% - 1px))",
                    }}
                    animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                    transition={{
                        duration: T_SPREAD_DURATION / 1000,
                        ease: [0.76, 0, 0.24, 1],
                    }}
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center"
                    style={{ backgroundColor: brandColor, gap: "1.1rem" }}
                >
                    <motion.div
                        animate={{ opacity: showSpreadContent ? 1 : 0 }}
                        transition={{
                            duration: T_SPREAD_CONTENT_FADE_OUT / 1000,
                            ease: "easeInOut",
                        }}
                        initial={{ opacity: 1 }}
                        className="w-14 h-14 relative"
                    >
                        <Image
                            src={orgLogoAltSrc}
                            alt="University Alt logo"
                            fill
                            className="object-contain"
                        />
                    </motion.div>

                    <motion.p
                        animate={{ opacity: showSpreadContent ? 1 : 0 }}
                        transition={{
                            duration: T_SPREAD_CONTENT_FADE_OUT / 1000,
                            ease: "easeInOut",
                        }}
                        initial={{ opacity: 1 }}
                        style={{
                            fontSize: "1.4rem",
                            fontWeight: 500,
                            letterSpacing: "0.09em",
                            color: OFF_WHITE,
                        }}
                    >
                        {orgName}
                    </motion.p>

                    <AnimatePresence>
                        {showWelcome && (
                            <motion.p
                                key="welcome"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: T_WELCOME_FADE_IN / 1000,
                                    ease: "easeInOut",
                                }}
                                style={{
                                    position: "absolute",
                                    fontSize: "1.4rem",
                                    fontWeight: 400,
                                    letterSpacing: "0.05em",
                                    color: OFF_WHITE,
                                }}
                            >
                                Welcome back!
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* ── Layer 50: Exiting Fade ────────────────────────────────────── */}
            {phase === "exiting" && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={overlayControls}
                    className="absolute inset-0 z-50 pointer-events-none"
                    style={{ backgroundColor: brandColor }}
                />
            )}
        </div>
    );
}
