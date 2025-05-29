"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordererCreatedEmailTemplate = exports.getOTPEmailTemplate = exports.getOTPTemplate = exports.getVerifyEmailTemplate = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getVerifyEmailTemplate = () => {
    const verifyEmailHtmlTemplate = '../templates/verify-email.html';
    const verificationEmailTemplatePath = path_1.default.join(__dirname, verifyEmailHtmlTemplate);
    return fs_1.default.readFileSync(verificationEmailTemplatePath, 'utf-8');
};
exports.getVerifyEmailTemplate = getVerifyEmailTemplate;
const getOTPTemplate = () => {
    const otpHtmlTemplate = '../templates/otp.html';
    const otpTemplatePath = path_1.default.join(__dirname, otpHtmlTemplate);
    return fs_1.default.readFileSync(otpTemplatePath, 'utf-8');
};
exports.getOTPTemplate = getOTPTemplate;
const getOTPEmailTemplate = () => {
    const otpEmailHtmlTemplate = '../templates/otpEmail.html';
    const otpTemplatePath = path_1.default.join(__dirname, otpEmailHtmlTemplate);
    return fs_1.default.readFileSync(otpTemplatePath, 'utf-8');
};
exports.getOTPEmailTemplate = getOTPEmailTemplate;
const ordererCreatedEmailTemplate = () => {
    const otpEmailHtmlTemplate = '../templates/orderCreated.html';
    const otpTemplatePath = path_1.default.join(__dirname, otpEmailHtmlTemplate);
    return fs_1.default.readFileSync(otpTemplatePath, 'utf-8');
};
exports.ordererCreatedEmailTemplate = ordererCreatedEmailTemplate;
