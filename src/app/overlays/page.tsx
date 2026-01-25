"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";

const BASE_URL = "https://pbdash.yolacraft.de/overlays";

export default function OverlayGeneratorPage() {
    const [color, setColor] = useState("ffffff");
    const [font, setFont] = useState<"mc" | "sans">("mc");

    const urls = useMemo(() => ({
        leaderboard: `${BASE_URL}/leaderboard?color=${color}&font=${font}`,
        enter: `${BASE_URL}/general?color=${color}&font=${font}`,
    }), [color, font]);

    const fontFamily =
        font === "mc"
            ? "Minecraft, monospace"
            : "var(--font-geist-sans), sans-serif";

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("URL kopiert!");
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Header />

            <main className="p-6 max-w-6xl mx-auto flex flex-col gap-8">
                <h1 className="text-3xl font-bold">Overlay Generator</h1>

                {/* Picker */}
                <div className="flex flex-wrap gap-6 items-end">
                    {/* Color Picker */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Farbe</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={`#${color}`}
                                onChange={(e) => setColor(e.target.value.replace("#", ""))}
                                className="w-12 h-12 border rounded"
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value.replace("#", ""))}
                                className="border px-2 py-1 rounded w-28 font-mono bg-gray-800 text-white"
                            />
                        </div>
                    </div>

                    {/* Font Picker */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Font</label>
                        <select
                            value={font}
                            onChange={(e) => setFont(e.target.value as "mc" | "sans")}
                            className="border px-3 py-2 rounded bg-gray-800 text-white"
                        >
                            <option value="mc">Minecraft</option>
                            <option value="sans">Sans</option>
                        </select>
                    </div>
                </div>

                {/* Overlay Preview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(urls).map(([key, url], idx) => (
                        <div
                            key={key}
                            className="bg-gray-800 p-4 rounded flex flex-col gap-3"
                            style={{ fontFamily }}
                        >
                            <p className="font-semibold capitalize">{key} Overlay</p>

                            {/* Vorschau */}
                            {idx == 1 ? (
                                <div className="border p-4 rounded bg-gray-700 h-48">
                                    <p style={{color: "#" + color}} className="text-2xl">325</p>
                                    <p style={{color: "#" + color}} className="text-2xl">02:25</p>
                                </div>
                            ): (
                                <div className="border p-4 rounded bg-gray-700 ">
                                    <p style={{color: "#" + color}} className="text-2xl">1. Pinne 06:17</p>
                                    <p style={{color: "#" + color}} className="text-2xl">2. Doogile 6:52</p>
                                    <p style={{color: "#" + color}} className="text-2xl">3. Feinberg 9:59</p>
                                    <p style={{color: "#" + color}} className="text-2xl">4. Fulham 15:47</p>
                                    <p style={{color: "#" + color}} className="text-2xl">5. Ludwig 02:25:21</p>
                                </div>
                            )}

                            {/* URL + Copy Button */}
                            <div className="flex gap-2 mt-2">
                                <input
                                    readOnly
                                    value={url}
                                    className="flex-1 border px-3 py-2 rounded font-mono bg-gray-900 text-white text-sm"
                                    onClick={(e) => e.currentTarget.select()}
                                />
                                <button
                                    onClick={() => copyToClipboard(url)}
                                    className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
