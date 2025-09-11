import { Schema, model } from 'mongoose';
import { IRPMModel } from '../interfaces';

const rpmSchema = new Schema({
    modelId: {
        type: Schema.Types.ObjectId,
        ref: 'Model',
        required: true
    },
    rpm: { 
        type: Number, 
        required: true 
    },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});


rpmSchema.index({ modelId: 1, rpm: 1 }, { unique: true }); 
rpmSchema.index({ rpm: 1 }); 

export const RPM = model<IRPMModel>('RPM', rpmSchema);
