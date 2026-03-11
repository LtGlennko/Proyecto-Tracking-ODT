import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { Mensaje } from './mensaje.entity';
import { MensajeEtiqueta } from './mensaje-etiqueta.entity';
import { Notificacion } from './notificacion.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Mensaje) private mensajeRepo: Repository<Mensaje>,
    @InjectRepository(MensajeEtiqueta) private etiquetaRepo: Repository<MensajeEtiqueta>,
    @InjectRepository(Notificacion) private notifRepo: Repository<Notificacion>,
  ) {}

  async create(dto: CreateChatDto): Promise<Chat> {
    if (dto.fichaId && dto.vinId) throw new BadRequestException('Un chat no puede pertenecer a ficha y VIN simultáneamente');
    if (!dto.fichaId && !dto.vinId) throw new BadRequestException('Debe especificar fichaId o vinId');
    return this.chatRepo.save(this.chatRepo.create(dto));
  }

  async findMensajes(chatId: number, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) throw new NotFoundException(`Chat ${chatId} no encontrado`);
    const [items, total] = await this.mensajeRepo.findAndCount({
      where: { chatId },
      order: { fechaHora: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { _pagination: { items, total, page, limit } };
  }

  async sendMensaje(chatId: number, dto: CreateMensajeDto, usuarioId?: number): Promise<Mensaje> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) throw new NotFoundException(`Chat ${chatId} no encontrado`);

    const mensaje = await this.mensajeRepo.save(
      this.mensajeRepo.create({ chatId, usuarioAutorId: usuarioId, contenido: dto.contenido, fechaHora: new Date() }),
    );

    if (dto.menciones?.length) {
      for (const uid of dto.menciones) {
        await this.etiquetaRepo.save(this.etiquetaRepo.create({ mensajeId: mensaje.id, usuarioEtiquetadoId: uid }));
        await this.notifRepo.save(this.notifRepo.create({ usuarioDestinoId: uid, mensajeId: mensaje.id, canal: 'whatsapp', estadoEnvio: 'pendiente', fechaEnvio: new Date() }));
      }
    }
    return mensaje;
  }

  async findByFicha(fichaId: number): Promise<Chat> {
    const chat = await this.chatRepo.findOne({ where: { fichaId } });
    if (!chat) throw new NotFoundException(`Chat para ficha ${fichaId} no encontrado`);
    return chat;
  }

  async findByVin(vinId: string): Promise<Chat> {
    const chat = await this.chatRepo.findOne({ where: { vinId } });
    if (!chat) throw new NotFoundException(`Chat para VIN ${vinId} no encontrado`);
    return chat;
  }
}
