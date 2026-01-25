interface ComProps {
    Player: string;
    Split: string;
    Time: number;
    Twitch?: string;
}

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const SPLITS: Record<string, { label: string; icon: string }> = {
    ENTER_NETHER: { label: "Enter Nether", icon: "ENTER_NETHER" },
    ENTER_BASTION: { label: "Enter Bastion", icon: "ENTER_BASTION" },
    ENTER_FORTRESS: { label: "Enter Fortress", icon: "ENTER_FORTRESS" },
    FINDING_STRONGHOLD: { label: "Finding Stronghold", icon: "FINDING_STRONGHOLD" },
    FOUND_STRONGHOLD: { label: "Found Stronghold", icon: "FOUND_STRONGHOLD" },
    ENTER_END: { label: "Enter End", icon: "ENTER_END" },
    COMPLETED_RUN: { label: "Completed Run", icon: "COMPLETED_RUN" },
};

export const Split: React.FC<ComProps> = ({ Player, Split, Twitch, Time }) => {
    const splitData = SPLITS[Split];
    const hasTwitch = Boolean(Twitch && Twitch.trim() !== "null");

    return (
        <div className="flex justify-between items-center">
            <div className="w-1/2 flex items-center gap-2">
                <img
                    src={`https://mc-heads.net/avatar/${Player}/32`}
                    alt={Player}
                />

                {hasTwitch ? (
                    <a
                        className="text-purple-700 text-2xl cursor-pointer"
                        href={`https://twitch.tv/${Twitch}`}
                    >
                        {Player}
                    </a>
                ) : (
                    <span className="text-neutral-200 text-2xl">
                        {Player}
                    </span>
                )}
            </div>

            <div className="w-1/2">
                {splitData && (
                    <div className="flex gap-2 items-center text-neutral-200 text-2xl">
                        <img src={`/icons/${splitData.icon}.png`} />
                        <span>{splitData.label}</span>
                    </div>
                )}
            </div>

            <div className="w-1/6 text-neutral-200 text-2xl">
                {formatTime(Time)}
            </div>
        </div>
    );
};
