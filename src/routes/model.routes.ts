import { Router } from 'express';
import { modelCtrl, nativeModelCtrl } from '../controllers';
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
        // asyncHandler(nativeModelCtrl.getAllModels)
    )
    .post(
        isAuthorized(manageModel),
        // asyncHandler(modelCtrl.addModel)
        asyncHandler(nativeModelCtrl.addModel)
    )

router.route('/:_id')
    .get(
        asyncHandler(modelCtrl.getModelById)
    )
    .patch(
        isAuthorized(manageModel),
        asyncHandler(nativeModelCtrl.updateModel)
    )
    .delete(
        isAuthorized(manageModel),
        // asyncHandler(modelCtrl.deleteModel)
        asyncHandler(nativeModelCtrl.deleteModel)
    )


export { router as modelRouter };