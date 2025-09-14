"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPM = void 0;
const mongoose_1 = require("mongoose");
const rpmSchema = new mongoose_1.Schema({
    modelId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.RPM = (0, mongoose_1.model)('RPM', rpmSchema);
