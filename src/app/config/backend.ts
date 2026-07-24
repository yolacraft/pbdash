export const BACKEND_URL = process.env.BACKEND_URL ?? "http://45.93.249.181:8080";

export function backendUrl(path: string): string {
    return `${BACKEND_URL}${path}`;
}
