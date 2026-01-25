// types.ts

export interface Split {
    split: string;
    igt: number;
    rta: number;
}

export interface Run {
    playerName: string;
    gameVersion: string;
    worldID: string;
    splits: Split[];
    timestamp: number;
    active: boolean;
    cheated: boolean;
    hidden: boolean;
    liveStreamed: string;
}

export interface Pace {
    // Wir definieren die bekannten Keys, erlauben aber auch dynamische Strings
    ENTER_NETHER?: number;
    ENTER_BASTION?: number;
    ENTER_FORTRESS?: number;
    FINDING_STRONGHOLD?: number;
    FOUND_STRONGHOLD?: number;
    ENTER_END?: number;
    COMPLETED_RUN?: number;
    [key: string]: number | undefined;
}

export interface Speedrunner {
    name: string;
    twitch: string;
    pbpace: Pace;
    runs: Run[];
}