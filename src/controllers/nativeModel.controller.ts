import { Request, Response } from 'express';
import { nativeModelService } from '../services/nativeModel.service';

export const addModel = async(req: Request, res: Response) => {
    const model = await nativeModelService.addModel(req.body);
    res.status(201).json({
        success: true,
        message: 'Model added successfully',
        data: model
    });
}

export const deleteModel = async(req: Request, res: Response) => {
    const { _id: modelId } = req.params;
    await nativeModelService.deleteModel({ modelId });
    res.status(200).json({
        success: true,
        message: 'Model deleted successfully'
    });
}

export const getAllModels = async (req: Request, res: Response) => {
    const { type } = req.query;
    const models = await nativeModelService.getAllModels({ type: type as any });
    res.status(200).json({
        success: true,
        data: models
    });
} 