import { Router } from 'express';
import { getDemoApplications, runDemoApplication } from '../controllers/demo.controller.js';

const router = Router();

router.get('/demo-application', getDemoApplications);
router.post('/demo-application', runDemoApplication);

export default router;
