import { Request, Response, NextFunction } from 'express';
import * as metricsService from '../services/metrics.service';
import { createMetricValueSchema, aggregateQuerySchema } from '../utils/validation';

export async function createMetricValue(req: Request, res: Response, next: NextFunction) {
    try {
        const data = createMetricValueSchema.parse(req.body);
        const metricValue = await metricsService.createMetricValue(req.user!.userId, data);
        res.status(201).json({ metricValue });
    } catch (err) {
        next(err);
    }
}

export async function getAllMetrics(req: Request, res: Response, next: NextFunction) {
    try {
        const metrics = await metricsService.getAllMetrics(req.user!.userId);
        res.json({ metrics });
    } catch (err) {
        next(err);
    }
}

export async function getMetricById(req: Request, res: Response, next: NextFunction) {
    try {
        const metric = await metricsService.getMetricById(req.user!.userId, req.params.id);
        res.json({ metric });
    } catch (err) {
        next(err);
    }
}

export async function getMetricValues(req: Request, res: Response, next: NextFunction) {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const values = await metricsService.getMetricValues(req.user!.userId, req.params.id, limit);
        res.json({ values });
    } catch (err) {
        next(err);
    }
}

export async function getAggregatedMetrics(req: Request, res: Response, next: NextFunction) {
    try {
        const query = aggregateQuerySchema.parse({
            range: req.query.range || '24h',
            type: req.query.type || 'avg',
        });
        const result = await metricsService.getAggregatedMetrics(req.user!.userId, req.params.id, query);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function deleteMetric(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await metricsService.deleteMetric(req.user!.userId, req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
}
