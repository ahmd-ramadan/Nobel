import { Schema, model } from 'mongoose';
import { IModel, ModelTypesEnum } from '../interfaces';

const modelSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(ModelTypesEnum),
        required: true
    },
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
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
    ]
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

export const Model = model<IModel>('Model', modelSchema);
