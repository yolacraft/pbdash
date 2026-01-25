import { NextResponse } from "next/server";

export async function GET() {
    const res = await fetch("http://45.93.249.181:8080/api/getRunStatistics", {
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
