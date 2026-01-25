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
                setLoading(true);
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

        fetchData();

        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);

    }, []);



    return (
    <div  className="bg-gray-900 h-screen">
        <Header />
        <main className="flex flex-col items-center">
            <span className="text-8xl font-bold text-purple-800 mt-6">🇩🇪 PB DASH 6</span>
            <span className="text-gray-200 text-2xl">06.02. - 08.02</span>

            <div className="flex justify-between gap-24">
                <div className="flex gap-24 mt-16">
                    <div className="rounded-2xl border-1 border-gray-500 overflow-hidden">
                        <div className="bg-gray-700 w-[38rem]">
                            <span className="text-white p-4 text-3xl block">Leaderboard</span>
                        </div>


                        <div className="bg-[#2a3546] p-1 px-2 flex flex-col">
                            <div className="flex justify-between mb-4">
                                <div className="w-16"></div>
                                <span className="text-gray-500 w-1/2">PLAYER</span>
                                <span className="text-gray-500 w-1/2">TIME</span>
                            </div>
                            <div className="flex flex-col gap-2 h-[25rem] overflow-scroll">

                                {data?.leaderboard.map((value, idx) => (
                                    <div key={idx}>
                                        <Run Player={value.name} Time={value.Time} pb={value.pb} place={idx+1} />
                                        {idx < data?.leaderboard.length-1 && (
                                            <div className="w-full bg-neutral-500 h-0.5 my-2 rounded-full"></div>
                                        )}
                                    </div>
                                ))}

                            </div>

                        </div>
                    </div>
                </div>


                <div className="flex justify-between gap-24 mt-16">
                    <div className="rounded-2xl bg-[#2a3546] border-1 border-gray-500 overflow-hidden">
                        <div className="bg-gray-700 w-[38rem]">
                            <span className="text-white p-4 text-3xl block">Live Pace</span>
                        </div>

                        <div className="bg-[#2a3546] p-1 px-2 flex flex-col">
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-500 w-1/2">PLAYER</span>
                                <span className="text-gray-500 w-1/2">SPLIT</span>
                                <span className="text-gray-500 w-1/6">TIME</span>
                            </div>

                            <div className="flex flex-col gap-2 h-[25rem] overflow-scroll">

                                {data?.paces.map((value, idx) => (
                                    <div key={idx}>
                                        <Split Player={value.name} Split={value.split} Time={value.Time} Twitch={value.twitch || undefined} />
                                        {idx < data?.paces.length-1 && (
                                            <div className="w-full bg-neutral-500 h-0.5 my-2 rounded-full"></div>
                                        )}
                                    </div>
                                ))}


                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}
