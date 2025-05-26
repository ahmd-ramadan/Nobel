import { Router } from 'express';
import { userCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageUsers } from '../access';
const router = Router();

router.use(
    isAuthunticated,
    isAuthorized(manageUsers),
)

router.route('/')
    .post(
        asyncHandler(userCtrl.addUser)
    )
    .patch(
        asyncHandler(userCtrl.updateUser)
    )
    .delete(
        asyncHandler(userCtrl.deleteUser)
    )
    .get(
        asyncHandler(userCtrl.getAllUsers)
    )

router.patch(
    '/:_id/cancel-block',
    userCtrl.cancelUserBlock
)

export { router as adminRouter };