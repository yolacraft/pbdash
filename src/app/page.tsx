"use client"

import {Header} from "@/components/Header";
import {Run} from "@/components/Main/Run";
import {Split} from "@/components/Main/Split";
import {useEffect, useState} from "react";
import {MainPageResponse} from "@/app/types/mainpage";

export default function Home() {

    const [data, setData] = useState<MainPageResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // setLoading(true); // Optional: Loading state logic anpassen, um Flackern beim Intervall zu vermeiden
                const response = await fetch("/api/mainpage");

                if (!response.ok) {
                    throw new Error("Fehler beim Laden der Main Page Daten");
                }

                const result: MainPageResponse = await response.json();
                setData(result);
            } catch (err) {
                console.error(err);
                setError("Daten konnten nicht geladen werden.");
            } finally {
                setLoading(false);
            }
        };

        const initialFetch = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        }
        initialFetch();

        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);

    }, []);

    return (
        // min-h-screen statt h-screen, damit man auf Mobile scrollen kann
        <div className="bg-gray-900 min-h-screen flex flex-col pb-10">
            <Header />
            <main className="flex flex-col items-center w-full px-4">

                {/* Titel responsive machen: Mobile kleiner, Desktop groß */}
                <span className="text-4xl md:text-6xl lg:text-8xl font-bold text-purple-800 mt-6 text-center">
                    🇩🇪 PB DASH 6
                </span>
                <span className="text-gray-200 text-lg md:text-2xl mt-2">
                    06.02. - 08.02
                </span>

                {/* Container für die beiden Tabellen:
                    Mobile: untereinander (flex-col), Tablet/Desktop: nebeneinander (xl:flex-row) */}
                <div className="flex flex-col xl:flex-row justify-center gap-8 xl:gap-24 mt-8 md:mt-16 w-full max-w-[1600px]">

                    {/* --- LEADERBOARD --- */}
                    {/* w-full sorgt für mobile Breite, max-w verhindert, dass es auf Desktop zu breit wird */}
                    <div className="w-full xl:w-[38rem] rounded-2xl border border-gray-500 overflow-hidden flex flex-col">
                        <div className="bg-gray-700 p-4">
                            <span className="text-white text-2xl md:text-3xl block text-center md:text-left">Leaderboard</span>
                        </div>

                        <div className="bg-[#2a3546] p-2 flex flex-col h-full">
                            <div className="flex justify-between mb-4 px-2 text-sm md:text-base">
                                <div className="w-8 md:w-16"></div> {/* Platzhalter für Rank */}
                                <span className="text-gray-500 w-1/2">PLAYER</span>
                                <span className="text-gray-500 w-1/2 text-right md:text-left">TIME</span>
                            </div>

                            <div className="flex flex-col gap-2 h-[25rem] overflow-y-auto custom-scrollbar">
                                {data?.leaderboard.map((value, idx) => (
                                    <div key={idx}>
                                        <Run Player={value.name} Time={value.Time} pb={value.pb} place={idx+1} />
                                        {idx < data?.leaderboard.length-1 && (
                                            <div className="w-full bg-neutral-500 h-0.5 my-2 rounded-full opacity-30"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- LIVE PACE --- */}
                    <div className="w-full xl:w-[38rem] rounded-2xl border border-gray-500 overflow-hidden flex flex-col bg-[#2a3546]">
                        <div className="bg-gray-700 p-4">
                            <span className="text-white text-2xl md:text-3xl block text-center md:text-left">Live Pace</span>
                        </div>

                        <div className="bg-[#2a3546] p-2 flex flex-col h-full">
                            <div className="flex justify-between mb-4 px-2 text-sm md:text-base">
                                <span className="text-gray-500 w-1/2">PLAYER</span>
                                <span className="text-gray-500 w-1/4">SPLIT</span>
                                <span className="text-gray-500 w-1/4 text-right">TIME</span>
                            </div>

                            <div className="flex flex-col gap-2 h-[25rem] overflow-y-auto custom-scrollbar">
                                {data?.paces.map((value, idx) => (
                                    <div key={idx}>
                                        <Split Player={value.name} Split={value.split} Time={value.Time} Twitch={value.twitch || undefined} />
                                        {idx < data?.paces.length-1 && (
                                            <div className="w-full bg-neutral-500 h-0.5 my-2 rounded-full opacity-30"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}