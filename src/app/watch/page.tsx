"use client"

import Link from "next/link";
import { Element } from "@/components/Watch/element";
import { useEffect, useMemo, useState } from "react";
import { Run } from "@/app/types/speedrunner";
import { formatTime } from "@/app/utils/format";
import { Header } from "@/components/Header";

// Fortschritt eines Splits: je höher, desto weiter ist der Run.
const SPLIT_PROGRESS: Record<string, number> = {
    ENTER_NETHER: 1,
    ENTER_BASTION: 2,
    ENTER_FORTRESS: 3,
    FINDING_STRONGHOLD: 4,
    FOUND_STRONGHOLD: 5,
    ENTER_END: 6,
    COMPLETED_RUN: 7,
};

type Stats = {
    enter: number;
    completions: number;
    avg: number;
};

const FALLBACK_KEY = "pbdash:fallbackStreamer";

function progressOf(run: Run): number {
    const last = run.splits.at(-1);
    return last ? SPLIT_PROGRESS[last.split] ?? 0 : 0;
}

function lastTimeOf(run: Run): number {
    return run.splits.at(-1)?.igt ?? Number.MAX_SAFE_INTEGER;
}

function hasStream(run: Run): boolean {
    return Boolean(run.liveStreamed && run.liveStreamed.trim() !== "" && run.liveStreamed !== "null");
}

const Home = () => {

    const [runs, setRuns] = useState<Run[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [liveChannels, setLiveChannels] = useState<string[]>([]);
    const [fallback, setFallback] = useState<string>("");
    const [showInfo, setShowInfo] = useState(false);

    const [stats, setStats] = useState<Stats | null>(null);

    // Gewählten Fallback-Streamer aus dem LocalStorage wiederherstellen
    useEffect(() => {
        const stored = localStorage.getItem(FALLBACK_KEY);
        if (stored) setFallback(stored);
    }, []);

    useEffect(() => {
        if (fallback) localStorage.setItem(FALLBACK_KEY, fallback);
        else localStorage.removeItem(FALLBACK_KEY);
    }, [fallback]);

    useEffect(() => {
        const fetchRuns = async () => {
            try {
                const res = await fetch("/api/active-runs");

                if (!res.ok) {
                    throw new Error("Fehler beim Laden der Active Runs");
                }

                const data: Run[] = await res.json();
                setRuns(data);
            } catch (err) {
                console.error(err);
                setError("Active Runs konnten nicht geladen werden.");
            } finally {
                setLoading(false);
            }
        };

        const initialFetch = async () => {
            setLoading(true);
            await fetchRuns();
            setLoading(false);
        };
        initialFetch();

        const interval = setInterval(fetchRuns, 3000);
        return () => clearInterval(interval);
    }, []);

    // Live-Status der Streamer regelmäßig prüfen
    useEffect(() => {
        const fetchLive = async () => {
            try {
                const res = await fetch("/api/live-streamers", { cache: "no-store" });
                if (!res.ok) return;
                const data: { live: string[] } = await res.json();
                setLiveChannels(data.live ?? []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchLive();
        const interval = setInterval(fetchLive, 60000);
        return () => clearInterval(interval);
    }, []);

    // Stats regelmäßig aktualisieren
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats", { cache: "no-store" });
                if (res.ok) setStats(await res.json());
            } catch (err) {
                console.error(err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    // Runs nach Fortschritt sortieren: am weitesten oben, bei Gleichstand schnellere Zeit zuerst.
    const sortedRuns = useMemo(() => {
        return [...(runs ?? [])].sort((a, b) => {
            const diff = progressOf(b) - progressOf(a);
            if (diff !== 0) return diff;
            return lastTimeOf(a) - lastTimeOf(b);
        });
    }, [runs]);

    // Der am weitesten fortgeschrittene Run, der auch gestreamt wird.
    const featuredRun = sortedRuns.find(hasStream) ?? null;
    const otherRuns = sortedRuns.filter((r) => r.worldID !== featuredRun?.worldID);

    const activeChannel = featuredRun?.liveStreamed ?? (fallback || null);
    const isFallbackActive = !featuredRun && Boolean(fallback);

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col">
            <Header />

            {/* Main Layout Container: Mobil Spalte, Desktop Zeile */}
            <div className="flex flex-col lg:flex-row flex-1">

                {/* Video Area: Mobil 100%, Desktop 75% */}
                <div className="w-full lg:w-3/4 flex flex-col items-center mt-4 lg:mt-10 px-2 lg:px-4 mb-8 lg:mb-0">
                    <div className="w-full max-w-[1280px] flex flex-col items-center">

                        {activeChannel ? (
                            /* Responsive Video Container (Aspect Ratio) */
                            <div className="w-full aspect-video bg-black overflow-hidden border border-gray-700 shadow-2xl shadow-black/40">
                                <iframe
                                    src={`https://player.twitch.tv/?channel=${activeChannel}&parent=pbdash.yolacraft.de`}
                                    frameBorder="0"
                                    allowFullScreen={true}
                                    scrolling="no"
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 lg:h-96">
                                <span className="text-4xl md:text-6xl lg:text-8xl text-center px-4 font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500">
                                    Niemand Live...
                                </span>
                            </div>
                        )}

                        {/* Info Area unter dem Video.
                            Grid mit 1fr_auto_1fr: die mittlere Spalte (Nametag) bleibt exakt
                            zentriert, egal wie breit Fallback-Dropdown und Splits sind. */}
                        <div className="mt-4 w-full flex flex-col gap-4 items-center md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">

                            {/* --- FALLBACK STREAMER (links) --- */}
                            <div className="flex items-center gap-2   px-3 py-2 w-fit md:justify-self-start">
                                <div className="relative flex items-center">
                                    <button
                                        type="button"
                                        onMouseEnter={() => setShowInfo(true)}
                                        onMouseLeave={() => setShowInfo(false)}
                                        onClick={() => setShowInfo((v) => !v)}
                                        aria-label="Info zum Fallback-Streamer"
                                        className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-500 text-gray-400 text-[10px] font-bold hover:border-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        i
                                    </button>
                                    {showInfo && (
                                        <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 border border-gray-700 text-gray-300 text-xs p-2 shadow-xl z-20">
                                            Streamer, wenn keiner on pace ist
                                        </div>
                                    )}
                                </div>

                                <label htmlFor="fallback" className="text-sm text-gray-400 whitespace-nowrap">
                                    Fallback
                                </label>

                                <select
                                    id="fallback"
                                    value={fallback}
                                    onChange={(e) => setFallback(e.target.value)}
                                    className="bg-gray-900 border border-gray-700 focus:border-purple-500 outline-none px-2 py-1 text-sm text-white transition-colors"
                                >
                                    <option value="">none</option>
                                    {liveChannels.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                    {/* Gespeicherte Auswahl anzeigen, auch wenn der Kanal gerade offline ist */}
                                    {fallback && !liveChannels.includes(fallback) && (
                                        <option value={fallback}>{fallback} (offline)</option>
                                    )}
                                </select>

                            </div>

                            {/* --- NAMETAG (exakt mittig) --- */}
                            {featuredRun ? (
                                <Link
                                    href={`/profile/${encodeURIComponent(featuredRun.playerName)}`}
                                    className="flex items-center gap-2 bg-gray-800/80 border border-purple-900/40 px-4 py-2 md:px-6 md:py-3 w-fit shadow-lg shadow-purple-900/20 hover:opacity-80 transition-opacity"
                                >
                                    <span className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 text-center">
                                        {featuredRun.playerName}
                                    </span>
                                </Link>
                            ) : activeChannel ? (
                                <div className="flex items-center gap-2 bg-gray-800/80 border border-purple-900/40 px-4 py-2 md:px-6 md:py-3 w-fit shadow-lg shadow-purple-900/20">
                                    <span className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 text-center">
                                        {activeChannel}
                                    </span>
                                </div>
                            ) : (
                                <div />
                            )}

                            {/* --- SPLITS (rechts neben dem Nametag) --- */}
                            {featuredRun ? (
                                <div className="flex gap-4 md:gap-6 flex-wrap justify-center md:justify-self-start">
                                    {featuredRun.splits.map((split, idx) => (
                                        <div key={split.rta + idx} className="flex flex-col items-center">
                                            <img
                                                src={"/icons/" + split.split + ".png"}
                                                alt={split.split}
                                                className="w-8 h-8 md:w-auto md:h-auto"
                                            />
                                            <span className="text-neutral-200 text-lg md:text-xl font-mono">
                                                {formatTime(split.igt)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div />
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar / List: Mobil 100%, Desktop 25% */}
                <div className="w-full lg:w-1/4 flex flex-col border-t border-gray-800 lg:border-t-0 lg:border-l lg:border-gray-800 bg-gray-800/20 lg:h-[calc(100vh-4.5rem)]">
                    {/* Header der Liste */}
                    <div className="p-4 bg-gray-900 lg:bg-transparent shrink-0">
                        <span className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                            Mehr Runs
                        </span>
                    </div>

                    <div className="h-px bg-gray-800 w-full hidden lg:block shrink-0"></div>

                    {/* Scrollbarer Bereich für die Liste */}
                    <div className="overflow-y-auto flex-1 min-h-0">
                        {otherRuns.map(run => (
                            <Element
                                key={run.worldID}
                                time={run.splits.at(-1)?.igt || 0}
                                split={run.splits.at(-1)?.split || "ENTER_NETHER"}
                                Name={run.playerName}
                                livestream={run.liveStreamed}
                                splits={run.splits}
                            />
                        ))}
                        {/* Fallback falls keine weiteren Runs da sind */}
                        {otherRuns.length === 0 && (
                            <div className="p-4 text-gray-500 italic">Keine weiteren Runs aktiv.</div>
                        )}
                    </div>

                    {/* --- GLOBAL STATS (immer ganz unten) --- */}
                    <div className="shrink-0 m-3 border border-gray-700">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-800/60 p-3 border-b border-purple-900/40">
                            <span className="text-lg font-bold text-purple-300">Global Stats</span>
                        </div>
                        <div className="bg-[#2a3546] p-4 flex flex-col gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Enters</span>
                                <span className="font-mono text-gray-100">{stats?.enter ?? 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Completions</span>
                                <span className="font-mono text-gray-100">{stats?.completions ?? 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Avg Enter</span>
                                <span className="font-mono text-gray-100">{formatTime(stats?.avg ?? 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
