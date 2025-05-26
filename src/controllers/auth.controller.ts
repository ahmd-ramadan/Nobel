import { Request, Response } from "express";
import { authService } from "../services";
import { OK } from "../utils";
import { loginSchema } from "../validation"
import { AuthenticatedRequest } from "../interfaces";
import { ValidationErrorMessages } from '../constants/error.messages';

export const login = async (req: Request, res: Response) => {
    const { username, password } = loginSchema.parse(req.body);
    const userInfo = await authService.login({ username, password });
  
    res.status(OK).json({
        success: true,
        message: ValidationErrorMessages.LOGIN_SUCCESS,
        data: {
            user: userInfo.data,
            token: userInfo.token
        }
    });
}

export const logout = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?.userId as string;
    const refreshToken = req?.headers['authorization']?.split(' ')[1] || "";

    await authService.logout({ userId, refreshToken });
    
    res.status(OK).json({ 
        success: true,
        message: ValidationErrorMessages.LOGOUT_SUCCESS
    });
}