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
        <div className={`bg-gray-700`}>
            <div className="flex gap-2 items-center justify-between mr-4">
                <div className={`flex items-center gap-2 bg-amber-500/50 20 w-fit pr-6 h-12 rounded-br-xl`}>
                    <img
                        src={`https://mc-heads.net/avatar/${Name}/48`}
                        alt={Name}
                        className="h-full"
                    />
                    <span className={`text-white text-xl`}>
                        {Name}
                    </span>
                </div>
                <div className="flex items-center gap-2 p-1.5 h-12">
                    <img src={"/icons/" + split + ".png"}/>
                    <span className={`text-white text-xl`}>{splitdata.label}</span>
                    <span className="text-purple-500 text-xl font-extrabold">{formatTime(time)}</span>
                </div>
            </div>
            {livestream != null && livestream != "null " && livestream != undefined && livestream != "" && (
                <div className="mx-2 mt-2">
                    <iframe
                        src={`https://player.twitch.tv/?channel=${livestream}&parent=localhost`}
                        className="w-full aspect-video"
                        frameBorder="0"
                        scrolling="no"
                        allowFullScreen={false}
                    />
                </div>

            )}
            <div className="flex gap-4 px-2 pb-2 mt-2">
                {splits.slice(-5, -1).map((split, idx) => (
                    <div className="flex gap-2" key={split.rta}>
                        <img src={"/icons/" + split.split + ".png"}/>
                        <span className="text-neutral-200 text-xl">{formatTime(split.igt)}</span>
                    </div>
                ))}
            </div>
            <div className="h-1.5 bg-gray-600">

            </div>
        </div>
    );
}