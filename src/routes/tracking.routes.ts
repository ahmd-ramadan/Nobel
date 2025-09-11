import { Router } from 'express';
import { trackingCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageTracking, updateTracking } from '../access';
const router = Router();

router.use(
    isAuthunticated, 
)
router.route('/')
    .get(
        isAuthorized(manageTracking),
        asyncHandler(trackingCtrl.getAllTracks)
    )
    .patch(
        isAuthorized(updateTracking),
        asyncHandler(trackingCtrl.addReportForModelInSearchTracking)
    )


export { router as trackingRouter };