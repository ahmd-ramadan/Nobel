import { Schema, model } from 'mongoose'
import { IPointModel } from '../interfaces';

const pointSchema = new Schema({
    modelId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Model', 
        required: true 
    },
    rpmId: { 
        type: Schema.Types.ObjectId, 
        ref: 'RPM', 
        required: true 
    },

    // Measurements
    flowRate: { 
        type: Number, 
        required: true 
    },
    totalPressure: { 
        type: Number, 
        required: true 
    },
    velocity: { 
        type: Number, 
        required: true 
    },
    brakePower: {
        type: Number, 
        required: true 
    },
    efficiency: { 
        type: Number, 
        required: true 
    },
    lpa: { 
        type: Number, 
        required: true 
    },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

pointSchema.index({ rpmId: 1 }); 
pointSchema.index({ rpmId: 1, flowRate: 1 }); 
pointSchema.index({ rpmId: 1, flowRate: 1, totalPressure: 1 });
  

export const Point = model<IPointModel>('Point', pointSchema);
