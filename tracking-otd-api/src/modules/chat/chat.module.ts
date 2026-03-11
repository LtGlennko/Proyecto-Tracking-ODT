import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { Mensaje } from './mensaje.entity';
import { MensajeEtiqueta } from './mensaje-etiqueta.entity';
import { Notificacion } from './notificacion.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Mensaje, MensajeEtiqueta, Notificacion])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
