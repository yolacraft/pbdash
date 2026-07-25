// app/api/nph/[name]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EventStartResponse } from "@/app/types/event";
import { backendUrl } from "@/app/config/backend";

const PACEMAN_URL = "https://paceman.gg/stats/api/getSessionNethers/";

// Rundet die Stunden seit Event-Start großzügig auf, damit die komplette
// Session des Runners abgedeckt ist, auch wenn der Fetch etwas verzögert läuft.
async function getHoursSinceEventStart(): Promise<number> {
    try {
        const res = await fetch(backendUrl("/api/getEventStart"), { cache: "no-store" });
        if (!res.ok) return 12;

        const data: EventStartResponse = await res.json();
        const eventStart = new Date(data.eventStart).getTime();
        const diffHours = (Date.now() - eventStart) / 3_600_000;

        return Math.max(1, Math.ceil(diffHours) + 1);
    } catch {
        return 12;
    }
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        const hours = await getHoursSinceEventStart();

        const url = `${PACEMAN_URL}?name=${encodeURIComponent(name)}&hours=${hours}&hoursBetween=999&nph=true&liveOnly=false&dp=0`;

        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Paceman API error: ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
