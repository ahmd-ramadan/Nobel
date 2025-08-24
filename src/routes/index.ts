import { Router } from 'express'
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { adminRouter } from './admin.routes';
import { modelRouter } from './model.routes';
import { pointRouter } from './point.routes';
import { trackingRouter } from './tracking.routes';

const router = Router();

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/admin', adminRouter)
router.use('/model', modelRouter)
router.use('/point', pointRouter)
router.use('/history', trackingRouter)

export default router;