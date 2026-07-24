"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";

const BASE_URL = "https://pbdash.yolacraft.de/overlays";

export default function OverlayGeneratorPage() {
    const [color, setColor] = useState("ffffff");
    const [font, setFont] = useState<"mc" | "sans">("mc");
    const [copied, setCopied] = useState<string | null>(null);

    const urls = useMemo(() => ({
        LEADERBOARD: `${BASE_URL}/leaderboard?color=${color}&font=${font}`,
        ENTER: `${BASE_URL}/general?color=${color}&font=${font}`,
    }), [color, font]);

    const fontFamily =
        font === "mc"
            ? "Minecraft, monospace"
            : "var(--font-geist-sans), sans-serif";

    const copyToClipboard = (key: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied((current) => (current === key ? null : current)), 1500);
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col relative overflow-hidden">

            {/* Dekorativer Glow-Hintergrund */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-56 left-1/2 -translate-x-1/2 w-[70rem] h-[70rem] bg-purple-700/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col flex-1">
                <Header />

                <main className="p-6 max-w-6xl mx-auto w-full flex flex-col gap-8 mt-4 md:mt-8">
                    <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500">
                        Overlay Generator
                    </span>

                    {/* Picker */}
                    <div className="flex flex-wrap gap-6 items-end bg-gray-800/60 border border-gray-700 p-5">
                        {/* Color Picker */}
                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-300">Farbe</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={`#${color}`}
                                    onChange={(e) => setColor(e.target.value.replace("#", ""))}
                                    className="w-10 h-10 border border-gray-700 rounded-lg bg-gray-900 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value.replace("#", ""))}
                                    className="border border-gray-700 focus:border-purple-500 outline-none px-3 py-2 rounded-lg w-28 font-mono bg-gray-900 text-white transition-colors h-10"
                                />
                            </div>
                        </div>

                        {/* Font Picker */}
                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-300">Font</label>
                            <select
                                value={font}
                                onChange={(e) => setFont(e.target.value as "mc" | "sans")}
                                className="border border-gray-700 focus:border-purple-500 outline-none px-3 h-10 py-2 rounded-lg bg-gray-900 text-white transition-colors"
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
                                className="border border-gray-700 overflow-hidden shadow-xl shadow-black/20 flex flex-col"
                            >
                                <div className="bg-gradient-to-r from-gray-800 to-gray-800/60 p-4 border-b border-purple-900/40">
                                    <span className="font-semibold uppercase tracking-wide text-gray-200">{key} Overlay</span>
                                </div>

                                <div className="bg-[#2a3546] p-4 flex flex-col gap-3 flex-1">
                                    {/* Vorschau */}
                                    {idx == 1 ? (
                                        <div className="border border-gray-700 p-4 rounded-lg bg-gray-900/60 h-48" style={{ fontFamily }}>
                                            <p style={{ color: "#" + color }} className="text-2xl">325</p>
                                            <p style={{ color: "#" + color }} className="text-2xl">02:25</p>
                                        </div>
                                    ) : (
                                        <div className="border border-gray-700 p-4 rounded-lg bg-gray-900/60" style={{ fontFamily }}>
                                            <p style={{ color: "#" + color }} className="text-2xl">1. PINNE 06:17</p>
                                            <p style={{ color: "#" + color }} className="text-2xl">2. DOOGILE 6:52</p>
                                            <p style={{ color: "#" + color }} className="text-2xl">3. FEINBERG 9:59</p>
                                            <p style={{ color: "#" + color }} className="text-2xl">4. FULHAM 15:47</p>
                                            <p style={{ color: "#" + color }} className="text-2xl">5. LUDWIG 02:25:21</p>
                                        </div>
                                    )}

                                    {/* URL + Copy Button */}
                                    <div className="flex gap-2 mt-auto">
                                        <input
                                            readOnly
                                            value={url}
                                            className="flex-1 border border-gray-700 px-3 py-2 rounded-lg font-mono bg-gray-900 text-white text-sm outline-none"
                                            onClick={(e) => e.currentTarget.select()}
                                        />
                                        <button
                                            onClick={() => copyToClipboard(key, url)}
                                            className="bg-purple-600 hover:bg-purple-500 transition-colors px-4 py-2 rounded-lg text-white text-sm font-semibold whitespace-nowrap"
                                        >
                                            {copied === key ? "Kopiert!" : "Copy"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
