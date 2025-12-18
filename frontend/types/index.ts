export interface User {
    id: string;
    email: string;
    createdAt: string;
}

export interface Metric {
    id: string;
    name: string;
    unit: string;
    createdAt: string;
    latestValue: number | null;
    latestRecordedAt: string | null;
    totalDataPoints: number;
}

export interface MetricValue {
    id: string;
    value: number;
    recordedAt: string;
}

export interface AggregatedData {
    timestamp: string;
    value: number;
    count: number;
}

export interface AggregationResult {
    metric: { id: string; name: string; unit: string };
    range: string;
    aggregationType: string;
    data: AggregatedData[];
}

export interface AlertRule {
    id: string;
    metricId: string;
    metricName: string;
    metricUnit: string;
    operator: '>' | '<' | '>=' | '<=';
    threshold: number;
    isActive: boolean;
    createdAt: string;
    totalEvents: number;
}

export interface AlertEvent {
    id: string;
    metricValue: number;
    triggeredAt: string;
    rule: { id: string; operator: string; threshold: number };
    metric: { id: string; name: string; unit: string };
}

export type TimeRange = '24h' | '7d' | '30d';
export type AggregationType = 'avg' | 'min' | 'max' | 'count';
