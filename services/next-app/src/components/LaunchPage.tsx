"use client";
import { useEffect, useState } from "react";
import Script from "next/script";

interface LaunchPageProps {
    onComplete: () => void;
}

export default function LaunchPage({ onComplete }: LaunchPageProps) {
    const [dotsCount, setDotsCount] = useState(0);
    const [pageVisible, setPageVisible] = useState(true); useEffect(() => {
        // Cycle dots: 0→1→2→3→0 every 400ms
        const dotsInterval = setInterval(() => {
            setDotsCount((prev) => (prev + 1) % 4);
        }, 400);

        // start fading out the entire page
        const FADE_START_MS = 3500;
        const fadeTimeout = setTimeout(() => {
            setPageVisible(false);
            clearInterval(dotsInterval); // Stop dots
        }, FADE_START_MS);

        // call onComplete
        const COMPLETE_MS = FADE_START_MS + 800;
        const completeTimeout = setTimeout(() => {
            onComplete();
        }, COMPLETE_MS);

        return () => {
            clearInterval(dotsInterval);
            clearTimeout(fadeTimeout);
            clearTimeout(completeTimeout);
        };
    }, [onComplete]);

    const dots = ".".repeat(dotsCount);

    return (
        <>
            <Script
                src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
                type="module"
                strategy="afterInteractive"
            />

            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    zIndex: 9999,
                    userSelect: "none",
                    opacity: pageVisible ? 1 : 0,
                    transition: pageVisible ? "none" : "opacity 1.5s ease-in-out",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        color: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >          <div
                    className="my-heading"
                    style={{
                        fontSize: "2.25rem",
                        letterSpacing: "0.05rem",
                        marginBottom: "1rem",
                        whiteSpace: "nowrap",
                    }}
                >
                        Launching Neuronaut<span>{dots}</span>
                    </div>

                    <div
                        style={{
                            width: "min(50vw, 600px)",
                            height: "min(50vw, 600px)",
                            minWidth: "300px",
                            minHeight: "300px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        {/* @ts-ignore - dotlottie-player is a web component */}
                        <dotlottie-player
                            src="https://lottie.host/685e29d2-8f98-46f3-858c-f826eb8ad2fe/hMNaBVp3HH.lottie"
                            background="transparent"
                            speed="1"
                            style={{
                                width: "100%",
                                height: "100%",
                                filter: "invert(1)",
                            }}
                            loop
                            autoplay
                        >
                            {/* @ts-ignore - dotlottie-player is a web component */}
                        </dotlottie-player>
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: "none",
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
