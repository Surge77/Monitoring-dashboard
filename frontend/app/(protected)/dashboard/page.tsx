'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Metric, AggregationResult, TimeRange, AggregationType } from '@/types';
import { formatNumber, formatTimeAgo } from '@/lib/utils';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    RefreshCw,
    Clock,
    Database,
    Loader2
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [aggregation, setAggregation] = useState<AggregationResult | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');
    const [aggType, setAggType] = useState<AggregationType>('avg');
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchMetrics = useCallback(async () => {
        try {
            const res = await api.getMetrics();
            setMetrics(res.metrics as Metric[]);
            if (res.metrics.length > 0 && !selected) {
                setSelected((res.metrics[0] as Metric).id);
            }
            setLastUpdate(new Date());
        } catch (err) {
            console.error('Failed to load metrics:', err);
        } finally {
            setLoading(false);
        }
    }, [selected]);

    const fetchAggregation = useCallback(async () => {
        if (!selected) return;
        setChartLoading(true);
        try {
            const res = await api.getMetricAggregate(selected, timeRange, aggType);
            setAggregation(res as AggregationResult);
        } catch (err) {
            console.error('Failed to load aggregation:', err);
        } finally {
            setChartLoading(false);
        }
    }, [selected, timeRange, aggType]);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, [fetchMetrics]);

    useEffect(() => {
        fetchAggregation();
    }, [fetchAggregation]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Updated: {formatTimeAgo(lastUpdate)}
                    </p>
                </div>
                <button
                    onClick={fetchMetrics}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {metrics.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {metrics.slice(0, 8).map((metric, i) => (
                            <MetricCard
                                key={metric.id}
                                metric={metric}
                                isSelected={selected === metric.id}
                                onClick={() => setSelected(metric.id)}
                                colorIndex={i}
                            />
                        ))}
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {aggregation?.metric.name || 'Select a metric'}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {aggType.toUpperCase()} over {timeRange}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex rounded-xl bg-secondary p-1">
                                    {(['24h', '7d', '30d'] as TimeRange[]).map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setTimeRange(r)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === r ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex rounded-xl bg-secondary p-1">
                                    {(['avg', 'min', 'max'] as AggregationType[]).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setAggType(t)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${aggType === t ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {t.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="h-80">
                            {chartLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : aggregation && aggregation.data.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={aggregation.data}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: timeRange === '24h' ? '2-digit' : undefined
                                            })}
                                            stroke="hsl(215, 20%, 65%)"
                                            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
                                        />
                                        <YAxis
                                            stroke="hsl(215, 20%, 65%)"
                                            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
                                            tickFormatter={(v) => formatNumber(v, 1)}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(222, 47%, 8%)',
                                                border: '1px solid hsl(217, 33%, 17%)',
                                                borderRadius: '8px',
                                                color: 'hsl(210, 40%, 98%)',
                                            }}
                                            labelFormatter={(v) => new Date(v).toLocaleString()}
                                            formatter={(value: number) => [
                                                `${formatNumber(value)} ${aggregation.metric.unit}`,
                                                aggregation.metric.name,
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="hsl(262, 83%, 58%)"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No data for this time range
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function MetricCard({ metric, isSelected, onClick, colorIndex }: {
    metric: Metric;
    isSelected: boolean;
    onClick: () => void;
    colorIndex: number;
}) {
    const colors = [
        'from-violet-500 to-purple-500',
        'from-cyan-500 to-teal-500',
        'from-orange-500 to-amber-500',
        'from-pink-500 to-rose-500',
        'from-blue-500 to-indigo-500',
        'from-green-500 to-emerald-500',
        'from-red-500 to-orange-500',
        'from-fuchsia-500 to-pink-500',
    ];

    const getTrend = () => {
        if (metric.latestValue === null) return <Minus className="w-4 h-4" />;
        const rand = Math.random();
        if (rand > 0.6) return <TrendingUp className="w-4 h-4 text-success" />;
        if (rand < 0.4) return <TrendingDown className="w-4 h-4 text-destructive" />;
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <button
            onClick={onClick}
            className={`text-left p-5 rounded-2xl border transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[colorIndex % colors.length]} flex items-center justify-center`}>
                    <Activity className="w-5 h-5 text-white" />
                </div>
                {getTrend()}
            </div>
            <p className="text-sm text-muted-foreground mb-1 truncate">{metric.name}</p>
            <p className="text-2xl font-bold">
                {formatNumber(metric.latestValue)}
                {metric.unit && <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
                {metric.latestRecordedAt ? formatTimeAgo(metric.latestRecordedAt) : 'No data'}
            </p>
        </button>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Database className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Metrics Yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
                Send metrics using the API to see them here.
            </p>
            <div className="p-4 rounded-xl bg-card border border-border">
                <code className="text-sm text-accent">POST /metrics {'{'} name, value {'}'}</code>
            </div>
        </div>
    );
}
