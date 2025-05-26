import { Router } from 'express';
import { userCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageUser, manageUsers } from '../access';
const router = Router();

router.use(
    isAuthunticated, 
)
router.route('/')
    .get(
        isAuthorized(manageUser),
        asyncHandler(userCtrl.getUserProfile)
    )
    // .put(
    //     isAuthorized(manageUsers),
    //     asyncHandler(userCtrl.updateUserPassword)
    // )
    .patch(
        isAuthorized(manageUser),
        multerMiddleHost({}).fields([
            { name: 'avatar', maxCount: 1 }
        ]),
        asyncHandler(userCtrl.updateUserProfile)
    )


export { router as userRouter };