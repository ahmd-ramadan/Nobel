import { Schema, model } from 'mongoose';
import { CentrifugalTypesEnum, ConfigurationTypesEnum, IModel, ModelTypesEnum, PressureTypesEnum } from '../interfaces';

const modelSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(ModelTypesEnum),
        required: true
    },
    factor: {
        type: Number,
        required: true,
    },
    name: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    description: { 
        type: String 
    },
    startRpmNumber: {
        type: Number,
        required: true
    },
    endRpmNumber: {
        type: Number,
        required: true
    },
    points: [
        {
            rpm: {
                type: Number,
                required: true
            },
            flowRate: { 
                type: Number, 
                required: true 
            },
            totalPressure: { 
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
        }
    ],
    isComplete: {
        type: Boolean,
        required: true,
        default: false
    },

    pressureType: {
        type: String,
        enum: Object.values(PressureTypesEnum),
        required: true,
    },
    configurationType: {
        type: String,
        enum: Object.values(ConfigurationTypesEnum),
        required: false
    },
    centrifugalType: {
        type: String,
        enum: Object.values(CentrifugalTypesEnum),
        required: true
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

modelSchema.index({ type: 1, factor: 1 })

export const Model = model<IModel>('Model', modelSchema);
