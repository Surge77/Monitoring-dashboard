// Script to seed sample metrics
// Run: npx ts-node scripts/ingest-metrics.ts

const API_URL = 'http://localhost:3001';

interface MetricData {
    name: string;
    value: number;
    timestamp?: string;
    unit?: string;
}

async function authenticate(email: string, password: string): Promise<string> {
    let res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
    }

    const data = await res.json() as { token: string };
    return data.token;
}

async function sendMetric(token: string, metric: MetricData) {
    await fetch(`${API_URL}/metrics`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(metric),
    });
    console.log(`Sent: ${metric.name} = ${metric.value}`);
}

function generateMetrics(): MetricData[] {
    return [
        { name: 'cpu_usage', value: Math.random() * 100, unit: '%' },
        { name: 'memory_usage', value: 40 + Math.random() * 40, unit: '%' },
        { name: 'disk_usage', value: 50 + Math.random() * 30, unit: '%' },
        { name: 'network_in', value: Math.random() * 1000, unit: 'MB/s' },
        { name: 'network_out', value: Math.random() * 500, unit: 'MB/s' },
        { name: 'active_connections', value: Math.floor(Math.random() * 500) },
        { name: 'request_latency', value: 50 + Math.random() * 200, unit: 'ms' },
        { name: 'error_rate', value: Math.random() * 5, unit: '%' },
    ];
}

async function main() {
    console.log('Starting metric ingestion...');

    const token = await authenticate('demo@example.com', 'password123');
    console.log('Authenticated');

    // Generate 24h of historical data
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    console.log('Generating historical data...');
    for (let h = 24; h >= 0; h--) {
        const timestamp = new Date(now - h * hourMs).toISOString();
        for (const metric of generateMetrics()) {
            await sendMetric(token, { ...metric, timestamp });
        }
    }

    console.log('Done. Starting live ingestion (every 10s)...');
    setInterval(async () => {
        for (const metric of generateMetrics()) {
            await sendMetric(token, metric);
        }
    }, 10000);
}

main();
