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
    <div className="flex flex-col items-center min-w-[5rem] md:min-w-[8rem]">
        <div className="bg-gray-950/60 border border-purple-700/40 rounded-sm px-3 py-3 w-full shadow-lg shadow-purple-900/30">
            <span className="block text-5xl md:text-8xl font-bold tabular-nums text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200">
                {String(value).padStart(2, "0")}
            </span>
        </div>
        <span className="text-xs md:text-base uppercase tracking-widest text-gray-400 mt-2">
            {label}
        </span>
    </div>
);

export type EventPhase = "loading" | "upcoming" | "live" | "ended";

interface Props {
    onPhaseChange?: (phase: EventPhase) => void;
}

export const Countdown = ({ onPhaseChange }: Props) => {
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

    const start = event ? new Date(event.eventStart).getTime() : 0;
    const end = event ? new Date(event.eventEnd).getTime() : 0;

    const phase: EventPhase = !event
        ? "loading"
        : now >= end
            ? "ended"
            : now >= start
                ? "live"
                : "upcoming";

    useEffect(() => {
        onPhaseChange?.(phase);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    if (!event || phase !== "upcoming") return null;

    const { days, hours, minutes, seconds } = splitDuration(start - now);
    return (
        <div className="mt-6 flex flex-col items-center gap-3">
            <span className="text-gray-400 text-base md:text-xl">Event startet in</span>
            <div className="flex gap-3 md:gap-6">
                {days > 0 && <Unit value={days} label="Tage" />}
                <Unit value={hours} label="Std" />
                <Unit value={minutes} label="Min" />
                <Unit value={seconds} label="Sek" />
            </div>
        </div>
    );
};
