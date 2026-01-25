"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const Header = () => {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home" },
        { href: "/watch", label: "Watch" },
        { href: "/overlays", label: "Overlays" },
        { href: "/stats", label: "Stats" },
        { href: "https://discord.gg/NHrd59NWre", label: "Discord", external: true },
    ];

    return (
        <div className="w-full bg-gray-800 text-white font-sans p-4 px-8 text-2xl flex gap-6 shadow-md shadow-black sticky top-0 z-50">
            {links.map((link, idx) => (
                <React.Fragment key={link.href}>
                    {link.external ? (
                        <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-600 transition-colors"
                        >
                            {link.label}
                        </a>
                    ) : (
                        <Link
                            href={link.href}
                            className={
                                pathname === link.href
                                    ? "text-purple-600"
                                    : "hover:text-purple-600 transition-colors"
                            }
                        >
                            {link.label}
                        </Link>
                    )}
                    {idx < links.length - 1 && (
                        <span className="text-neutral-400 font-light">|</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
