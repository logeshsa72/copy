import { Router } from 'express';
const router = Router();
import { login, create, get, remove } from "../services/user.service.js";

router.post('/login', login);

router.post('/', create);

router.get('/', get);

router.delete('/', remove)


// router.put('/', put)

export default router;