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
exports.userService = void 0;
const enums_1 = require("../enums");
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const hashing_service_1 = require("./hashing.service");
const error_messages_1 = require("../constants/error.messages");
const token_service_1 = require("./token.service");
class UserService {
    constructor(userDataSource = repositories_1.userRepository) {
        this.userDataSource = userDataSource;
        this.populateUserArray = [];
    }
    isUserExist(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUserExist = yield this.userDataSource.findByIdWithPopulate(userId, this.populateUserArray);
            if (!isUserExist) {
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.USER_NOT_FOUND, utils_1.NOT_FOUND);
            }
            return isUserExist;
        });
    }
    findUserByUserName(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userDataSource.findOneWithPopulate({ username }, this.populateUserArray);
        });
    }
    createNewUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userDataSource.createOne(data, this.populateUserArray);
        });
    }
    updateOne(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, data }) {
            return yield this.userDataSource.updateOne({ _id: userId }, data, this.populateUserArray);
        });
    }
    updateProfile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, data, role, files }) {
            const { name, username, password } = data;
            const newData = {};
            if (username) {
                if (role === enums_1.UserRolesEnum.USER) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.USERNAME_UPDATE_NOT_ALLOWED, utils_1.BAD_REQUEST);
                }
                const userExists = yield this.findUserByUserName(username);
                if (userExists) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.USERNAME_ALREADY_EXISTS, utils_1.CONFLICT);
                }
                newData.username = username;
            }
            if (password) {
                newData.password = yield hashing_service_1.HashingService.hash(password);
            }
            if (name)
                newData.name = name;
            return yield this.updateOne({ userId, data: newData });
        });
    }
    updatePassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, oldPassword, newPassword }) {
            const { password } = yield this.isUserExist(userId);
            const isMatched = yield hashing_service_1.HashingService.compare(oldPassword, password);
            if (!isMatched) {
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.INCORRECT_OLD_PASSWORD, utils_1.CONFLICT);
            }
            const hashedPassword = yield hashing_service_1.HashingService.hash(newPassword);
            return yield this.updateOne({ userId, data: { password: hashedPassword } });
        });
    }
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userDataSource.findByIdWithPopulate(userId, this.populateUserArray);
        });
    }
    addUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password, name } = data;
                const userExists = yield exports.userService.findUserByUserName(username);
                if (userExists) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.USER_ALREADY_EXISTS, utils_1.CONFLICT);
                }
                const hashedPassword = yield hashing_service_1.HashingService.hash(password);
                const userCredentials = { role: enums_1.UserRolesEnum.USER, username, name, password: hashedPassword };
                const addedUser = yield exports.userService.createNewUser(userCredentials);
                return addedUser;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.CREATE_USER_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateUserData(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, name, username, password }) {
            try {
                yield this.isUserExist(userId);
                let newData = {};
                if (username) {
                    const userExists = yield this.findUserByUserName(username);
                    if (userExists) {
                        throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.USERNAME_ALREADY_EXISTS, utils_1.CONFLICT);
                    }
                    newData.username = username;
                }
                if (name) {
                    newData.name = name;
                }
                if (password) {
                    newData.password = yield hashing_service_1.HashingService.hash(password);
                }
                return yield this.updateOne({ userId, data: newData });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.UPDATE_USER_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userDataSource.find({ role: enums_1.UserRolesEnum.USER });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.GET_USERS_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    blockUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userDataSource.updateOne({ _id: userId }, { isBlocked: true });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.BLOCK_USER_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    cancelBlockOnUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.isUserExist(userId);
                if (!user.isBlocked) {
                    throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.USER_NOT_BLOCKED, utils_1.CONFLICT);
                }
                return yield this.userDataSource.updateOne({ _id: userId }, { isBlocked: false });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.BLOCK_USER_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    removeUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userDataSource.deleteOne({ _id: userId });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.DELETE_USER_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, type }) {
            try {
                const user = yield this.isUserExist(userId);
                let deletedUser = null;
                if (type === enums_1.DeleteUserTypes.DELETE) {
                    deletedUser = yield this.removeUser(userId);
                }
                else {
                    deletedUser = yield this.blockUser(userId);
                }
                yield token_service_1.tokenService.deleteMany({ userId });
                return deletedUser;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError(error_messages_1.ValidationErrorMessages.DELETE_USER_FAILED, utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.userService = new UserService();
