import { Secret, sign, verify } from 'jsonwebtoken';
import {
  accessTokenExpiry,
  accessTokenSecret,
  refreshTokenExpiry,
  refreshTokenSecret,
} from '../config';
import { IJwtPayload, IUser } from '../interfaces';
import { JwtType } from '../types';
import { ApiError, BAD_REQUEST } from '../utils';

export class JwtService {
    static generateAccessToken(
        { exp: _exp, iat: _iat, ...payload }: IJwtPayload,
        expiresIn: number = Number(accessTokenExpiry),
    ) {
        return sign(payload, accessTokenSecret as Secret, {
            expiresIn,
        });
    }

    static generateRefreshToken({
        exp: _exp,
        iat: _iat,
        ...payload
    }: IJwtPayload) {
        return sign(payload, refreshTokenSecret as Secret, {
            expiresIn: Number(refreshTokenExpiry),
        });
    }

    static generateTokens(user: IUser) {
        const { _id: userId, role } = user;
        const payload: IJwtPayload = { userId, role };

        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        return { accessToken, refreshToken };
    }

    static verify(token: string, type: JwtType): IJwtPayload {
        try {
            const secret = type === 'access' ? accessTokenSecret : refreshTokenSecret;
            return verify(token, secret as Secret) as IJwtPayload;
        } catch (error) {
            console.log(error)
            throw new ApiError('التوكين غير صحيح', BAD_REQUEST);
        }
    }
}