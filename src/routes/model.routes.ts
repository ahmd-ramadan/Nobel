import { Router } from 'express';
import { modelCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageModel } from '../access';
const router = Router();

router.use(
    isAuthunticated, 
)

router.route('/')
    .get(
        asyncHandler(modelCtrl.getAllModels)
    )
    .post(
        isAuthorized(manageModel),
        asyncHandler(modelCtrl.addModel)
    )

router.route('/:_id')
    .get(
        asyncHandler(modelCtrl.getModelById)
    )
    .patch(
        isAuthorized(manageModel),
        asyncHandler(modelCtrl.updateModel)
    )
    .delete(
        isAuthorized(manageModel),
        asyncHandler(modelCtrl.deleteModel)
    )


export { router as modelRouter };