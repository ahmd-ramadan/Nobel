import { Router } from 'express';
import { trackingCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageTracking } from '../access';
const router = Router();

router.use(
    isAuthunticated, 
)
router.route('/')
    .get(
        isAuthorized(manageTracking),
        asyncHandler(trackingCtrl.getAllTracks)
    )


export { router as trackingRouter };