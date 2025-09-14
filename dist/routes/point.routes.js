"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const access_1 = require("../access");
const router = (0, express_1.Router)();
exports.pointRouter = router;
router.use(middlewares_1.isAuthunticated);
router.route('/')
    .post((0, middlewares_1.isAuthorized)(access_1.managePoints), (0, express_async_handler_1.default)(controllers_1.pointCtrl.addPointsData))
    .get((0, middlewares_1.isAuthorized)(access_1.getPoints), (0, express_async_handler_1.default)(controllers_1.pointCtrl.getAllPoints));
