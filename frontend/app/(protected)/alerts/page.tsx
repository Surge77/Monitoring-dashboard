'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { AlertRule, AlertEvent, Metric } from '@/types';
import { formatNumber, formatDate, getOperatorSymbol } from '@/lib/utils';
import {
    Bell,
    Plus,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Power,
} from 'lucide-react';

export default function AlertsPage() {
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [events, setEvents] = useState<AlertEvent[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [tab, setTab] = useState<'rules' | 'events'>('rules');

    const fetchData = useCallback(async () => {
        try {
            const [rulesRes, eventsRes, metricsRes] = await Promise.all([
                api.getAlerts(),
                api.getAlertEvents(),
                api.getMetrics(),
            ]);
            setRules(rulesRes.alertRules as AlertRule[]);
            setEvents(eventsRes.alertEvents as AlertEvent[]);
            setMetrics(metricsRes.metrics as Metric[]);
        } catch (err) {
            console.error('Failed to load alerts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this alert rule?')) return;
        try {
            await api.deleteAlert(id);
            setRules(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleToggle = async (rule: AlertRule) => {
        try {
            await api.updateAlert(rule.id, { isActive: !rule.isActive });
            setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

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
                    <h1 className="text-3xl font-bold mb-1">Alerts</h1>
                    <p className="text-muted-foreground">Manage alert rules and view events</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    disabled={metrics.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 gradient-primary rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    <Plus className="w-5 h-5" />
                    Create Alert
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab('rules')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${tab === 'rules' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Alert Rules ({rules.length})
                </button>
                <button
                    onClick={() => setTab('events')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${tab === 'events' ? 'bg-destructive text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Bell className="w-4 h-4" />
                    Events ({events.length})
                </button>
            </div>

            {tab === 'rules' ? (
                <RulesList rules={rules} onDelete={handleDelete} onToggle={handleToggle} />
            ) : (
                <EventsList events={events} />
            )}

            {showModal && (
                <CreateModal
                    metrics={metrics}
                    onClose={() => setShowModal(false)}
                    onCreate={(rule) => {
                        setRules(prev => [rule, ...prev]);
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
}

function RulesList({ rules, onDelete, onToggle }: {
    rules: AlertRule[];
    onDelete: (id: string) => void;
    onToggle: (rule: AlertRule) => void;
}) {
    if (rules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                    <Bell className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Alert Rules</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    Create alert rules to get notified when metrics cross thresholds.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {rules.map((rule) => (
                <div
                    key={rule.id}
                    className={`p-5 rounded-2xl border transition-all ${rule.isActive ? 'border-border bg-card' : 'border-border/50 bg-card/50 opacity-60'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${rule.isActive ? 'bg-warning/20 text-warning' : 'bg-secondary text-muted-foreground'
                                }`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{rule.metricName}</p>
                                <p className="text-muted-foreground">
                                    Alert when value {getOperatorSymbol(rule.operator)}{' '}
                                    <span className="text-foreground font-medium">
                                        {rule.threshold}{rule.metricUnit && ` ${rule.metricUnit}`}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right mr-4">
                                <p className="text-sm text-muted-foreground">Triggered</p>
                                <p className="font-semibold">{rule.totalEvents} times</p>
                            </div>

                            <button
                                onClick={() => onToggle(rule)}
                                className={`p-2.5 rounded-xl transition-all ${rule.isActive
                                        ? 'bg-success/20 text-success hover:bg-success/30'
                                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                    }`}
                                title={rule.isActive ? 'Disable' : 'Enable'}
                            >
                                <Power className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => onDelete(rule.id)}
                                className="p-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EventsList({ events }: { events: AlertEvent[] }) {
    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold mb-2">All Clear</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    No alerts have been triggered.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {events.map((event) => (
                <div
                    key={event.id}
                    className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-center gap-4"
                >
                    <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium">
                            {event.metric.name}{' '}
                            <span className="text-muted-foreground">
                                {getOperatorSymbol(event.rule.operator)} {event.rule.threshold}
                            </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Value: <span className="text-destructive font-medium">
                                {formatNumber(event.metricValue)}{event.metric.unit && ` ${event.metric.unit}`}
                            </span>
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground flex-shrink-0">
                        {formatDate(event.triggeredAt)}
                    </p>
                </div>
            ))}
        </div>
    );
}

function CreateModal({ metrics, onClose, onCreate }: {
    metrics: Metric[];
    onClose: () => void;
    onCreate: (rule: AlertRule) => void;
}) {
    const [metricId, setMetricId] = useState(metrics[0]?.id || '');
    const [operator, setOperator] = useState('>');
    const [threshold, setThreshold] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.createAlert({
                metricId,
                operator,
                threshold: parseFloat(threshold),
            });
            const metric = metrics.find(m => m.id === metricId);
            onCreate({
                ...(res.alertRule as AlertRule),
                metricName: metric?.name || '',
                metricUnit: metric?.unit || '',
                totalEvents: 0,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create alert');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-6">Create Alert Rule</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Metric</label>
                        <select
                            value={metricId}
                            onChange={(e) => setMetricId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary outline-none"
                        >
                            {metrics.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} {m.unit && `(${m.unit})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Condition</label>
                            <select
                                value={operator}
                                onChange={(e) => setOperator(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary outline-none"
                            >
                                <option value=">">&gt; Greater than</option>
                                <option value="<">&lt; Less than</option>
                                <option value=">=">&ge; Greater or equal</option>
                                <option value="<=">&le; Less or equal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Threshold</label>
                            <input
                                type="number"
                                step="any"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary outline-none"
                                placeholder="e.g. 80"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 gradient-primary rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
