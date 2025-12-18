import prisma from '../utils/prisma';
import { CreateAlertRuleInput, UpdateAlertRuleInput } from '../utils/validation';
import { HttpError } from '../middlewares/error.middleware';

export async function createAlertRule(userId: string, input: CreateAlertRuleInput) {
    const metric = await prisma.metric.findFirst({ where: { id: input.metricId, userId } });
    if (!metric) {
        throw new HttpError('Metric not found', 404);
    }

    return prisma.alertRule.create({
        data: {
            metricId: input.metricId,
            userId,
            operator: input.operator,
            threshold: input.threshold,
        },
        include: { metric: true },
    });
}

export async function getAllAlertRules(userId: string) {
    const rules = await prisma.alertRule.findMany({
        where: { userId },
        include: {
            metric: true,
            _count: { select: { events: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return rules.map(rule => ({
        id: rule.id,
        metricId: rule.metricId,
        metricName: rule.metric.name,
        metricUnit: rule.metric.unit,
        operator: rule.operator,
        threshold: rule.threshold,
        isActive: rule.isActive,
        createdAt: rule.createdAt,
        totalEvents: rule._count.events,
    }));
}

export async function getAlertRuleById(userId: string, ruleId: string) {
    const rule = await prisma.alertRule.findFirst({
        where: { id: ruleId, userId },
        include: {
            metric: true,
            events: { orderBy: { triggeredAt: 'desc' }, take: 10 },
        },
    });

    if (!rule) {
        throw new HttpError('Alert rule not found', 404);
    }
    return rule;
}

export async function updateAlertRule(userId: string, ruleId: string, input: UpdateAlertRuleInput) {
    const rule = await prisma.alertRule.findFirst({ where: { id: ruleId, userId } });
    if (!rule) {
        throw new HttpError('Alert rule not found', 404);
    }

    return prisma.alertRule.update({
        where: { id: ruleId },
        data: input,
        include: { metric: true },
    });
}

export async function deleteAlertRule(userId: string, ruleId: string) {
    const rule = await prisma.alertRule.findFirst({ where: { id: ruleId, userId } });
    if (!rule) {
        throw new HttpError('Alert rule not found', 404);
    }

    await prisma.alertRule.delete({ where: { id: ruleId } });
    return { success: true };
}

export async function getAlertEvents(userId: string, limit = 50) {
    const events = await prisma.alertEvent.findMany({
        where: { alertRule: { userId } },
        include: { alertRule: { include: { metric: true } } },
        orderBy: { triggeredAt: 'desc' },
        take: limit,
    });

    return events.map(event => ({
        id: event.id,
        metricValue: event.metricValue,
        triggeredAt: event.triggeredAt,
        rule: {
            id: event.alertRule.id,
            operator: event.alertRule.operator,
            threshold: event.alertRule.threshold,
        },
        metric: {
            id: event.alertRule.metric.id,
            name: event.alertRule.metric.name,
            unit: event.alertRule.metric.unit,
        },
    }));
}

function checkThreshold(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
        case '>': return value > threshold;
        case '<': return value < threshold;
        case '>=': return value >= threshold;
        case '<=': return value <= threshold;
        default: return false;
    }
}

export async function evaluateAlerts() {
    const rules = await prisma.alertRule.findMany({
        where: { isActive: true },
        include: {
            metric: {
                include: { values: { orderBy: { recordedAt: 'desc' }, take: 1 } },
            },
        },
    });

    const toCreate: Array<{ alertRuleId: string; metricValue: number }> = [];

    for (const rule of rules) {
        const latest = rule.metric.values[0];
        if (!latest) continue;

        if (checkThreshold(latest.value, rule.operator, rule.threshold)) {
            // Check for recent alert to avoid duplicates (1 min window)
            const recent = await prisma.alertEvent.findFirst({
                where: {
                    alertRuleId: rule.id,
                    triggeredAt: { gte: new Date(Date.now() - 60000) },
                },
            });

            if (!recent) {
                toCreate.push({ alertRuleId: rule.id, metricValue: latest.value });
            }
        }
    }

    if (toCreate.length > 0) {
        await prisma.alertEvent.createMany({ data: toCreate });
    }

    return toCreate.length;
}
