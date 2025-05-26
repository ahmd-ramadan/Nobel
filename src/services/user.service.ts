import { DeleteUserTypes, UserRolesEnum } from "../enums";
import { ICreateUserQuery, IUserModel } from "../interfaces";
import { userRepository } from "../repositories";
import { ApiError, BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";
import { authService } from "./auth.service";
import { HashingService } from "./hashing.service";
import { localStorageService } from "./localStorage.service";
import { ValidationErrorMessages } from '../constants/error.messages';
import { tokenService } from "./token.service";

class UserService {

    private readonly populateUserArray = [];
    constructor(private readonly userDataSource = userRepository) {}

    async isUserExist(userId: string) {
        const isUserExist = await this.userDataSource.findByIdWithPopulate(userId, this.populateUserArray);
        if (!isUserExist) {
            throw new ApiError(ValidationErrorMessages.USER_NOT_FOUND, NOT_FOUND)
        }
        return isUserExist;
    }

    async findUserByUserName(username: string) {
        return await this.userDataSource.findOneWithPopulate({ username }, this.populateUserArray);
    }

    async createNewUser(data: ICreateUserQuery) {
        return await this.userDataSource.createOne(data, this.populateUserArray)
    }

    async updateOne({ userId, data }: { userId: string, data: Partial<IUserModel> }) {
        return await this.userDataSource.updateOne({ _id: userId }, data, this.populateUserArray)
    }

    async updateProfile({ userId, data, role, files }: { userId: string, role: UserRolesEnum, data: Partial<ICreateUserQuery>; files: any }) {
        const { name, username, password } = data;
        const newData: Partial<IUserModel> = {};
        if(username) {
            if(role === UserRolesEnum.USER) {
                throw new ApiError(ValidationErrorMessages.USERNAME_UPDATE_NOT_ALLOWED, BAD_REQUEST)
            }
            const userExists = await this.findUserByUserName(username);
            if (userExists) {
                throw new ApiError(ValidationErrorMessages.USERNAME_ALREADY_EXISTS, CONFLICT)
            }
            newData.username = username;
        }
        if (password) {
            newData.password = await HashingService.hash(password);
        }
        if (name) newData.name = name;

        return await this.updateOne({ userId, data: newData })
    }

    async updatePassword({ userId, oldPassword, newPassword }: { userId: string, oldPassword: string, newPassword: string }) {
        const { password } = await this.isUserExist(userId);

        const isMatched = await HashingService.compare(oldPassword, password as string);
        if (!isMatched) {
            throw new ApiError(ValidationErrorMessages.INCORRECT_OLD_PASSWORD, CONFLICT)
        }

        const hashedPassword = await HashingService.hash(newPassword);

        return await this.updateOne({ userId, data: { password: hashedPassword } })
    } 
    
    async findUserById(userId: string) {
        return await this.userDataSource.findByIdWithPopulate(userId, this.populateUserArray)
    }

    async addUser(data: ICreateUserQuery) {
       try {
            const { username, password, name } = data;
            const userExists = await userService.findUserByUserName(username);
        
            if (userExists) {
                throw new ApiError(ValidationErrorMessages.USER_ALREADY_EXISTS, CONFLICT);
            }
    
            const hashedPassword = await HashingService.hash(password);
            
            const userCredentials = { role: UserRolesEnum.USER, username, name, password: hashedPassword };

            const addedUser = await userService.createNewUser(userCredentials);
            
            return addedUser;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }
            throw new ApiError(ValidationErrorMessages.CREATE_USER_FAILED, INTERNAL_SERVER_ERROR);
        }
    }

    async updateUserData({ userId, name, username, password }: { userId: string, username?: string; name?: string; password?: string }) {
       try {
            await this.isUserExist(userId);
            let newData: Partial<ICreateUserQuery> = {};
            
            if(username) {
                const userExists = await this.findUserByUserName(username);
                if (userExists) {
                    throw new ApiError(ValidationErrorMessages.USERNAME_ALREADY_EXISTS, CONFLICT)
                }
                newData.username = username;
            }
            if(name) {
                newData.name = name;
            }
            if (password) {
                newData.password = await HashingService.hash(password)
            }
            return await this.updateOne({ userId, data: newData });
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }
            throw new ApiError(ValidationErrorMessages.UPDATE_USER_FAILED, INTERNAL_SERVER_ERROR);
        }
    }

    async getAllUsers() {
        try {
            return await this.userDataSource.find({ role: UserRolesEnum.USER });
         } catch (error) {
             if (error instanceof ApiError) {
                 throw error
             }
             throw new ApiError(ValidationErrorMessages.GET_USERS_FAILED, INTERNAL_SERVER_ERROR);
         }
    }

    async blockUser(userId: string) {
       try {
            return await this.userDataSource.updateOne({ _id: userId }, { isBlocked: true });
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }
            throw new ApiError(ValidationErrorMessages.BLOCK_USER_FAILED, INTERNAL_SERVER_ERROR);
        }
    }

    async cancelBlockOnUser(userId: string) {
       try {
            const user = await this.isUserExist(userId);
            if(!user.isBlocked) {
                throw new ApiError(ValidationErrorMessages.USER_NOT_BLOCKED, CONFLICT)
            }
            return await this.userDataSource.updateOne({ _id: userId }, { isBlocked: false });
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }
            throw new ApiError(ValidationErrorMessages.BLOCK_USER_FAILED, INTERNAL_SERVER_ERROR);
        }
    }

    async removeUser(userId: string) {
        try { 
            return await this.userDataSource.deleteOne({ _id: userId });
         } catch (error) {
             if (error instanceof ApiError) {
                 throw error
             }
             throw new ApiError(ValidationErrorMessages.DELETE_USER_FAILED, INTERNAL_SERVER_ERROR);
         }
     }

    async deleteUser({ userId, type }: { userId: string, type: DeleteUserTypes }) {
       try { 
            const user = await this.isUserExist(userId);
            let deletedUser = null;
            if (type === DeleteUserTypes.DELETE) {
                deletedUser = await this.removeUser(userId);
            } else {
                deletedUser = await this.blockUser(userId)
            }
            await tokenService.deleteMany({ userId });
            return deletedUser;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }
            throw new ApiError(ValidationErrorMessages.DELETE_USER_FAILED, INTERNAL_SERVER_ERROR);
        }
    }
}

export const userService = new UserService();