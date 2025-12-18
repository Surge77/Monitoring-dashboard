import { Request, Response, NextFunction } from 'express';
import * as alertsService from '../services/alerts.service';
import { createAlertRuleSchema, updateAlertRuleSchema } from '../utils/validation';

export async function createAlertRule(req: Request, res: Response, next: NextFunction) {
    try {
        const data = createAlertRuleSchema.parse(req.body);
        const alertRule = await alertsService.createAlertRule(req.user!.userId, data);
        res.status(201).json({ alertRule });
    } catch (err) {
        next(err);
    }
}

export async function getAllAlertRules(req: Request, res: Response, next: NextFunction) {
    try {
        const rules = await alertsService.getAllAlertRules(req.user!.userId);
        res.json({ alertRules: rules });
    } catch (err) {
        next(err);
    }
}

export async function getAlertRuleById(req: Request, res: Response, next: NextFunction) {
    try {
        const rule = await alertsService.getAlertRuleById(req.user!.userId, req.params.id);
        res.json({ alertRule: rule });
    } catch (err) {
        next(err);
    }
}

export async function updateAlertRule(req: Request, res: Response, next: NextFunction) {
    try {
        const data = updateAlertRuleSchema.parse(req.body);
        const alertRule = await alertsService.updateAlertRule(req.user!.userId, req.params.id, data);
        res.json({ alertRule });
    } catch (err) {
        next(err);
    }
}

export async function deleteAlertRule(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await alertsService.deleteAlertRule(req.user!.userId, req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function getAlertEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const events = await alertsService.getAlertEvents(req.user!.userId, limit);
        res.json({ alertEvents: events });
    } catch (err) {
        next(err);
    }
}
