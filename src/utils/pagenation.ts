
export const pagenation = ({ page, size }: { page: number, size: number }): { limit: number, skip: number } => {
    const limit = size || 100;
    const skip = (page > 0 ? page - 1 : 0) * size;
    return { limit, skip }; 
}