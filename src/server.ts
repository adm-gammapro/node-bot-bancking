import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import logger from './utils/logger';
import { router } from './routes';
import config from './config';
import accessMiddleware from './middleware/middlewareAccess';
import { init as initBroserCache } from './automator/browserGlobal';

interface ServerOptions {
  port: number;
}
class Server {
  private readonly app: Express;
  private readonly port: number;

  constructor(options: ServerOptions) {
    this.app = express();
    this.port = options.port;

    this.middleware();
    this.routes();
  }

  private routes(): void {
    this.app.use(router);
  }

  private middleware(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(accessMiddleware);
  }

  public run(): void {
    initBroserCache();

    this.app.listen(this.port, () =>
      logger.info(`Server running port: ${this.port}`)
    );
  }
}

const server = new Server({
  port: Number(config.server.port) || 3001
});
server.run();
