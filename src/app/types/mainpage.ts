// app/types/mainpage.ts

export interface Split {
    split: string; // z.B. "ENTER_NETHER"
    igt: number;
    rta: number;
}

export interface LeaderboardItem {
    name: string;
    pb: boolean;
    Time: number; // Achtung: Großes 'T' wie im JSON
}

export interface PaceItem {
    name: string;
    twitch: string | null; // Kann null sein, wenn nicht live/angegeben
    splits: Split[];
    split: string; // Der aktuelle Split-Name
    Time: number; // Achtung: Großes 'T' wie im JSON
}

export interface MainPageResponse {
    leaderboard: LeaderboardItem[];
    paces: PaceItem[];
}