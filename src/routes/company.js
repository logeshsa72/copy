import { Router } from 'express';
const router = Router();
import { get } from "../services/company.service.js";

router.get('/:userId', get);


export default router;