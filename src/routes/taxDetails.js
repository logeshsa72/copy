import { Router } from 'express';
const router = Router();
import { get, getDetail } from '../services/taxDetails.service.js';

router.get('/', get);

router.get('/getDetail', getDetail)

export default router;