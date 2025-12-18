import cron from 'node-cron';
import { evaluateAlerts } from '../services/alerts.service';

let running = false;

export function startAlertEvaluator() {
    cron.schedule('* * * * *', async () => {
        if (running) return;

        running = true;
        try {
            await evaluateAlerts();
        } catch (err) {
            console.error('Alert evaluation failed:', err);
        }
        running = false;
    });
}
