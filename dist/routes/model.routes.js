"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const access_1 = require("../access");
const router = (0, express_1.Router)();
exports.modelRouter = router;
router.use(middlewares_1.isAuthunticated);
router.route('/')
    .get((0, express_async_handler_1.default)(controllers_1.modelCtrl.getAllModels)
// asyncHandler(nativeModelCtrl.getAllModels)
)
    .post((0, middlewares_1.isAuthorized)(access_1.manageModel), 
// asyncHandler(modelCtrl.addModel)
(0, express_async_handler_1.default)(controllers_1.nativeModelCtrl.addModel));
router.route('/:_id')
    .get((0, express_async_handler_1.default)(controllers_1.modelCtrl.getModelById))
    .patch((0, middlewares_1.isAuthorized)(access_1.manageModel), (0, express_async_handler_1.default)(controllers_1.modelCtrl.updateModel))
    .delete((0, middlewares_1.isAuthorized)(access_1.manageModel), 
// asyncHandler(modelCtrl.deleteModel)
(0, express_async_handler_1.default)(controllers_1.nativeModelCtrl.deleteModel));
