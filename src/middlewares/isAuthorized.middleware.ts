import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError, UNAUTHORIZED } from '../utils';
import { AuthenticatedRequest } from '../interfaces';
import { UserRolesEnum } from '../enums';

export const isAuthorized = (allowedRoles: UserRolesEnum[]) => { 
    return asyncHandler(
        async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
            const role = req.user?.role as UserRolesEnum;
            if (!allowedRoles.includes(role)) {
                // return next(new ApiError('غير مسموح لك بإكمال هذه العملية', UNAUTHORIZED));
                return next(new ApiError('Not allowed for you to compelete this process', UNAUTHORIZED));
            }
            next();
        },
    )
}