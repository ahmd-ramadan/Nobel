import { Router } from 'express';
import { searchCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageSearch } from '../access';
const router = Router();

router.use(
    isAuthunticated, 
)
router.route('/')
    .post(
        isAuthorized(manageSearch),
        asyncHandler(searchCtrl.search)
    )


export { router as searchRouter };