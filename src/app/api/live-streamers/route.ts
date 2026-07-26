// app/api/live-streamers/route.ts
import { NextResponse } from "next/server";
import { Speedrunner } from "@/app/types/speedrunner";
import { backendUrl } from "@/app/config/backend";

// decapi.me erlaubt Live-Checks ohne Twitch-API-Credentials.
// Offline-Kanäle liefern "<name> is offline", Live-Kanäle eine Uptime.
const UPTIME_URL = "https://decapi.me/twitch/uptime/";

// Ergebnisse kurz cachen, damit wir decapi bei mehreren Clients / häufigem
// Polling nicht mit einem Request pro Runner überrennen.
const CACHE_TTL_MS = 60_000;

let cache: { at: number; data: string[] } | null = null;

async function isLive(channel: string): Promise<boolean> {
    try {
        const res = await fetch(`${UPTIME_URL}${encodeURIComponent(channel)}`, {
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return false;

        const text = (await res.text()).trim().toLowerCase();

        // Alles was nicht "offline" / "not found" / Fehler ist, gilt als live.
        if (!text) return false;
        if (text.includes("offline")) return false;
        if (text.includes("not found")) return false;
        if (text.includes("error")) return false;
        if (text.includes("no user")) return false;

        return true;
    } catch {
        return false;
    }
}

export async function GET() {
    try {
        if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
            return NextResponse.json({ live: cache.data, cached: true }, { status: 200 });
        }

        const res = await fetch(backendUrl("/api/getSpeedrunners"), { cache: "no-store" });

        if (!res.ok) {
            return NextResponse.json(
                { error: `External API error: ${res.status}` },
                { status: res.status }
            );
        }

        const runners: Speedrunner[] = await res.json();

        const channels = Array.from(
            new Set(
                runners
                    .map((r) => r.twitch)
                    .filter((t): t is string => Boolean(t) && t !== "null" && t.trim() !== "")
                    .map((t) => t.trim())
            )
        );

        const results = await Promise.all(
            channels.map(async (c) => ({ channel: c, live: await isLive(c) }))
        );

        const live = results.filter((r) => r.live).map((r) => r.channel);

        cache = { at: Date.now(), data: live };

        return NextResponse.json({ live, cached: false }, { status: 200 });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
