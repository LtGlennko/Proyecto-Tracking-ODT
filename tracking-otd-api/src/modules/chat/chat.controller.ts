import { Controller, Get, Post, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('chat')
@ApiBearerAuth('azure-ad-b2c')
@UseGuards(JwtAuthGuard)
@Controller('v1/chat')
export class ChatController {
  constructor(private service: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Crear chat para una ficha o un VIN' })
  create(@Body() dto: CreateChatDto) { return this.service.create(dto); }

  @Get('ficha/:fichaId')
  @ApiOperation({ summary: 'Obtener chat de una ficha' })
  findByFicha(@Param('fichaId') fichaId: string) { return this.service.findByFicha(fichaId); }

  @Get('vin/:vinId')
  @ApiOperation({ summary: 'Obtener chat de un VIN' })
  findByVin(@Param('vinId') vinId: string) { return this.service.findByVin(vinId); }

  @Get(':id/mensajes')
  @ApiOperation({ summary: 'Listar mensajes del chat' })
  findMensajes(@Param('id', ParseIntPipe) id: number, @Query() pagination: PaginationDto) {
    return this.service.findMensajes(id, pagination);
  }

  @Post(':id/mensajes')
  @ApiOperation({ summary: 'Enviar mensaje (con menciones opcionales)' })
  sendMensaje(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateMensajeDto, @CurrentUser() user: any) {
    return this.service.sendMensaje(id, dto, user?.id);
  }
}
