"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
exports.authRouter = router;
// router.post('/register', asyncHandler(authCtrl.register));
// router.get('/verify-email', asyncHandler(authCtrl.verifyEmail));
router.post('/login', (0, express_async_handler_1.default)(controllers_1.authCtrl.login));
router.post('/logout', middlewares_1.isAuthunticated, (0, express_async_handler_1.default)(controllers_1.authCtrl.logout));
