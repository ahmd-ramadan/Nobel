import { Response } from "express";
import { userService } from "../services";
import { OK, pagenation } from "../utils";
import { AuthenticatedRequest, IUser } from "../interfaces";
import { addModelSchema, deleteUserSchema, getAllModelsSchema, paginationSchema, paramsSchema, updateModelSchema } from "../validation";
import { DeleteUserTypes, UserRolesEnum } from "../enums";
import { ValidationErrorMessages } from '../constants/error.messages';
import { modelService } from "../services/model.service";
import { models } from "mongoose";


export const addModel = async (req: AuthenticatedRequest, res: Response) => {
    const data = addModelSchema.parse(req.body);
    const addedModel = await modelService.addModel(data);

    res.status(OK).json({ 
        success: true,
        message: 'Model added successfully',
        data: addedModel
    });
};

export const updateModel = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: modelId } = paramsSchema.parse(req.params);
    const data = updateModelSchema.parse(req.body);
    
    const updatedModel = await modelService.updateModel({ modelId, data });

    res.status(OK).json({ 
        success: true,
        message: 'Model updated successfully',
        data: updatedModel
    });
};

export const deleteModel = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: modelId } = paramsSchema.parse(req.params);

    const deletedModel= await modelService.deleteModel({ modelId });
    
    res.status(OK).json({ 
        success: true,
        message: 'Deleted model successfully',
        data: deletedModel
    });
};

export const getModelById = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: modelId } = paramsSchema.parse(req.params);

    const model= await modelService.isModelExists(modelId);
    
    res.status(OK).json({ 
        success: true,
        message: 'Model retrivied successfully',
        data: model
    });
};

export const getAllModels = async (req: AuthenticatedRequest, res: Response) => {
    const query = getAllModelsSchema.parse(req.query)
    const { page, size } = paginationSchema.parse(req.query)

    const models = await modelService.getAllModels({ ... query, page, size });

    res.status(OK).json({ 
        success: true,
        message: 'Models retrivied successfully',
        data: models
    });
};


