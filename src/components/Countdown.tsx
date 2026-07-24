"use client";

import { useEffect, useState } from "react";
import { EventStartResponse } from "@/app/types/event";

function splitDuration(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
}

const Unit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center min-w-[3.5rem] md:min-w-[4.5rem]">
        <span className="text-3xl md:text-5xl font-bold text-white tabular-nums bg-gray-800/80 border border-purple-700/50 rounded-xl px-2 py-1 w-full text-center shadow-lg shadow-purple-900/20">
            {String(value).padStart(2, "0")}
        </span>
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-1">
            {label}
        </span>
    </div>
);

export const Countdown = () => {
    const [event, setEvent] = useState<EventStartResponse | null>(null);
    const [now, setNow] = useState<number>(Date.now());

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch("/api/event-start", { cache: "no-store" });
                if (!res.ok) return;
                const data: EventStartResponse = await res.json();
                setEvent(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchEvent();
        const eventInterval = setInterval(fetchEvent, 30000);
        return () => clearInterval(eventInterval);
    }, []);

    useEffect(() => {
        const tick = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(tick);
    }, []);

    if (!event) return null;

    const start = new Date(event.eventStart).getTime();
    const end = new Date(event.eventEnd).getTime();

    if (now >= end) {
        return (
            <div className="mt-4 text-center">
                <span className="inline-block bg-gray-800 border border-gray-600 text-gray-300 text-lg md:text-xl px-4 py-2 rounded-full">
                    Event ist beendet
                </span>
            </div>
        );
    }

    if (now >= start && now < end) {
        const { days, hours, minutes, seconds } = splitDuration(end - now);
        return (
            <div className="mt-4 flex flex-col items-center gap-2">
                <span className="flex items-center gap-2 bg-red-600/90 text-white text-sm md:text-base font-bold px-4 py-1.5 rounded-full uppercase tracking-wide animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    Live
                </span>
                <span className="text-gray-400 text-sm md:text-base">Event endet in</span>
                <div className="flex gap-2 md:gap-4">
                    {days > 0 && <Unit value={days} label="Tage" />}
                    <Unit value={hours} label="Std" />
                    <Unit value={minutes} label="Min" />
                    <Unit value={seconds} label="Sek" />
                </div>
            </div>
        );
    }

    const { days, hours, minutes, seconds } = splitDuration(start - now);
    return (
        <div className="mt-4 flex flex-col items-center gap-2">
            <span className="text-gray-400 text-sm md:text-base">Event startet in</span>
            <div className="flex gap-2 md:gap-4">
                {days > 0 && <Unit value={days} label="Tage" />}
                <Unit value={hours} label="Std" />
                <Unit value={minutes} label="Min" />
                <Unit value={seconds} label="Sek" />
            </div>
        </div>
    );
};
