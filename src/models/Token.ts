import mongoose, { Schema } from 'mongoose'
import { ITokenModel } from '../interfaces';
import { TokenTypesEnum } from '../enums/token.enums';

const tokenSchema = new Schema({
    token: {
        type: String, 
        unique: true,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(TokenTypesEnum),
        default: TokenTypesEnum.REFRESH
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true } 
})

tokenSchema.virtual('userData', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
    options: { 
        select: 'name role _id' 
    }
});

export const Token = mongoose.model<ITokenModel>('Token', tokenSchema);