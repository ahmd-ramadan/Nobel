"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
const utils_1 = require("../utils");
class JwtService {
    static generateAccessToken(_a, expiresIn) {
        var { exp: _exp, iat: _iat } = _a, payload = __rest(_a, ["exp", "iat"]);
        if (expiresIn === void 0) { expiresIn = Number(config_1.accessTokenExpiry); }
        return (0, jsonwebtoken_1.sign)(payload, config_1.accessTokenSecret, {
            expiresIn,
        });
    }
    static generateRefreshToken(_a) {
        var { exp: _exp, iat: _iat } = _a, payload = __rest(_a, ["exp", "iat"]);
        return (0, jsonwebtoken_1.sign)(payload, config_1.refreshTokenSecret, {
            expiresIn: Number(config_1.refreshTokenExpiry),
        });
    }
    static generateTokens(user) {
        const { _id: userId, role } = user;
        const payload = { userId, role };
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        return { accessToken, refreshToken };
    }
    static verify(token, type) {
        try {
            const secret = type === 'access' ? config_1.accessTokenSecret : config_1.refreshTokenSecret;
            return (0, jsonwebtoken_1.verify)(token, secret);
        }
        catch (error) {
            console.log(error);
            throw new utils_1.ApiError('التوكين غير صحيح', utils_1.BAD_REQUEST);
        }
    }
}
exports.JwtService = JwtService;
