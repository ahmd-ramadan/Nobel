import { Response } from "express";
import { authService, userService } from "../services";
import { OK } from "../utils";
import { AuthenticatedRequest, IUser } from "../interfaces";
import { addUserSchema, deleteUserSchema, paramsSchema, updateUserPasswordSchema, updateUserProfileSchema, updateUserSchema } from "../validation";
import { DeleteUserTypes, UserRolesEnum } from "../enums";
import { ValidationErrorMessages } from '../constants/error.messages';

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?.userId as string;
    const userProfile = await userService.isUserExist(userId)

    res.status(OK).json({ 
        success: true,
        message: ValidationErrorMessages.USER_PROFILE_RETRIEVED,
        data: userProfile
    });
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?.userId as string;
    const role = req?.user?.role as UserRolesEnum;
    const data = updateUserProfileSchema.parse(req.body);
    const files = req.files

    const updatedUser = await userService.updateProfile({ userId, role, data, files }) as IUser

    res.status(OK).json({ 
        success: true,
        message: ValidationErrorMessages.USER_PROFILE_UPDATED,
        data: updatedUser
    });
};

export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?.userId as string;
    const { oldPassword, newPassword } = updateUserPasswordSchema.parse(req.body);

    await userService.updatePassword({ userId, oldPassword, newPassword });

    res.status(OK).json({ 
        success: true,
        message: ValidationErrorMessages.PASSWORD_UPDATED,
    });
};

export const addUser = async (req: AuthenticatedRequest, res: Response) => {
    const data = addUserSchema.parse(req.body);
    const addedUser = await userService.addUser(data);

    res.status(OK).json({ 
        success: true,
        message: ValidationErrorMessages.USER_CREATED,
        data: addedUser
    });
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    const data = updateUserSchema.parse(req.body);
    const updatedUser = await userService.updateUserData(data);

    res.status(OK).json({ 
        success: true,
        message: ValidationErrorMessages.USER_UPDATED,
        data: updatedUser
    });
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    const { userId, type } = deleteUserSchema.parse(req.body);
    const deletedUser = await userService.deleteUser({ userId, type });

    const message = type === DeleteUserTypes.BLOCK 
        ? ValidationErrorMessages.USER_BLOCKED 
        : ValidationErrorMessages.USER_DELETED;
    
    res.status(OK).json({ 
        success: true,
        message,
        data: deletedUser
    });
};

export const cancelUserBlock = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: userId } = paramsSchema.parse(req.params);
    const user = await userService.cancelBlockOnUser(userId);

    res.status(OK).json({ 
        success: true,
        message: ValidationErrorMessages.USER_UNBLOCKED,
        data: user
    });
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    const admins = await userService.getAllUsers();

    res.status(OK).json({ 
        success: true,
        message: ValidationErrorMessages.USERS_RETRIEVED,
        data: admins
    });
};


