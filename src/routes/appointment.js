import { Router } from 'express';
const router = Router();
import { get } from "../services/appointment.service.js";

router.get('/:compCode/:idCardNo', get);


export default router;