import { Router } from 'express';

const router = Router();

import { get, acceptPo, getPoDetails, getPoItem } from "../services/accessoryPo.service.js"

router.put('/acceptPo', acceptPo);

router.get('/poDetails', getPoDetails);

router.get('/', get);

router.get('/getPoItem', getPoItem)

export default router; 