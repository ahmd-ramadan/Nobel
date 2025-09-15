import { Request, Response } from 'express';
import { nativeModelService } from '../services/nativeModel.service';
import { addModelSchema, getAllModelsSchema, paramsSchema, updateModelSchema } from '../validation';

export const addModel = async(req: Request, res: Response) => {
    const data = addModelSchema.parse(req.body);
    const model = await nativeModelService.addModel(data);

    res.status(201).json({
        success: true,
        message: 'Model added successfully',
        data: model
    });
}

export const updateModel = async(req: Request, res: Response) => {
    const { _id: modelId } = paramsSchema.parse(req.params);
    const data = updateModelSchema.parse(req.body);
    
    const updatedModel = await nativeModelService.updateModel({ modelId,data });

    res.status(200).json({
        success: true,
        message: 'Model deleted successfully',
        data: updatedModel
    });
}

export const deleteModel = async(req: Request, res: Response) => {
    const { _id: modelId } = paramsSchema.parse(req.params);
    await nativeModelService.deleteModel({ modelId, deletedModel: true });

    res.status(200).json({
        success: true,
        message: 'Model deleted successfully'
    });
}


export const getAllModels = async (req: Request, res: Response) => {
    const { type } = getAllModelsSchema.parse(req.query);
    const models = await nativeModelService.getAllModels({ type });
    res.status(200).json({
        success: true,
        message: "models retrieved successfully",
        data: models
    });
} 