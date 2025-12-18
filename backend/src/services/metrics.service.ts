import prisma from '../utils/prisma';
import { CreateMetricValueInput, AggregateQueryInput } from '../utils/validation';
import { HttpError } from '../middlewares/error.middleware';

export async function createMetricValue(userId: string, input: CreateMetricValueInput) {
    let metric = await prisma.metric.findUnique({
        where: { userId_name: { userId, name: input.name } },
    });

    if (!metric) {
        metric = await prisma.metric.create({
            data: { name: input.name, unit: input.unit || '', userId },
        });
    } else if (input.unit && metric.unit !== input.unit) {
        metric = await prisma.metric.update({
            where: { id: metric.id },
            data: { unit: input.unit },
        });
    }

    const recordedAt = input.timestamp ? new Date(input.timestamp) : new Date();
    const metricValue = await prisma.metricValue.create({
        data: { metricId: metric.id, value: input.value, recordedAt },
        include: { metric: true },
    });

    return metricValue;
}

export async function getAllMetrics(userId: string) {
    const metrics = await prisma.metric.findMany({
        where: { userId },
        include: {
            values: { orderBy: { recordedAt: 'desc' }, take: 1 },
            _count: { select: { values: true } },
        },
        orderBy: { name: 'asc' },
    });

    return metrics.map(m => ({
        id: m.id,
        name: m.name,
        unit: m.unit,
        createdAt: m.createdAt,
        latestValue: m.values[0]?.value ?? null,
        latestRecordedAt: m.values[0]?.recordedAt ?? null,
        totalDataPoints: m._count.values,
    }));
}

export async function getMetricById(userId: string, metricId: string) {
    const metric = await prisma.metric.findFirst({
        where: { id: metricId, userId },
        include: {
            values: { orderBy: { recordedAt: 'desc' }, take: 1 },
            _count: { select: { values: true, alertRules: true } },
        },
    });

    if (!metric) {
        throw new HttpError('Metric not found', 404);
    }

    return {
        id: metric.id,
        name: metric.name,
        unit: metric.unit,
        createdAt: metric.createdAt,
        latestValue: metric.values[0]?.value ?? null,
        latestRecordedAt: metric.values[0]?.recordedAt ?? null,
        totalDataPoints: metric._count.values,
        totalAlertRules: metric._count.alertRules,
    };
}

export async function getMetricValues(userId: string, metricId: string, limit = 100) {
    const metric = await prisma.metric.findFirst({ where: { id: metricId, userId } });
    if (!metric) {
        throw new HttpError('Metric not found', 404);
    }

    return prisma.metricValue.findMany({
        where: { metricId },
        orderBy: { recordedAt: 'desc' },
        take: limit,
    });
}

export async function getAggregatedMetrics(userId: string, metricId: string, query: AggregateQueryInput) {
    const metric = await prisma.metric.findFirst({ where: { id: metricId, userId } });
    if (!metric) {
        throw new HttpError('Metric not found', 404);
    }

    const now = new Date();
    let startDate: Date;
    let timeFormat: string;

    switch (query.range) {
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            timeFormat = '%Y-%m-%d';
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            timeFormat = '%Y-%m-%d';
            break;
        default: // 24h
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            timeFormat = '%Y-%m-%d %H:00:00';
    }

    let aggFunc: string;
    switch (query.type) {
        case 'min': aggFunc = 'MIN(value)'; break;
        case 'max': aggFunc = 'MAX(value)'; break;
        case 'count': aggFunc = 'COUNT(*)'; break;
        default: aggFunc = 'AVG(value)';
    }

    const result = await prisma.$queryRawUnsafe<Array<{ bucket: string; value: number; count: number }>>(`
        SELECT 
            strftime('${timeFormat}', recorded_at) as bucket,
            ${aggFunc} as value,
            COUNT(*) as count
        FROM metric_values
        WHERE metric_id = '${metricId}'
            AND recorded_at >= '${startDate.toISOString()}'
            AND recorded_at <= '${now.toISOString()}'
        GROUP BY bucket
        ORDER BY bucket ASC
    `);

    return {
        metric: { id: metric.id, name: metric.name, unit: metric.unit },
        range: query.range,
        aggregationType: query.type,
        data: result.map(r => ({
            timestamp: r.bucket,
            value: Number(r.value),
            count: Number(r.count),
        })),
    };
}

export async function deleteMetric(userId: string, metricId: string) {
    const metric = await prisma.metric.findFirst({ where: { id: metricId, userId } });
    if (!metric) {
        throw new HttpError('Metric not found', 404);
    }

    await prisma.metric.delete({ where: { id: metricId } });
    return { success: true };
}
