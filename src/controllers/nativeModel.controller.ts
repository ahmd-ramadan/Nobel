import { Request, Response } from 'express';
import { nativeModelService } from '../services/nativeModel.service';
import { ApiError } from '../utils';

export const addModel = async(req: Request, res: Response) => {
    try {
        const model = await nativeModelService.addModel(req.body);
        res.status(201).json({
            success: true,
            message: 'Model added successfully',
            data: model
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

export const deleteModel = async(req: Request, res: Response) => {
    try {
        const { _id: modelId } = req.params;
        await nativeModelService.deleteModel({ modelId });
        res.status(200).json({
            success: true,
            message: 'Model deleted successfully'
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

export const getAllModels = async (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        const models = await nativeModelService.getAllModels({ type: type as any });
        res.status(200).json({
            success: true,
            data: models
        });
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.status).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 