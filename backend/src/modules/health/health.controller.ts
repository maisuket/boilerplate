import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../shared/decorators/public.decorator';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warn' | 'error';
      heapUsed: number;
      heapTotal: number;
      rss: number;
      usagePercent: number;
    };
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Application health check' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async check(): Promise<HealthStatus> {
    const startTime = Date.now();
    let dbStatus: HealthStatus['checks']['database'];

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = {
        status: 'ok',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      dbStatus = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }

    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);
    const usagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

    const memStatus: HealthStatus['checks']['memory']['status'] =
      usagePercent > 90 ? 'error' : usagePercent > 75 ? 'warn' : 'ok';

    const overallStatus =
      dbStatus.status === 'error' || memStatus === 'error' ? 'error' : 'ok';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: dbStatus,
        memory: {
          status: memStatus,
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB,
          rss: rssMB,
          usagePercent,
        },
      },
    };
  }

  @Public()
  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint' })
  @ApiResponse({ status: 200, description: 'Pong' })
  ping(): { message: string; timestamp: string } {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
