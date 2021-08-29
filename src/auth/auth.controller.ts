import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RefreshTokenDto } from './dto';
import { FastifyRequest } from 'fastify';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  authUser(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @Get('current-user')
  currentUser(@Req() request: FastifyRequest) {
    return this.authService.getCurrentUserFromJWT(request);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }
}
