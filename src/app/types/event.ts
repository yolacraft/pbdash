// app/types/event.ts

export interface EventStartResponse {
    eventStart: string; // ISO-8601
    eventEnd: string;   // ISO-8601
    active: boolean;
}
