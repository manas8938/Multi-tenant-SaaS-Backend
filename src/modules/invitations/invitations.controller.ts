import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send invitation to join tenant' })
  @ApiResponse({ status: 201, description: 'Invitation sent' })
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.create(createInvitationDto, userId);
  }

  @Get('tenant/:tenantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get tenant invitations' })
  @ApiResponse({ status: 200, description: 'List of invitations' })
  findByTenant(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.invitationsService.findByTenant(tenantId, paginationDto);
  }

  @Get('verify/:token')
  @Public()
  @ApiOperation({ summary: 'Verify invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation details' })
  verifyToken(@Param('token') token: string) {
    return this.invitationsService.verifyToken(token);
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Accept invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  accept(
    @Body() acceptDto: AcceptInvitationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.accept(acceptDto.token, userId);
  }

  @Patch(':id/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend invitation' })
  @ApiResponse({ status: 200, description: 'Invitation resent' })
  resend(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.resend(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel invitation' })
  @ApiResponse({ status: 200, description: 'Invitation cancelled' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.cancel(id, userId);
  }
}
