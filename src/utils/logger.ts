import winston from 'winston';
import * as fs from 'fs';
import path from 'path';

const { createLogger, format, transports } = winston;

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'DD-MM-YYYY HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          (info) =>
            `[${info.timestamp}] ${info.level}: ${info.message}${
              info.stack ? '\n' + info.stack : ''
            }`
        )
      )
    })
  ]
});

// PATH LOGGER
const mainPathLogger =
  process.env.LOGS_PATH || path.resolve(__dirname, '../..', 'logs');

logger.info(`LOGGER ALMANCENANDO EN: ${mainPathLogger}`);

// Name proyect
const packageJsonPath = './package.json';
const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
const packageJson = JSON.parse(packageJsonContent);

const proyectName = packageJson.name || 'my-app';

logger.add(
  new transports.File({
    filename: `${proyectName}.log`,
    dirname: mainPathLogger,
    maxsize: 100 * 1024 * 1024, // Max size of the log file (10 MB in this example)
    maxFiles: 5 // Max number of rotated log files to keep
  })
);

export default logger;
