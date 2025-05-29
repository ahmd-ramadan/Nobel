import mongoose, { Schema } from 'mongoose'
import { UserRolesEnum } from '../enums'
import { IUserModel } from '../interfaces';

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(UserRolesEnum),
        default: UserRolesEnum.USER
    },
    isBlocked: { 
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true } 
})

export const User = mongoose.model<IUserModel>('User', userSchema);