import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Empresa } from '../empresa/empresa.entity';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepo.find({
      relations: ['empresas'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      relations: ['empresas'],
    });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    Object.assign(usuario, dto);
    await this.usuarioRepo.save(usuario);
    return this.findOne(id);
  }

  async assignEmpresas(id: number, empresaIds: number[]): Promise<Usuario> {
    const usuario = await this.findOne(id);
    if (empresaIds.length === 0) {
      usuario.empresas = [];
    } else {
      const empresas = await this.empresaRepo.find({
        where: { id: In(empresaIds) },
      });
      if (empresas.length !== empresaIds.length) {
        const found = empresas.map((e) => e.id);
        const missing = empresaIds.filter((eid) => !found.includes(eid));
        throw new NotFoundException(`Empresas no encontradas: ${missing.join(', ')}`);
      }
      usuario.empresas = empresas;
    }
    await this.usuarioRepo.save(usuario);
    return this.findOne(id);
  }
}
