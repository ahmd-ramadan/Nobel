"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.cancelUserBlock = exports.deleteUser = exports.updateUser = exports.addUser = exports.updateUserPassword = exports.updateUserProfile = exports.getUserProfile = void 0;
const services_1 = require("../services");
const utils_1 = require("../utils");
const validation_1 = require("../validation");
const enums_1 = require("../enums");
const error_messages_1 = require("../constants/error.messages");
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const userProfile = yield services_1.userService.isUserExist(userId);
    res.status(utils_1.OK).json({
        success: true,
        message: error_messages_1.ValidationErrorMessages.USER_PROFILE_RETRIEVED,
        data: userProfile
    });
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const role = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.role;
    const data = validation_1.updateUserProfileSchema.parse(req.body);
    const files = req.files;
    const updatedUser = yield services_1.userService.updateProfile({ userId, role, data, files });
    res.status(utils_1.OK).json({
        success: true,
        message: error_messages_1.ValidationErrorMessages.USER_PROFILE_UPDATED,
        data: updatedUser
    });
});
exports.updateUserProfile = updateUserProfile;
const updateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { oldPassword, newPassword } = validation_1.updateUserPasswordSchema.parse(req.body);
    yield services_1.userService.updatePassword({ userId, oldPassword, newPassword });
    res.status(utils_1.OK).json({
        success: true,
        message: error_messages_1.ValidationErrorMessages.PASSWORD_UPDATED,
    });
});
exports.updateUserPassword = updateUserPassword;
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = validation_1.addUserSchema.parse(req.body);
    const addedUser = yield services_1.userService.addUser(data);
    res.status(utils_1.OK).json({
        success: true,
        message: error_messages_1.ValidationErrorMessages.USER_CREATED,
        data: addedUser
    });
});
exports.addUser = addUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = validation_1.updateUserSchema.parse(req.body);
    const updatedUser = yield services_1.userService.updateUserData(data);
    res.status(utils_1.OK).json({
        success: true,
        message: error_messages_1.ValidationErrorMessages.USER_UPDATED,
        data: updatedUser
    });
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, type } = validation_1.deleteUserSchema.parse(req.body);
    const deletedUser = yield services_1.userService.deleteUser({ userId, type });
    const message = type === enums_1.DeleteUserTypes.BLOCK
        ? error_messages_1.ValidationErrorMessages.USER_BLOCKED
        : error_messages_1.ValidationErrorMessages.USER_DELETED;
    res.status(utils_1.OK).json({
        success: true,
        message,
        data: deletedUser
    });
});
exports.deleteUser = deleteUser;
const cancelUserBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: userId } = validation_1.paramsSchema.parse(req.params);
    const user = yield services_1.userService.cancelBlockOnUser(userId);
    res.status(utils_1.OK).json({
        success: true,
        message: error_messages_1.ValidationErrorMessages.USER_UNBLOCKED,
        data: user
    });
});
exports.cancelUserBlock = cancelUserBlock;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admins = yield services_1.userService.getAllUsers();
    res.status(utils_1.OK).json({
        success: true,
        message: error_messages_1.ValidationErrorMessages.USERS_RETRIEVED,
        data: admins
    });
});
exports.getAllUsers = getAllUsers;
