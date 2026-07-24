"use client";

import { Header } from "@/components/Header";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { FaTwitch } from "react-icons/fa";
import { Speedrunner, Run } from "@/app/types/speedrunner";
import { formatTime } from "@/app/utils/format";

const SPLIT_ORDER = [
    "ENTER_NETHER",
    "ENTER_BASTION",
    "ENTER_FORTRESS",
    "FINDING_STRONGHOLD",
    "FOUND_STRONGHOLD",
    "ENTER_END",
    "COMPLETED_RUN",
] as const;

const SPLIT_LABELS: Record<string, string> = {
    ENTER_NETHER: "Nether",
    ENTER_BASTION: "Bastion",
    ENTER_FORTRESS: "Fortress",
    FINDING_STRONGHOLD: "Finding Stronghold",
    FOUND_STRONGHOLD: "Stronghold",
    ENTER_END: "End",
    COMPLETED_RUN: "Finish",
};

function skinRenderUrl(name: string) {
    return `https://starlightskins.lunareclipse.studio/render/default/${encodeURIComponent(name)}/full`;
}

function avatarFallback(name: string) {
    return `https://mc-heads.net/body/${encodeURIComponent(name)}/300`;
}

export default function ProfilePage() {
    const params = useParams<{ name: string }>();
    const name = decodeURIComponent(params.name ?? "");

    const [runner, setRunner] = useState<Speedrunner | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [skinFailed, setSkinFailed] = useState(false);

    useEffect(() => {
        if (!name) return;

        const fetchRunner = async () => {
            try {
                const res = await fetch(`/api/speedrunners/${encodeURIComponent(name)}`, {
                    cache: "no-store",
                });

                if (res.status === 404) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                if (!res.ok) throw new Error("Fehler beim Laden des Profils");

                const data: Speedrunner = await res.json();
                setRunner(data);
            } catch (err) {
                console.error(err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchRunner();
        const interval = setInterval(fetchRunner, 5000);
        return () => clearInterval(interval);
    }, [name]);

    const visibleRuns: Run[] = (runner?.runs ?? []).filter((r) => !r.hidden);
    const completedRuns = visibleRuns.filter((r) =>
        r.splits.some((s) => s.split === "COMPLETED_RUN")
    );
    const liveRun = visibleRuns.find((r) => r.active);
    const recentRuns = [...visibleRuns]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

    const pbCompletion = runner?.pbpace?.COMPLETED_RUN;
    const hasTwitch = Boolean(runner?.twitch && runner.twitch !== "null");

    const splitStats = SPLIT_ORDER.map((split, idx) => {
        const validRuns = visibleRuns.filter((r) => r.splits.length > idx);
        let sum = 0;
        let fastest = Infinity;

        for (const run of validRuns) {
            const t = run.splits[idx]?.igt ?? 0;
            sum += t;
            if (t < fastest) fastest = t;
        }

        return {
            split,
            count: validRuns.length,
            avg: validRuns.length > 0 ? sum / validRuns.length : 0,
            fastest: fastest === Infinity ? 0 : fastest,
        };
    });

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col pb-16">
            <Header />

            {loading && (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
                    Lade Profil...
                </div>
            )}

            {!loading && notFound && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
                    <span className="text-3xl font-bold text-purple-400">Spieler nicht gefunden</span>
                    <span className="text-gray-400">&quot;{name}&quot; hat (noch) keine Runs in diesem Event.</span>
                </div>
            )}

            {!loading && runner && (
                <main className="flex flex-col items-center w-full px-4 max-w-6xl mx-auto">

                    {/* Header card */}
                    <div className="w-full mt-8 flex flex-col md:flex-row gap-8 items-center md:items-end bg-gradient-to-b from-purple-900/20 to-transparent p-6 border border-purple-900/40">
                        <div className="w-48 h-64 md:w-56 md:h-72 flex items-end justify-center shrink-0">
                            <img
                                src={skinFailed ? avatarFallback(runner.name) : skinRenderUrl(runner.name)}
                                onError={() => setSkinFailed(true)}
                                alt={runner.name}
                                className="max-h-full drop-shadow-[0_10px_25px_rgba(147,51,234,0.35)]"
                            />
                        </div>

                        <div className="flex flex-col items-center md:items-start gap-3 flex-1">
                            <span className="text-4xl md:text-5xl font-bold">{runner.name}</span>

                            {liveRun && (
                                <span className="flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-3 py-1 uppercase tracking-wide animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-white" />
                                    Live &ndash; {SPLIT_LABELS[liveRun.splits[liveRun.splits.length - 1]?.split] ?? "Run läuft"}
                                </span>
                            )}

                            <div className="flex gap-3">
                                {hasTwitch && (
                                    <a
                                        href={`https://twitch.tv/${runner.twitch}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-[#9146FF] hover:bg-[#7c2ee6] transition-colors text-white text-sm font-semibold px-4 py-2 rounded-sm"
                                    >
                                        <FaTwitch className="w-4 h-4" />
                                        Twitch
                                    </a>
                                )}
                                <a
                                    href={`https://paceman.gg/stats/player/${encodeURIComponent(runner.name)}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-sm"
                                >
                                    <img src="https://paceman.gg/favicon.ico" alt="" className="w-4 h-4" />
                                    Paceman
                                </a>
                            </div>

                            <div className="flex items-end gap-8 mt-3 text-center md:text-left">
                                <div>
                                    <div className="text-6xl md:text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                        {pbCompletion ? formatTime(pbCompletion) : "--:--"}
                                    </div>
                                    <div className="text-xs md:text-sm uppercase tracking-widest text-gray-400">PB Completion</div>
                                </div>
                                <div className="flex gap-6 pb-1">
                                    <div>
                                        <div className="text-2xl font-mono font-bold">{visibleRuns.length}</div>
                                        <div className="text-xs uppercase text-gray-400">Runs</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-mono font-bold">{completedRuns.length}</div>
                                        <div className="text-xs uppercase text-gray-400">Completions</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                        {/* Split stats */}
                        <div className="border border-gray-700 overflow-hidden">
                            <div className="bg-gray-800 p-4">
                                <span className="text-xl md:text-2xl">Split Stats</span>
                            </div>
                            <div className="bg-[#2a3546] p-4">
                                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-3 items-center">
                                    <span></span>
                                    <span className="text-gray-500 text-xs uppercase text-right">Amt</span>
                                    <span className="text-gray-500 text-xs uppercase text-right">Avg</span>
                                    <span className="text-gray-500 text-xs uppercase text-right">Fastest</span>

                                    {splitStats.map((s) => (
                                        <Fragment key={s.split}>
                                            <div className="flex items-center gap-2">
                                                <img src={`/icons/${s.split}.png`} alt="" className="w-5 h-5" />
                                                <span className="text-gray-200">{SPLIT_LABELS[s.split]}</span>
                                            </div>
                                            <span className="text-right font-mono">{s.count}</span>
                                            <span className="text-right font-mono">
                                                {s.count > 0 ? formatTime(s.avg) : "--:--"}
                                            </span>
                                            <span className="text-right font-mono text-purple-400">
                                                {s.count > 0 ? formatTime(s.fastest) : "--:--"}
                                            </span>
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent runs */}
                        <div className="border border-gray-700 overflow-hidden">
                            <div className="bg-gray-800 p-4">
                                <span className="text-xl md:text-2xl">Letzte Runs</span>
                            </div>
                            <div className="bg-[#2a3546] p-4 flex flex-col gap-2 max-h-[26rem] overflow-y-auto custom-scrollbar">
                                {recentRuns.length === 0 && (
                                    <span className="text-gray-500 italic">Noch keine Runs</span>
                                )}
                                {recentRuns.map((run) => {
                                    const lastSplit = run.splits[run.splits.length - 1];
                                    return (
                                        <div key={run.worldID} className="flex justify-between items-center border-b border-gray-700/50 pb-2 last:border-0">
                                            <div className="flex items-center gap-2">
                                                {run.active && (
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                )}
                                                <span className="text-gray-200">
                                                    {lastSplit ? SPLIT_LABELS[lastSplit.split] ?? lastSplit.split : "--"}
                                                </span>
                                                {run.cheated && (
                                                    <span className="text-red-400 text-xs uppercase border border-red-500/50 rounded px-1.5 py-0.5">
                                                        cheated
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-mono">
                                                {lastSplit ? formatTime(lastSplit.igt) : "--:--"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}
