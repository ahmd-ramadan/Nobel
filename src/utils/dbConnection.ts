import mongoose from "mongoose"
import { mongodbUrl } from "../config"
import { logger } from "../utils"

export const connectWithDatabase = async () => {
    const options = {
        // Increase connection timeout for large operations
        connectTimeoutMS: 60000, // 60 seconds
        socketTimeoutMS: 60000,  // 60 seconds
        serverSelectionTimeoutMS: 60000, // 60 seconds
        
        // Optimize connection pool for large operations
        maxPoolSize: 50, // Increase pool size
        minPoolSize: 10, // Maintain minimum connections
        
        // Enable retry writes for better reliability
        retryWrites: true,
        
        // Buffer commands to handle large operations
        bufferCommands: true,
        
        // Enable write concern for better reliability
        w: 1 as const, // Use number instead of string
        journal: true // Use 'journal' instead of deprecated 'j'
    };

    mongoose.connect(mongodbUrl, options).then(
        () => {
            logger.info(`Database is running now ^_^`);
            
            // Monitor connection events
            mongoose.connection.on('error', (error) => {
                logger.error(`MongoDB connection error: ${error}`);
            });
            
            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected');
            });
            
            mongoose.connection.on('reconnected', () => {
                logger.info('MongoDB reconnected');
            });
        }
    ).catch(
        (error) => {
            logger.error(`Error occurred while connection with database - ${error} ❌`)
            process.exit(1)
        }
    )
}

// Health check function to test database connectivity
export const checkDatabaseHealth = async (): Promise<boolean> => {
    try {
        if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
            // Connection is ready, do a simple ping
            await mongoose.connection.db.admin().ping();
            return true;
        }
        return false;
    } catch (error) {
        logger.error(`Database health check failed: ${error}`);
        return false;
    }
}