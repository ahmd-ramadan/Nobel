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
    // index: { 
    //     type: Number, 
    //     required: true 
    // }, // 0 to 999

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
    // lpa: { 
    //     type: Number, 
    //     required: true 
    // },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

pointSchema.index({ rpmId: 1, index: 1 }); 
pointSchema.index({ modelId: 1, rpmId: 1 }); 
pointSchema.index({ pressure: 1 });

pointSchema.index({ rpmId: 1, modelId: 1 })

export const Point = model<IPointModel>('Point', pointSchema);
