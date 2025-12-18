import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startAlertEvaluator } from './jobs/alertEvaluator';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startAlertEvaluator();
});
