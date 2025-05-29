import { ApiError, FORBIDDEN, INTERNAL_SERVER_ERROR, logger, MAGIC_NUMBERS, NOT_FOUND, UNAUTHORIZED } from "../utils";
// import { HashingService } from "./hashing.service";
import { userService } from "./user.service";
import { tokenService } from "./token.service";
import { JwtService } from "./jwt.service";
import { IUser } from "../interfaces";
import { ValidationErrorMessages } from '../constants/error.messages';
import { userRepository } from "../repositories";

class AuthService {

    async login({ username, password }: { username: string, password: string }) {
        try {
            let user = await userService.findUserByUserName(username);
    
            if (!user || !user.password) {
                throw new ApiError(ValidationErrorMessages.INVALID_CREDENTIALS, UNAUTHORIZED);
            }
    
            // const passwordMatches = await HashingService.compare(
            //     password,
            //     user?.password,
            // );
    
            if (password !== user.password) {
                throw new ApiError(ValidationErrorMessages.INVALID_CREDENTIALS, UNAUTHORIZED);
            }
    
            if (user.isBlocked) {
                throw new ApiError(
                    ValidationErrorMessages.USER_IS_BLOCKED,
                    FORBIDDEN,
                );
            }
    
            const token = (await this.generateAndStoreTokens(user)).refreshToken;
            user = await userRepository.updateOne({ _id: user._id }, { isActive: true });
            
            return { data: user, token };
        } catch (error) {
            if(error instanceof ApiError) {
                throw error
            }
            throw new ApiError(ValidationErrorMessages.LOGIN_FAILED, INTERNAL_SERVER_ERROR);
        }
    }

    async logout({ userId, refreshToken }: { userId: string; refreshToken: string }) {
        try {
            const storedToken =
                await tokenService.tokenExists(refreshToken);
        
            if (!storedToken) {
                throw new ApiError(ValidationErrorMessages.UNAUTHORIZED_ACCESS, UNAUTHORIZED);
            }
        
            await tokenService.deleteOne({ userId, token: refreshToken });
            await userRepository.updateOne({ _id: userId }, { isActive: false });
        } catch (error) {
            if(error instanceof ApiError) {
                throw error
            }
            throw new ApiError(ValidationErrorMessages.LOGOUT_FAILED, INTERNAL_SERVER_ERROR)
        }
    }  

    protected async generateAndStoreTokens(user: IUser) {
        const { _id: userId, role } = user;
        const tokens = JwtService.generateTokens(user);
        await tokenService.createOne({
            token: tokens.refreshToken,
            userId,
            expiresAt: new Date(Date.now() + MAGIC_NUMBERS.ONE_WEEK_IN_MILLISECONDS),
        });

        return tokens;
    }
}

export const authService = new AuthService();