import { Router } from 'express'
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { adminRouter } from './admin.routes';
import { modelRouter } from './model.routes';
import { pointRouter } from './point.routes';

const router = Router();

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/admin', adminRouter)
router.use('/model', modelRouter)
router.use('/point', pointRouter)

export default router;