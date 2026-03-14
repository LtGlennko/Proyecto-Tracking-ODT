import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppController } from './app.controller';
import { EmpresaModule } from './modules/empresa/empresa.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { FichaModule } from './modules/ficha/ficha.module';
import { VinModule } from './modules/vin/vin.module';
import { HitosModule } from './modules/hitos/hitos.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { SlaModule } from './modules/sla/sla.module';
import { AlertasModule } from './modules/alertas/alertas.module';
import { ChatModule } from './modules/chat/chat.module';
import { StagingModule } from './modules/staging/staging.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { TipoVehiculoModule } from './modules/tipo-vehiculo/tipo-vehiculo.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) =>
              `${timestamp} [${context || 'App'}] ${level}: ${message}`,
            ),
          ),
        }),
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'appuser'),
        password: config.get('DB_PASS', '1q2w3e'),
        database: config.get('DB_NAME', 'appwebdb01'),
        ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development' ? ['query', 'error'] : ['error'],
      }),
    }),
    ScheduleModule.forRoot(),
    EmpresaModule,
    ClienteModule,
    FichaModule,
    VinModule,
    HitosModule,
    TrackingModule,
    SlaModule,
    AlertasModule,
    ChatModule,
    StagingModule,
    AuthModule,
    UsuarioModule,
    TipoVehiculoModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
