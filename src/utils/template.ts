import fs from 'fs';
import path from 'path';

export const getVerifyEmailTemplate = () => {
  const verifyEmailHtmlTemplate = '../templates/verify-email.html';
  const verificationEmailTemplatePath = path.join(
    __dirname,
    verifyEmailHtmlTemplate,
  );

  return fs.readFileSync(verificationEmailTemplatePath, 'utf-8');
};

export const getOTPTemplate = () => {
  const otpHtmlTemplate = '../templates/otp.html';
  const otpTemplatePath = path.join(__dirname, otpHtmlTemplate);

  return fs.readFileSync(otpTemplatePath, 'utf-8');
};

export const getOTPEmailTemplate = () => {
  const otpEmailHtmlTemplate = '../templates/otpEmail.html';
  const otpTemplatePath = path.join(__dirname, otpEmailHtmlTemplate);

  return fs.readFileSync(otpTemplatePath, 'utf-8');
};

export const ordererCreatedEmailTemplate = () => {
  const otpEmailHtmlTemplate = '../templates/orderCreated.html';
  const otpTemplatePath = path.join(__dirname, otpEmailHtmlTemplate);

  return fs.readFileSync(otpTemplatePath, 'utf-8');
};