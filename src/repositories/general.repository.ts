import { Model, FilterQuery, UpdateQuery, PopulateOptions } from 'mongoose';

type PopulateType = string[] | PopulateOptions | PopulateOptions[];

export default class GeneralRepository<T, Response = T> {
    constructor(private readonly dbClient: Model<T>) {}

    // private async populateHelper<FunResponse>(docPromise: Promise<any>, populate?: PopulateType): Promise<FunResponse | null> {
    //     const result = await docPromise;

    //     if (!populate || !result) return result;

    //     if (typeof result.populate === 'function') {
    //         return await result.populate(populate);
    //     }

    //     return result;
    // }

    private async populateHelper<FunResponse>(
        docPromise: Promise<any> | any,
        populate?: PopulateType
    ): Promise<FunResponse | null> {
        const result = await docPromise;
      
        if (!populate || !result) return result;
      
        if (typeof result.populate === 'function') {
            const populated = await result.populate(populate);
      
          
            if (typeof populated.exec === 'function') {
                return await populated.exec();
            }
        
            return populated;
        }
      
        return result;
    }
      

    async createOne(data: Partial<T>, populate?: PopulateType): Promise<Response | T> {
        const created = await this.dbClient.create(data);
        if (populate) {
            return this.populateHelper<Response>(this.dbClient.findById(created._id), populate) as Promise<Response | T>;
        }
        return created;
    }

    async insertMany(data: Partial<T>[], options?: { ordered?: boolean; populate?: PopulateType }): Promise<(Response | T)[]> {
        const insertedDocs = await this.dbClient.insertMany(data, { ordered: options?.ordered ?? true });
    
        if (options?.populate) {
            // Populate each inserted document
            return Promise.all(
                insertedDocs.map(doc => this.populateHelper<Response>(doc, options.populate) as Promise<Response | T>)
            );
        }
    
        return insertedDocs as (Response | T)[];
    }
    

    async findOne(query: FilterQuery<T>): Promise<T | null> {
        return this.dbClient.findOne(query);
    }

    async findOneWithPopulate(query: FilterQuery<T>, populate: PopulateType): Promise<Response | null> {
        return this.populateHelper<Response>(this.dbClient.findOne(query), populate);
    }

    async find(query: FilterQuery<T>, options?: { skip?: number; limit?: number }): Promise<T[]> {
        let dbQuery = this.dbClient.find(query);
        if (options?.skip) dbQuery = dbQuery.skip(options.skip);
        if (options?.limit) dbQuery = dbQuery.limit(options.limit);
        return dbQuery;
    }

    async findWithPopulate(
        query: FilterQuery<T>,
        populate: PopulateType,
        options?: { skip?: number; limit?: number, sort?: Record<string, 1 | -1> }
    ): Promise<Response[]> {
        let dbQuery = this.dbClient.find(query);
        if (options?.skip) dbQuery = dbQuery.skip(options.skip);
        if (options?.limit) dbQuery = dbQuery.limit(options.limit);
        if (options?.sort !== undefined) dbQuery = dbQuery.sort(options.sort);
        
        return await this.populateHelper<Response[]>(dbQuery, populate) as Response[];
    }
      

    async findById(objectId: string): Promise<T | null> {
        return this.dbClient.findById(objectId);
    }

    async findByIdWithPopulate(objectId: string, populate: PopulateType): Promise<Response | null> {
        return this.populateHelper<Response>(this.dbClient.findById(objectId), populate);
    }

    async updateOne(
        query: FilterQuery<T>,
        data: UpdateQuery<T>,
        populate?: PopulateType
    ): Promise<Response | T | null> {
        const updated = this.dbClient.findOneAndUpdate(query, { $set: data }, { new: true });
        return this.populateHelper<Response>(updated, populate);
    }

    async updateMany(query: FilterQuery<T>, data: UpdateQuery<T>) {
        return this.dbClient.updateMany(query, { $set: data });
    }

    async deleteOne(query: FilterQuery<T>) {
        return this.dbClient.findOneAndDelete(query);
    }

    async deleteMany(query: FilterQuery<T>) {
        return this.dbClient.deleteMany(query);
    }
}
