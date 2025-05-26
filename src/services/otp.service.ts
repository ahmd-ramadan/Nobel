import { NOTFOUND } from 'dns';
import { ICreateOtpQuery, IOtpModel } from '../interfaces';
import { otpRepository } from '../repositories';
import { ApiError, CONFLICT, logger, NOT_FOUND } from '../utils';
import cron from 'node-cron'

export class OtpService {
    constructor(
        private readonly otpDataSource = otpRepository,
    ) {}

    async createOne(data: ICreateOtpQuery) {
        return this.otpDataSource.createOne(data);
    }

    async findOne(query: Partial<IOtpModel>) {
        return this.otpDataSource.findOne(query);
    }

    async isOtpValid({ otp }: { otp: string }) { 
        const isOtpExist = await this.findOne({ otp });
        if (!isOtpExist) {
            throw new ApiError('رمز التحقق غير صحيح أو منتهي الصلاحية', NOT_FOUND);
        }

        if (isOtpExist.expiresAt < new Date()) {
            throw new ApiError('رمز التحقق منتهي الصلاحية', CONFLICT);
        }
        return isOtpExist;
    }

    async deleteOne(query: Partial<IOtpModel>) {
        return this.otpDataSource.deleteOne(query);
    }

    async deleteExpiredOtps() {
        const now = new Date();
        return this.otpDataSource.deleteMany({ expiresAt: { lt: now } });
    }



    scheduleOtpCleanupTask() {
        cron.schedule('0 0 * * *', () => {
            logger.info('Cleanup otpss cron job started 🕛');
            this.deleteExpiredOtps()
                .then(() => {
                    logger.info('Cleanup otps cron job completed ✅');
                })
                .catch((error) => {
                    logger.error('Cleanup otps cron job failed ❌', error);
                });
        });
    }
}

export const otpService = new OtpService();