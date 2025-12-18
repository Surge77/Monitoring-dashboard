import { Router } from 'express';
import * as metricsController from '../controllers/metrics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/', metricsController.createMetricValue);
router.get('/', metricsController.getAllMetrics);
router.get('/:id', metricsController.getMetricById);
router.get('/:id/values', metricsController.getMetricValues);
router.get('/:id/aggregate', metricsController.getAggregatedMetrics);
router.delete('/:id', metricsController.deleteMetric);

export default router;
