"use client"

import { Element } from "@/components/Watch/element";
import { useEffect, useState } from "react";
import { Run } from "@/app/types/speedrunner";
import { formatTime } from "@/app/utils/format";
import { Header } from "@/components/Header";

const Home = () => {

    const [runs, setRuns] = useState<Run[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hilfsfunktion, um den aktiven Streamer zu finden
    const activeStreamer = runs?.find(run => run.liveStreamed != null);

    useEffect(() => {
        const fetchRuns = async () => {
            try {
                // Hinweis: Loading State bei Intervallen ggf. nicht jedes Mal setzen,
                // um Flackern zu vermeiden, aber für Initial Load okay.
                // setLoading(true);
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

        // Initialer Abruf mit Loading State
        const initialFetch = async () => {
            setLoading(true);
            await fetchRuns();
            setLoading(false);
        };
        initialFetch();

        const interval = setInterval(fetchRuns, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col">
            <Header />

            {/* Main Layout Container: Mobil Spalte, Desktop Zeile */}
            <div className="flex flex-col lg:flex-row flex-1">

                {/* Video Area: Mobil 100%, Desktop 75% */}
                <div className="w-full lg:w-3/4 flex justify-center mt-4 lg:mt-10 px-2 lg:px-0 mb-8 lg:mb-0">
                    {runs?.some(run => run.liveStreamed != null) ? (
                        <div className="w-full max-w-[1280px] flex flex-col items-center">

                            {/* Responsive Video Container (Aspect Ratio) */}
                            <div className="w-full aspect-video bg-black shadow-lg">
                                <iframe
                                    src={`https://player.twitch.tv/?channel=${activeStreamer?.liveStreamed}&parent=pbdash.yolacraft.de`}
                                    frameBorder="0"
                                    allowFullScreen={true} // Besser auf true setzen für UX
                                    scrolling="no"
                                    className="w-full h-full"
                                ></iframe>
                            </div>

                            {/* Info Area unter dem Video */}
                            <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-8 items-center w-full justify-center">
                                <div className="bg-amber-500/50 text-2xl md:text-4xl text-neutral-200 p-2 md:p-4 rounded-md w-fit font-bold shadow-md text-center">
                                    {activeStreamer?.playerName}
                                </div>

                                {/* Splits: Flex-Wrap erlaubt Umbruch auf kleinen Screens */}
                                <div className="flex gap-4 md:gap-8 flex-wrap justify-center">
                                    {activeStreamer?.splits.map((split, idx) => (
                                        <div key={split.rta + idx} className="flex flex-col items-center">
                                            <img
                                                src={"/icons/" + split.split + ".png"}
                                                alt={split.split}
                                                className="w-8 h-8 md:w-auto md:h-auto" // Icons skalieren
                                            />
                                            <span className="text-neutral-200 text-lg md:text-xl font-mono">
                                                {formatTime(split.igt)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 lg:h-auto">
                            <span className="text-white text-4xl md:text-6xl lg:text-8xl text-center px-4">
                                Niemand Live...
                            </span>
                        </div>
                    )}
                </div>

                {/* Sidebar / List: Mobil 100%, Desktop 25% */}
                <div className="w-full lg:w-1/4 flex flex-col border-t-4 lg:border-t-0 lg:border-l-4 border-gray-600 bg-gray-800/50 lg:bg-transparent">
                    {/* Header der Liste */}
                    <span className="p-4 text-neutral-200 text-2xl md:text-3xl font-bold bg-gray-900 lg:bg-transparent sticky top-0 z-10">
                        Mehr Runs:
                    </span>

                    <div className="h-1.5 bg-gray-600 w-full hidden lg:block"></div>

                    {/* Scrollbarer Bereich für die Liste */}
                    {/* Auf Mobile: Auto-Höhe oder max-height. Auf Desktop: Füllt verbleibenden Platz */}
                    <div className="overflow-y-auto lg:h-[calc(100vh-8rem)] pb-10">
                        {runs
                            ?.filter((_, i) => i !== runs.findIndex(run => run.liveStreamed !== null))
                            .map(run => (
                                <Element
                                    key={run.worldID}
                                    time={run.splits.at(-1)?.igt || 0}
                                    split={run.splits.at(-1)?.split || "ENTER_NETHER"}
                                    Name={run.playerName}
                                    livestream={run.liveStreamed}
                                    splits={run.splits}
                                />
                            ))
                        }
                        {/* Fallback falls keine weiteren Runs da sind */}
                        {runs && runs.length <= 1 && (
                            <div className="p-4 text-gray-500 italic">Keine weiteren Runs aktiv.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;