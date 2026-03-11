import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
  ) {}

  async syncUser(jwtUser: any): Promise<Usuario> {
    let usuario = await this.usuarioRepo.findOne({ where: { azureAdOid: jwtUser.oid } });
    if (!usuario) {
      usuario = this.usuarioRepo.create({
        azureAdOid: jwtUser.oid,
        email: jwtUser.email,
        nombre: jwtUser.nombre,
        perfil: jwtUser.perfil || 'asesor_comercial',
        activo: true,
      });
    } else {
      usuario.email = jwtUser.email;
      usuario.nombre = jwtUser.nombre;
    }
    return this.usuarioRepo.save(usuario);
  }

  async getMe(oid: string): Promise<Usuario> {
    return this.usuarioRepo.findOne({ where: { azureAdOid: oid } });
  }
}
