import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StagingService } from './staging.service';

@ApiTags('staging')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard)
@Controller('v1/staging')
export class StagingController {
  constructor(private service: StagingService) {}

  @Post('upload/proped')
  @ApiOperation({ summary: 'Subir Excel PROPED_BUSES' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProped(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    const records = this.service.parseProped(file.buffer);
    const result = await this.service.upsert(records, 'PROPED');
    return { fuente: 'PROPED', registros: records.length, ...result };
  }

  @Post('upload/sap')
  @ApiOperation({ summary: 'Subir Excel SAP Reporte_fichas' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSap(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    const records = this.service.parseSap(file.buffer);
    const result = await this.service.upsert(records, 'SAP');
    return { fuente: 'SAP', registros: records.length, ...result };
  }

  @Get('vin/:vinId')
  @ApiOperation({ summary: 'Estado de staging para un VIN' })
  getByVin(@Param('vinId') vinId: string) { return this.service.getByVin(vinId); }

  @Get('history')
  @ApiOperation({ summary: 'Historial de cargas' })
  getHistory() { return this.service.getHistory(); }
}
