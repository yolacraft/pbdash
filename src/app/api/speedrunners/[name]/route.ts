// app/api/speedrunners/[name]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Speedrunner } from "@/app/types/speedrunner";
import { backendUrl } from "@/app/config/backend";

const EXTERNAL_API_URL = backendUrl("/api/getSpeedrunners");

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;

        const res = await fetch(EXTERNAL_API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `External API error: ${res.status}` },
                { status: res.status }
            );
        }

        const data: Speedrunner[] = await res.json();
        const decodedName = decodeURIComponent(name).toLowerCase();

        const runner = data.find(
            (r) => r.name.toLowerCase() === decodedName
        );

        if (!runner) {
            return NextResponse.json(
                { error: "Player not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(runner, { status: 200 });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
