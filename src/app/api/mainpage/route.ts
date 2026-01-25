// app/api/mainpage/route.ts
import { NextResponse } from "next/server";
import { MainPageResponse } from "@/app/types/mainpage";

const EXTERNAL_API_URL = "http://45.93.249.181:8080/api/getMainPageStuff";

export async function GET() {
    try {
        const res = await fetch(EXTERNAL_API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            // 'no-store' verhindert Caching, wichtig für Live-Daten wie Speedruns
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `External API error: ${res.status}` },
                { status: res.status }
            );
        }

        const data: MainPageResponse = await res.json();

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}