"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {MainPageResponse} from "@/app/types/mainpage";

type Stats = {
    enter: number;
    completions: number;
    avg: number;
};

function formatMsToMMSS(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Page() {
    const searchParams = useSearchParams();
    const [stats, setStats] = useState<MainPageResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    /* ---------- Farbe ---------- */
    let color = searchParams.get("color") ?? "000000";
    color = color.replace("#", "");
    const isValidHex = /^[0-9a-fA-F]{6}$/.test(color);
    const textColor = isValidHex ? `#${color}` : "#000000";

    /* ---------- Font ---------- */
    const fontParam = searchParams.get("font") ?? "sans";

    const fontFamily =
        fontParam === "mc"
            ? "Minecraft, monospace"
            : "var(--font-geist-sans), sans-serif";

    /* ---------- API ---------- */
    async function fetchStats() {
        try {
            const res = await fetch("/api/mainpage", { cache: "no-store" });
            if (!res.ok) throw new Error("API error");

            const data: MainPageResponse = await res.json();
            setStats(data);
            setError(null);
        } catch {
            setError("Fehler beim Laden der Daten");
        }
    }

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main style={{ color: textColor, fontFamily }}>
            {error && <p>{error}</p>}
            {!stats && !error && <p>Lade Daten…</p>}

            {stats && (
                <div className="flex flex-col">
                    {stats.leaderboard.slice(0,5).map((item, idx) => (
                        <div key={idx}><span className="">{idx+1} {item.name} {formatMsToMMSS(item.Time)} {item.pb && "(PB)"}</span>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
