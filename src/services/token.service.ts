// import { refreshToken } from '../controllers/auth.controller';
import { ITokenModel } from '../interfaces';
import { tokenRepository } from '../repositories';
import { ApiError, logger, UNAUTHORIZED } from '../utils';
import cron from 'node-cron'

class TokenService {
    constructor(
        private readonly tokenDataSource = tokenRepository,
    ) {}

    async createOne(data: Partial<ITokenModel>) {
        return this.tokenDataSource.createOne(data);
    }

    async findOne(query: any) {
        return this.tokenDataSource.findOne(query);
    }

    async updateOne(
        query: any,
        data: any,
    ) {
        return this.tokenDataSource.updateOne(query, data);
    }

    async deleteOne(query: any) {
        return this.tokenDataSource.updateOne(query, {
            isActive: false,
            isDeleted: true,
        });
    }

    async deleteMany(query: any) {
        return this.tokenDataSource.updateMany(query, {
            isActive: false,
            isDeleted: true,
        });
    }

    async tokenExists(token: string) {
        const now = new Date();
        const tokenExist = await this.findOne({
            token,
            expiresAt: { $gt: now },
            isActive: true,
            isDeleted: false,
        });
        // console.log(tokenExist, refreshToken);
        if (!tokenExist) {
            throw new ApiError('Invalid or expired token', UNAUTHORIZED);
        }

        return tokenExist;
    }

    async deleteExpiredTokens() {
        const now = new Date();

        return this.tokenDataSource.deleteMany({ expiresAt: { $lt: now } });
    }

    scheduleTokenCleanupTask() {
        cron.schedule('0 0 * * *', async () => {
            logger.info('Cleanup tokens cron job started 🕛');
            try {
                await this.deleteExpiredTokens()
                logger.info('Cleanup tokens cron job completed ✅');
            } catch(error) {
                    logger.error('Cleanup tokens cron job failed ❌', error);
            };
        });
    }
}

export const tokenService = new TokenService();