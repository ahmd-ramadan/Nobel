import { Router } from 'express';
import { pointCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { getPoints, managePoints } from '../access';
const router = Router();

router.use(
    isAuthunticated, 
)
router.route('/')
    .post(
        isAuthorized(managePoints),
        asyncHandler(pointCtrl.addPointsData)
    )
    
    .get(
        isAuthorized(getPoints),
        asyncHandler(pointCtrl.getAllPoints)
    )


export { router as pointRouter };