"use client"

import {Element} from "@/components/Watch/element";
import {useEffect, useState} from "react";
import {Run} from "@/app/types/speedrunner";
import {formatTime} from "@/app/utils/format";
import {Header} from "@/components/Header";

const home = () => {

    const [runs, setRuns] = useState<Run[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRuns = async () => {

            try {
                setLoading(true);
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

        fetchRuns();

        const interval = setInterval(fetchRuns, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div  className="bg-gray-900 h-screen">
            <Header />
            <div className="flex">

                <div className="w-3/4 flex justify-center mt-10">
                    {runs?.some(run => run.liveStreamed != null) ? (
                        <div>
                            <iframe src={`https://player.twitch.tv/?channel=${runs?.find(run => run.liveStreamed != null)?.liveStreamed}&parent=pbdash.yolacraft.de`} frameBorder="0"
                                    allowFullScreen={false} scrolling="no" height="720" width="1280" className=""></iframe>
                            <div className=" mt-4 flex gap-8 items-center">
                                <div className="bg-amber-500/50 text-4xl text-neutral-200 p-4 rounded-md w-fit">
                                    {runs?.find(run => run.liveStreamed != null)?.playerName}
                                </div>
                                <div className="flex gap-8">
                                    {runs?.find(run => run.liveStreamed != null)?.splits.map((split, idx) => (
                                        <div key={split.rta}>
                                            <img src={"/icons/" + split.split + ".png"}/>
                                            <span className="text-neutral-200 text-xl">{formatTime(split.igt)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-white text-8xl">Niemand Live...</span>
                    )}
                </div>
                <div className="w-1/4 flex flex-col overflow-scroll h-[calc(100vh-4rem)] border-l-6 border-gray-600">
                    <span className="p-2 text-neutral-200 text-3xl">Mehr Runs:</span>
                    <div>

                        <div className="h-1.5 bg-gray-600">

                        </div>
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
                    </div>
                </div>
            </div>
        </div>

    )
}

export default home;