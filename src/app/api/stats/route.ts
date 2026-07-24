import { NextResponse } from "next/server";
import { backendUrl } from "@/app/config/backend";

export async function GET() {
    const res = await fetch(backendUrl("/api/getRunStatistics"), {
        cache: "no-store",
    });

    if (!res.ok) {
        return NextResponse.json(
            { error: "Failed to fetch run statistics" },
            { status: 500 }
        );
    }

    const data = await res.json();

    return NextResponse.json(data);
}
