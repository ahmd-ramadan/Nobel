import { Router } from 'express';
import { pointCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { managePoints } from '../access';
const router = Router();

router.use(
    isAuthunticated, 
)
router.route('/')
    .post(
        isAuthorized(managePoints),
        asyncHandler(pointCtrl.addPointsData)
    )


export { router as pointRouter };