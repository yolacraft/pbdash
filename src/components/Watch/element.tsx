import Link from "next/link";
import {formatTime} from "@/app/utils/format";
import {Split} from "@/app/types/mainpage";

interface ElementProps {
    Name: string;
    livestream:string;
    split: string;
    time: number;
    splits:Split[];
}

const SPLITS: Record<string, { label: string; icon: string }> = {
    ENTER_NETHER: { label: "Enter Nether", icon: "ENTER_NETHER" },
    ENTER_BASTION: { label: "Enter Bastion", icon: "ENTER_BASTION" },
    ENTER_FORTRESS: { label: "Enter Fortress", icon: "ENTER_FORTRESS" },
    FINDING_STRONGHOLD: { label: "First Portal", icon: "FINDING_STRONGHOLD" },
    FOUND_STRONGHOLD: { label: "Stronghold", icon: "FOUND_STRONGHOLD" },
    ENTER_END: { label: "Enter End", icon: "ENTER_END" },
    COMPLETED_RUN: { label: "Finish", icon: "COMPLETED_RUN" },
};


export const Element:React.FC<ElementProps> = ({livestream, time, split, Name, splits}) => {
    const splitdata = SPLITS[split];

    const hasTwitch = Boolean(livestream && livestream.trim() !== "null");

    return (
        <div className="border-b border-gray-800 bg-gray-800/30 hover:bg-gray-800/60 transition-colors">
            <div className="flex gap-2 items-center justify-between px-3 py-2">
                <Link href={`/profile/${encodeURIComponent(Name)}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img
                        src={`https://mc-heads.net/avatar/${Name}/32`}
                        alt={Name}
                        className="w-8 h-8 rounded"
                    />
                    <span className="text-gray-100 text-lg font-semibold">
                        {Name}
                    </span>
                </Link>
                <div className="flex items-center gap-2">
                    <img src={"/icons/" + split + ".png"} alt="" className="w-5 h-5" />
                    <span className="text-gray-300 text-sm">{splitdata.label}</span>
                    <span className="text-purple-400 text-lg font-mono font-bold">{formatTime(time)}</span>
                </div>
            </div>

            {hasTwitch && (
                <div className="px-3 pb-3">
                    <iframe
                        src={`https://player.twitch.tv/?channel=${livestream}&parent=pbdash.yolacraft.de`}
                        className="w-full aspect-video overflow-hidden border border-gray-700"
                        frameBorder="0"
                        scrolling="no"
                        allowFullScreen={false}
                    />
                </div>
            )}

            <div className="flex gap-3 px-3 pb-3 flex-wrap">
                {splits.slice(-5, -1).map((s) => (
                    <div className="flex items-center gap-1.5" key={s.rta}>
                        <img src={"/icons/" + s.split + ".png"} alt="" className="w-4 h-4" />
                        <span className="text-gray-400 text-sm font-mono">{formatTime(s.igt)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
