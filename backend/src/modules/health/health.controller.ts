import { Controller, Get, HttpCode, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../shared/decorators/public.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Application health check' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async check(@Res() res: Response): Promise<void> {
    let dbOk = false;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      // intentional
    }

    const overallStatus = dbOk ? 'ok' : 'error';
    const statusCode = overallStatus === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('details')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detailed health check (Admin only)' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async details(@Res() res: Response): Promise<void> {
    const startTime = Date.now();
    let dbStatus: { status: 'ok' | 'error'; responseTime?: number; error?: string };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = { status: 'ok', responseTime: Date.now() - startTime };
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

    const memStatus: 'ok' | 'warn' | 'error' =
      usagePercent > 90 ? 'error' : usagePercent > 75 ? 'warn' : 'ok';

    const overallStatus = dbStatus.status === 'error' || memStatus === 'error' ? 'error' : 'ok';
    const statusCode = overallStatus === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json({
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
    });
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
