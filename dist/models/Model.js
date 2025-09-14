"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const mongoose_1 = require("mongoose");
const interfaces_1 = require("../interfaces");
const modelSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(interfaces_1.ModelTypesEnum),
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
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
modelSchema.index({ type: 1, factor: 1 });
exports.Model = (0, mongoose_1.model)('Model', modelSchema);
