import * as server from './app'
import { logger } from './utils';

server.start().catch((error) => {
    logger.error(`soleError occurred while starting the server: ${error} ❌`)
    process.exit(1);
})