import express, { Application } from "express"
import helmet from "helmet"
import cors from "cors"
import compression from "compression"
import morgan from "morgan"
import { INTERNAL_SERVER_ERROR, logger, SERVER } from "./utils"
import { corsConfig, nodeEnv, port } from "./config"
import { errorHandler, xss } from "./middlewares"
import routes from './routes'
import { connectWithDatabase } from "./utils"
import { tokenService, trackingService } from "./services"

const app: Application = express();
const morganLogger =
  nodeEnv === SERVER.DEVELOPMENT
    ? morgan('dev')
    : morgan('combined'
        // , {
        //     skip: (_, res) => res.statusCode < INTERNAL_SERVER_ERROR,
        // }
    );

app.get('/', (_, res) => {
    res.send(
        '<div style="text-align: center; margin-top: 20px;"><h1>Welcome to Nobel Apis</h1></div>',
    );
});

app.set("trust proxy", 1);
app.use(cors(corsConfig));
app.use(morganLogger);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(xss);

app.use('/api/v1', routes);

app.use(errorHandler)

export const start = async () => {
    try {
        
        tokenService.scheduleTokenCleanupTask();
        trackingService.scheduleTrackingCleanupTask();

        await connectWithDatabase();

        const server = app.listen(Number(port) || SERVER.DEFAULT_PORT_NUMBER, '0.0.0.0', () => {
            logger.info(
                `Server is running on ${port || SERVER.DEFAULT_PORT_NUMBER} 🚀`,
            );
        });
    
        process.on('SIGINT', () => {
            logger.warn('Shutting down gracefully...');

            server.close(() => {
                logger.info('Server closed successfully! 👋');
                process.exit(0);
            });
        });
    } catch (error) {
        logger.error(`Error occurred while starting the server - ${error} ❌`);
        process.exit(1);
    }
};