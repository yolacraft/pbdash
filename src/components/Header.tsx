"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

export const Header = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: "/", label: "Home" },
        { href: "/watch", label: "Watch" },
        { href: "/overlays", label: "Overlays" },
        { href: "/stats", label: "Stats" },
        { href: "https://discord.gg/NHrd59NWre", label: "Discord", external: true },
    ];

    return (
        <nav className="w-full bg-gray-800 text-white font-sans p-4 px-8 shadow-md shadow-black sticky top-0 z-50">
            <div className="flex flex-wrap items-center justify-between">

                {/* Mobile: Titel oder Platzhalter (optional), falls du links etwas stehen haben willst */}
                <div className="md:hidden text-2xl text-purple-600">
                    PB Dash
                </div>

                {/* Hamburger Button (nur auf Mobile sichtbar) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none"
                    aria-label="Toggle menu"
                >
                    {isOpen ? (
                        // X Icon
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        // Hamburger Icon
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>

                {/* Links Container */}
                {/* Desktop: flex-row, sichtbar. Mobile: flex-col, hidden/block je nach State */}
                <div className={`${isOpen ? "flex" : "hidden"} w-full md:w-auto md:flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0 text-2xl transition-all duration-300`}>
                    {links.map((link, idx) => (
                        <React.Fragment key={link.href}>
                            {link.external ? (
                                <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-purple-600 transition-colors py-2 md:py-0"
                                    onClick={() => setIsOpen(false)} // Menü schließen bei Klick
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    href={link.href}
                                    onClick={() => setIsOpen(false)} // Menü schließen bei Klick
                                    className={`py-2 md:py-0 ${
                                        pathname === link.href
                                            ? "text-purple-600"
                                            : "hover:text-purple-600 transition-colors"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            )}

                            {/* Trenner: Nur anzeigen, wenn nicht das letzte Element UND wir auf Desktop sind */}
                            {idx < links.length - 1 && (
                                <span className="text-neutral-400 font-light hidden md:inline">|</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </nav>
    );
};