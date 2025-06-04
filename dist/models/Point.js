"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
const mongoose_1 = require("mongoose");
const pointSchema = new mongoose_1.Schema({
    modelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Model',
        required: true
    },
    rpmId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'RPM',
        required: true
    },
    index: {
        type: Number,
        required: true
    }, // 0 to 999
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
pointSchema.index({ rpmId: 1, index: 1 });
pointSchema.index({ modelId: 1, rpmId: 1 });
pointSchema.index({ pressure: 1 });
exports.Point = (0, mongoose_1.model)('Point', pointSchema);
