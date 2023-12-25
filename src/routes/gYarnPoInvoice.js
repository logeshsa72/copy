import { Router } from 'express';

import { create, upDate, getDocId, get, getInvoiceDetails } from '../services/gYarnPoInvoice.service.js';

const router = Router();

router.post('/', create);

router.get('/getDocId', getDocId);

router.get('/', get);

router.get('/getInvoiceDetails', getInvoiceDetails)

router.put('/', upDate)

export default router;