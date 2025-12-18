import { Router } from 'express';
import * as alertsController from '../controllers/alerts.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/events', alertsController.getAlertEvents);
router.post('/', alertsController.createAlertRule);
router.get('/', alertsController.getAllAlertRules);
router.get('/:id', alertsController.getAlertRuleById);
router.put('/:id', alertsController.updateAlertRule);
router.delete('/:id', alertsController.deleteAlertRule);

export default router;
