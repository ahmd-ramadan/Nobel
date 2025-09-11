import { Response } from "express";
import { AuthenticatedRequest, ISearchResult, TrackingTypesEnum } from "../interfaces";
import { serachInputSchema } from "../validation";
import { searchService, trackingService } from "../services";
import { OK } from "../utils";


export const search = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const inputs = serachInputSchema.parse(req.body);

    const results = await searchService.search(inputs);

    // add search to user-history
    const searchHistoryObject = results.map(({ model, rpm, closestPoint }: ISearchResult) => ({
        model, rpm, closestPoint, isReported: false
    }));
    const addedSearchHistoryObject = await trackingService.addNewTracking({ 
        type: TrackingTypesEnum.SEARCH,
        userId, 
        searchResults: searchHistoryObject,
        
    }) 

    res.status(OK).json({
        success: true,
        message: 'Search created successfully',
        data: {
            results,
            trackId: addedSearchHistoryObject._id
        }
    })
}