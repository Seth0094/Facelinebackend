import { Router } from 'express';
import { checkAuth } from '../middlewares';
import authRouter from './auth';
import usersRouter from './users';
import facesRouter from './face';

const router = Router();

router.use('/auth', authRouter);

// These middlewares will be used for all routes below
router.use(checkAuth);
router.use('/users', usersRouter);
router.use('/face', facesRouter);

export default router;
