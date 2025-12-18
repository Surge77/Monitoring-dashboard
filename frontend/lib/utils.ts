import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatNumber(value: number | null, decimals = 2): string {
    if (value === null || value === undefined) return '-';
    return value.toFixed(decimals);
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleString();
}

export function formatTimeAgo(date: string | Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
}

export function getOperatorSymbol(op: string): string {
    const map: Record<string, string> = { '>': '>', '<': '<', '>=': '≥', '<=': '≤' };
    return map[op] || op;
}
