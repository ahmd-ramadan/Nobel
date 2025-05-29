import { NextFunction, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { JwtService, userService } from '../services';
import { ApiError, UNAUTHORIZED } from '../utils';
import { AuthenticatedRequest } from '../interfaces';

export const isAuthunticated = asyncHandler(
    async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new ApiError('Unauthorized - No Prefix Token', UNAUTHORIZED));
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next(new ApiError('Unauthorized - No Token', UNAUTHORIZED));
        }

        // const isInvalidated = await redisService.get(`invalidated-tokens:${token}`);
        // if (isInvalidated) {
        //   throw new ApiError('Session expired, please log in again', UNAUTHORIZED);
        // }

        const decoded = JwtService.verify(token, 'refresh');

        const user = await userService.findUserById(decoded.userId) 
        
        if (!user || user.isBlocked) {
            return next(
                new ApiError('User not found, mybe had deleted by admin', UNAUTHORIZED)
            )
        }
        if (!user.isActive) {
            return next(
                new ApiError('User logged out, can not make action', UNAUTHORIZED)
            )
        }

        req.user = { userId: decoded.userId as string, role: decoded.role };
        next();
    },
);