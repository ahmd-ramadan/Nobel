import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { addReportForModelSchema, getAllTracksSchema, paginationSchema } from "../validation";
import { trackingService } from "../services";
import { OK } from "../utils";
import { ValidationErrorMessages } from "../constants/error.messages";


export const getAllTracks = async (req: AuthenticatedRequest, res: Response) => {
    const data = getAllTracksSchema.parse(req.query);
    const { page, size } = paginationSchema.parse(req.query);

    const allTracks = await trackingService.getAllTracking({ ... data, size, page });

    res.status(OK).json({
        success: true, 
        message: ValidationErrorMessages.GET_ALL_TRACKS_SUCCESS,
        data: allTracks
    })
}

export const addReportForModelInSearchTracking = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const { modelId, trackId } = addReportForModelSchema.parse(req.body);

    const updatedTrack = await trackingService.addNewReporFortModel({ trackId, modelId, userId });

    res.status(OK).json({
        success: true, 
        message: "Added new report for model in search tracking is successfully",
        data: updatedTrack
    })
}