import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminLeadsService } from './admin-leads.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('admin/leads')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminLeadsController {
  constructor(private readonly leads: AdminLeadsService) {}

  @Get()
  list(@Query() query: ListLeadsDto) {
    return this.leads.list(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.leads.getById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.leads.update(id, dto, user);
  }

  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.leads.addNote(id, dto, user);
  }
}
