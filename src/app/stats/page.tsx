"use client";

import { Header } from "@/components/Header";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react"; // Suspense importiert
import { Run, Speedrunner } from "@/app/types/speedrunner";
import { formatTime } from "@/app/utils/format";

type Stats = {
    enter: number;
    completions: number;
    avg: number;
};

const STAGES = [
    { title: "Enters", splitIndex: 0 },
    { title: "Bastions", splitIndex: 1 },
    { title: "Fortresses", splitIndex: 2 },
    { title: "First Portals", splitIndex: 3 },
    { title: "Strongholds", splitIndex: 4 },
    { title: "End Enters", splitIndex: 5 },
    { title: "Completions", splitIndex: 6 },
];

const LeaderboardBox = ({
                            title,
                            splitIndex,
                            runners
                        }: {
    title: string;
    splitIndex: number;
    runners: Speedrunner[];
}) => {
    const [viewMode, setViewMode] = useState<'amount' | 'avg' | 'fastest'>('amount');

    const processedRunners = useMemo(() => {
        const data = runners.map(runner => {
            const validRuns = runner.runs.filter(r => r.splits.length > splitIndex);
            let sum = 0;
            let fastest = Infinity;

            if (validRuns.length > 0) {
                for (let run of validRuns) {
                    const time = run.splits[splitIndex]?.igt || 0;
                    sum += time;
                    if (time < fastest) fastest = time;
                }
            } else {
                fastest = 0;
            }

            const avg = validRuns.length > 0 ? sum / validRuns.length : 0;

            return {
                name: runner.name,
                count: validRuns.length,
                avg: avg,
                fastest: fastest === Infinity ? 0 : fastest
            };
        });

        const activeRunners = data.filter(r => r.count > 0);

        return activeRunners.sort((a, b) => {
            if (viewMode === 'amount') return b.count - a.count;
            if (viewMode === 'avg') return a.avg - b.avg;
            return a.fastest - b.fastest;
        });
    }, [runners, splitIndex, viewMode]);

    const getBtnStyle = (mode: string) => `
        text-[10px] md:text-xs uppercase font-bold px-2 py-1 rounded transition-colors border 
        ${viewMode === mode
        ? 'bg-purple-600 border-purple-400 text-white'
        : 'bg-gray-700 border-transparent text-gray-400 hover:bg-gray-600'}
    `;

    return (
        <div className="border-2 border-purple-700 w-full md:w-96 h-fit p-4 rounded-xl flex flex-col gap-4 bg-gray-800/50">
            <div className="flex justify-between items-center w-full">
                <span className="text-2xl md:text-3xl font-bold text-purple-300">{title}</span>
                <div className="flex gap-1">
                    <button onClick={() => setViewMode('amount')} className={getBtnStyle('amount')}>Amt</button>
                    <button onClick={() => setViewMode('avg')} className={getBtnStyle('avg')}>Avg</button>
                    <button onClick={() => setViewMode('fastest')} className={getBtnStyle('fastest')}>Fst</button>
                </div>
            </div>

            <div className="flex flex-col gap-1 h-64 overflow-y-auto pr-2 custom-scrollbar">
                {processedRunners.length === 0 ? (
                    <span className="text-gray-500 text-sm italic">No runs yet</span>
                ) : (
                    processedRunners.map((runner, idx) => (
                        <div className="flex justify-between w-full border-b border-gray-700/50 pb-1 last:border-0" key={runner.name}>
                            <span className="truncate max-w-[60%] text-lg">
                                <span className="text-purple-400 mr-2 font-mono text-sm">{idx + 1}.</span>
                                {runner.name}
                            </span>
                            <span className="font-mono text-lg text-gray-200">
                                {viewMode === 'amount' && runner.count}
                                {viewMode === 'avg' && formatTime(runner.avg)}
                                {viewMode === 'fastest' && formatTime(runner.fastest)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Logik in eine separate Content-Komponente
function StatsContent() {
    const searchParams = useSearchParams();
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [speedrunners, setSpeedrunners] = useState<Speedrunner[]>([]);

    async function fetchStats() {
        try {
            const res = await fetch("/api/stats", { cache: "no-store" });
            if (!res.ok) throw new Error("API error");
            const data: Stats = await res.json();
            setStats(data);
        } catch {
            console.error("Fehler beim Laden der globalen Stats");
        }
    }

    const fetchSpeedrunners = async () => {
        try {
            const res = await fetch("/api/speedrunners");
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const data: Speedrunner[] = await res.json();
            setSpeedrunners(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Unknown error");
        }
    };

    useEffect(() => {
        fetchStats();
        fetchSpeedrunners();
        const interval = setInterval(() => {
            fetchStats();
            fetchSpeedrunners();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Header />
            <div className="p-8 flex flex-col gap-8">
                <div className="border-2 border-purple-700 w-full md:w-96 p-6 rounded-xl flex flex-col gap-4 bg-gray-800 shadow-lg shadow-purple-900/20">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        Global Stats
                    </span>
                    <div className="flex justify-between text-xl">
                        <div className="flex flex-col gap-2 text-gray-400 w-fit">
                            <span>Total Enters:</span>
                            <span>Global Avg:</span>
                            <span>Completions:</span>
                        </div>
                        <div className="flex flex-col gap-2 text-right font-mono text-white w-fit">
                            <span>{stats?.enter || 0}</span>
                            <span>{formatTime(stats?.avg || 0)}</span>
                            <span>{stats?.completions || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 items-start">
                    {STAGES.map((stage) => (
                        <LeaderboardBox
                            key={stage.title}
                            title={stage.title}
                            splitIndex={stage.splitIndex}
                            runners={speedrunners}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Haupt-Export mit Suspense-Boundary
export default function OverlayGeneratorPage() {
    return (
        <Suspense fallback={<div className="bg-gray-900 min-h-screen text-white p-8">Loading stats...</div>}>
            <StatsContent />
        </Suspense>
    );
}