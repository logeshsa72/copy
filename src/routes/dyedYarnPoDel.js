import { Router } from 'express';

import { create, get, getDelDetails, upDate, getDocId } from '../services/dyedYarnPoDel.service.js';

const router = Router();

router.post('/', create);

router.get('/getDocId', getDocId);

router.get('/', get);

router.get('/getDelDetails', getDelDetails)

router.put('/', upDate)

export default router;