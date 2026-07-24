"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface RunnerName {
    name: string;
}

export const Header = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: "/", label: "Home" },
        { href: "/watch", label: "Watch" },
        { href: "/overlays", label: "Overlays" },
        { href: "/stats", label: "Stats" },
        { href: "/bot", label: "Bot" },
        { href: "https://discord.gg/NHrd59NWre", label: "Discord", external: true },
    ];

    const [names, setNames] = useState<string[]>([]);
    const [query, setQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadNames = async () => {
            try {
                const res = await fetch("/api/speedrunners", { cache: "no-store" });
                if (!res.ok) return;
                const data: RunnerName[] = await res.json();
                setNames(data.map((r) => r.name));
            } catch (err) {
                console.error(err);
            }
        };
        loadNames();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = query.trim()
        ? names
            .filter((n) => n.toLowerCase().includes(query.trim().toLowerCase()))
            .slice(0, 6)
        : [];

    const goToProfile = (name: string) => {
        if (!name.trim()) return;
        setShowSuggestions(false);
        setIsOpen(false);
        setQuery("");
        router.push(`/profile/${encodeURIComponent(name.trim())}`);
    };

    return (
        <nav className="w-full bg-gray-900/95 backdrop-blur text-white font-sans border-b border-purple-900/40 sticky top-0 z-50 shadow-lg shadow-black/40">
            <div className="flex items-center justify-between gap-4 px-4 md:px-8 py-3">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setIsOpen(false)}>
                    <span className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        PB Dash
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6 text-lg flex-1 justify-center">
                    {links.map((link) => (
                        link.external ? (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-purple-400 transition-colors"
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`transition-colors ${
                                    pathname === link.href
                                        ? "text-purple-400 font-semibold"
                                        : "hover:text-purple-400"
                                }`}
                            >
                                {link.label}
                            </Link>
                        )
                    ))}
                </div>

                {/* Search (desktop, top right) */}
                <div ref={searchRef} className="hidden md:block relative w-64 shrink-0">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") goToProfile(query);
                            }}
                            placeholder="Player suchen..."
                            className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-md py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-gray-500"
                        />
                    </div>

                    {showSuggestions && filtered.length > 0 && (
                        <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-md overflow-hidden shadow-xl">
                            {filtered.map((name) => (
                                <button
                                    key={name}
                                    onClick={() => goToProfile(name)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-purple-700/40 transition-colors"
                                >
                                    <img
                                        src={`https://mc-heads.net/avatar/${name}/20`}
                                        alt=""
                                        className="w-5 h-5 rounded-sm"
                                    />
                                    {name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Hamburger (mobile) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none"
                    aria-label="Toggle menu"
                >
                    {isOpen ? (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden flex flex-col gap-1 px-4 pb-4 text-lg border-t border-gray-800 pt-3">
                    <div className="relative mb-2">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") goToProfile(query);
                            }}
                            placeholder="Player suchen..."
                            className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-full py-2 pl-9 pr-3 text-base outline-none transition-colors placeholder:text-gray-500"
                        />
                        {filtered.length > 0 && (
                            <div className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                                {filtered.map((name) => (
                                    <button
                                        key={name}
                                        onClick={() => goToProfile(name)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-purple-700/40 transition-colors"
                                    >
                                        <img
                                            src={`https://mc-heads.net/avatar/${name}/20`}
                                            alt=""
                                            className="w-5 h-5 rounded-sm"
                                        />
                                        {name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {links.map((link) => (
                        link.external ? (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 hover:text-purple-400 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`py-2 ${
                                    pathname === link.href
                                        ? "text-purple-400 font-semibold"
                                        : "hover:text-purple-400 transition-colors"
                                }`}
                            >
                                {link.label}
                            </Link>
                        )
                    ))}
                </div>
            )}
        </nav>
    );
};
