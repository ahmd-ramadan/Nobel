import { Schema, model } from 'mongoose';
import { ITrackingModel, TrackingTypesEnum } from '../interfaces';

const trackingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: { 
        type: String,
        enum: Object.values(TrackingTypesEnum),
        required: true, 
        index: true
    },
    searchResults: [
        {
            type: Object,
            required: true
        }
    ]
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

trackingSchema.virtual("userData", {
    foreignField: "_id",
    ref: "User",
    localField: "userId",
    justOne: false
})

trackingSchema.index({ type: 1, userId: 1 })

export const Tracking = model<ITrackingModel>('Tracking', trackingSchema);
