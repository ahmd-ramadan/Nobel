import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { getAllTracksSchema, paginationSchema } from "../validation";
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