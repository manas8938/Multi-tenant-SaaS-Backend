import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Middleware');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const correlationId = req.headers['x-correlation-id'];

    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.log(
        `[${correlationId}] ${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent}`,
      );
    });

    next();
  }
}