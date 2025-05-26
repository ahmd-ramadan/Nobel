import mongoose from "mongoose"
import { mongodbUrl } from "../config"
import { logger } from "../utils"

export const connect = async () => {
    mongoose.connect(mongodbUrl).then(
        () => {
            logger.info(`Database is running now ^_^`);
        }
    ).catch(
        (error) => {
            logger.error(`Error occurred while connection with database - ${error} ❌`)
            process.exit(1)
        }
    )
}