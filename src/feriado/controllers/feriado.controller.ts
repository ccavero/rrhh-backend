import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

import { FeriadoService } from '../services/feriado.service';
import {
    ActualizarFeriadoDto,
    CrearFeriadoDto,
    FeriadoResponseDto,
} from '../dto/feriado.dto';

@ApiTags('feriados')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('feriados')
export class FeriadoController {
    constructor(private readonly feriadoService: FeriadoService) {}

    @Get()
    @Roles('ADMIN', 'RRHH')
    @ApiOperation({ summary: 'Listar feriados' })
    @ApiResponse({ status: 200, type: [FeriadoResponseDto] })
    listar() {
        return this.feriadoService.listar();
    }

    @Post()
    @Roles('ADMIN', 'RRHH')
    @ApiOperation({ summary: 'Registrar feriado' })
    @ApiResponse({ status: 201, type: FeriadoResponseDto })
    crear(@Body() dto: CrearFeriadoDto) {
        return this.feriadoService.crear(dto);
    }

    @Patch(':id_feriado')
    @Roles('ADMIN', 'RRHH')
    @ApiParam({ name: 'id_feriado', type: String })
    @ApiOperation({ summary: 'Actualizar feriado' })
    @ApiResponse({ status: 200, type: FeriadoResponseDto })
    actualizar(
        @Param('id_feriado') id_feriado: string,
        @Body() dto: ActualizarFeriadoDto,
    ) {
        return this.feriadoService.actualizar(id_feriado, dto);
    }
}