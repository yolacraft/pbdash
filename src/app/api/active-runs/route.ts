import { NextResponse } from "next/server";
import {Run} from "@/app/types/speedrunner";

const EXTERNAL_API_URL = "http://45.93.249.181:8080/api/getActiveRuns";

export async function GET() {
    try {
        const res = await fetch(EXTERNAL_API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            // wichtig für Live-Daten
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `External API error: ${res.status}` },
                { status: res.status }
            );
        }

        const data: Run[] = await res.json();

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Active Runs API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
