import env from "./env";

export const bcryptSaltRounds = env('BCRYPT_SALT_ROUNDS');
export const accessTokenSecret = env('ACCESS_TOKEN_SECRET');
export const refreshTokenSecret = env('REFRESH_TOKEN_SECRET');
export const accessTokenExpiry = env('ACCESS_TOKEN_EXPIRY');
export const refreshTokenExpiry = env('REFRESH_TOKEN_EXPIRY');