import { Router } from 'express';
import asyncHandler from 'express-async-handler';
 import { authCtrl } from '../controllers';
import { isAuthunticated, oneMinuteLimiter, twentyFourHourLimiter } from '../middlewares';

const router = Router();

// router.post('/register', asyncHandler(authCtrl.register));
// router.get('/verify-email', asyncHandler(authCtrl.verifyEmail));
router.post('/login', asyncHandler(authCtrl.login));
router.post('/logout', isAuthunticated, asyncHandler(authCtrl.logout));
// router.post('/verify-otp', asyncHandler(authCtrl.verifyOtp));
// router.post('/reset-password', asyncHandler(authCtrl.resetPassword));

// router.post(
//   '/resend-verify-email',
//   oneMinuteLimiter,
//   twentyFourHourLimiter,
//   asyncHandler(authCtrl.resendVerificationEmail),
// );
// router.post(
//   '/forgot-password',
//   oneMinuteLimiter,
//   twentyFourHourLimiter,
//   asyncHandler(authCtrl.forgotPassword)
// );

export { router as authRouter };