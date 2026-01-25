interface Props {
    Player: string;
    Time: number;
    pb: boolean;
    place: number;
}

const PLACE_COLORS: Record<number, string> = {
    1: "text-yellow-400",
    2: "text-gray-300",
    3: "text-amber-900",
};

const DEFAULT_COLOR = "text-neutral-200";

function msToMmSs(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const Run: React.FC<Props> = ({ Player, Time, pb, place }) => {
    const colorClass = PLACE_COLORS[place] ?? DEFAULT_COLOR;

    return (
        <div className="flex justify-between items-center">
            {/* Platz */}
            <div className="w-16">
        <span className={`${colorClass} text-2xl`}>
          {place}.
        </span>
            </div>

            {/* Player */}
            <div className="w-1/2 flex items-center gap-2">
                <img
                    src={`https://mc-heads.net/avatar/${Player}/32`}
                    alt={Player}
                />
                <span className={`${colorClass} text-2xl`}>
          {Player}
        </span>
            </div>

            {/* Zeit */}
            <div className="w-1/2">
        <span className={`${colorClass} text-2xl`}>
          {msToMmSs(Time)}
        </span>
                {pb && (
                    <span className={`${colorClass} text-xl ml-1`}>(PB)</span>
                )}
            </div>
        </div>
    );
};
