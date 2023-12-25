import { Router } from 'express';

const router = Router();

import { get,  acceptPo, getPoDetails, getPoItem } from "../services/dyedYarnPo.service.js";

router.get('/', get );

router.get('/poDetails', getPoDetails);

router.put('/acceptPo', acceptPo);

router.get('/getPoItem', getPoItem)

export default router;