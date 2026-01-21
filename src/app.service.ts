import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getAppInfo() {
    return {
      name: this.configService.get<string>('APP_NAME', 'SaaS Backend'),
      version: this.configService.get<string>('API_VERSION', '1.0'),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      timestamp: new Date().toISOString(),
    };
  }
}