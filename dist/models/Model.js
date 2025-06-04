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
exports.Model = (0, mongoose_1.model)('Model', modelSchema);
