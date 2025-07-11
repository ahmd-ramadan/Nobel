import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { OK } from "../utils";
import { pointService } from "../services";
import { addPointsDataSchema } from "../validation";

export const addPointsData = async (req: AuthenticatedRequest, res: Response) => {
    const data = addPointsDataSchema.parse(req.body);
    const addedPoints = await pointService.addPoint({ isUpdate: false, data });

    res.status(OK).json({ 
        success: true,
        message: 'Points Data added successfully',
        data: addedPoints
    });
};