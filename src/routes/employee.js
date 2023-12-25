import { Router } from 'express';
const router = Router();
import { get } from "../services/employee.service.js";

router.get('/:compCode', get);


export default router;