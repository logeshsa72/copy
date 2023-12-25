import { Router } from 'express';

const router = Router();

import { get } from '../services/fabricPo.service.js';
import { acceptPo } from '../services/fabricPo.service.js';

router.get('/', get );

router.put("/acceptPo", acceptPo)


export default router;