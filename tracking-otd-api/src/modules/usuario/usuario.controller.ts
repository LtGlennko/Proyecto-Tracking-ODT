import { Controller, Get, Patch, Put, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AssignEmpresasDto } from './dto/assign-empresas.dto';

@ApiTags('usuarios')
@ApiBearerAuth('azure-ad-b2c')
@Controller('v1/usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @Roles('superadministrador', 'administrador')
  @ApiOperation({ summary: 'Lista todos los usuarios con sus empresas' })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @Roles('superadministrador', 'administrador')
  @ApiOperation({ summary: 'Obtiene un usuario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Actualiza perfil o estado de un usuario (solo superadmin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.update(id, dto);
  }

  @Put(':id/empresas')
  @Roles('superadministrador')
  @ApiOperation({ summary: 'Asigna empresas a un usuario (reemplaza las existentes)' })
  assignEmpresas(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignEmpresasDto,
  ) {
    return this.usuarioService.assignEmpresas(id, dto.empresaIds);
  }
}
