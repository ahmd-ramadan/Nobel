import cron from 'node-cron'

import { ValidationErrorMessages } from "../constants/error.messages";
import { TrackingTypesEnum } from "../interfaces";
import { trackingRepository } from "../repositories";
import { ApiError, INTERNAL_SERVER_ERROR, logger, pagenation } from "../utils";

class TrackingService {
    
    private readonly populatedArray = ['userData'];

    constructor(private readonly trackingDataSource = trackingRepository){}


    async addNewTracking({ type, userId }: { type: TrackingTypesEnum, userId: string }){
        try {
            const addedNewTrack = await this.trackingDataSource.createOne({ type, userId });
            if(!addedNewTrack) {
                throw new ApiError(ValidationErrorMessages.ADD_TRACKING_FAILED, INTERNAL_SERVER_ERROR)
            }
            return addedNewTrack;
        } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err;
            throw new ApiError(ValidationErrorMessages.ADD_TRACKING_FAILED, INTERNAL_SERVER_ERROR)
        }
    }

    async getAllTracking({ type, userId, page, size }: { type?: TrackingTypesEnum, userId?: string, page: number, size: number }) {
        try {
            const query: any = {};
            if(type) query.type = type;
            if(userId) query.userId = userId;

            const { skip, limit } = pagenation({ page, size });

            console.log(query);

            const allTracks = await this.trackingDataSource.findWithPopulate(query, this.populatedArray, { limit, skip, sort: { createdAt: -1 } });
            return allTracks;

        } catch(err) {
            console.log(err);
            if(err instanceof ApiError) throw err;
            throw new ApiError(ValidationErrorMessages.GET_ALL_TRACKING_FAILED, INTERNAL_SERVER_ERROR)
        }
    }

    async deleteExpiredTrackingDocs() {
        const now = new Date();
        const oneWeekBeforeNow = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
        return this.trackingDataSource.deleteMany({
            createdAt: { $lt: oneWeekBeforeNow }
        });
    }
    

    scheduleTrackingCleanupTask() {
        cron.schedule('0 0 * * *', async () => {
            logger.info('Cleanup tracking history cron job started 🕛');
            try {
                await this.deleteExpiredTrackingDocs()
                logger.info('Cleanup tokens cron job completed ✅')
            } catch(error) {
                logger.error('Cleanup tokens cron job failed ❌', error);
            };
        });
    }
}

export const trackingService = new TrackingService()