import { Router } from 'express';
import { validate, handleMessage } from '../../bot/fBBot';

const router = new Router();

router.get('/webhook', validate);
router.post('/webhook', handleMessage);

export default router;
