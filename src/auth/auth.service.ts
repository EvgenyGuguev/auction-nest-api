import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, RefreshTokenDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';
import {
  ERROR_REFRESH_NOT_VALID,
  ERROR_REFRESH_TOKEN_EXPIRED,
  ERROR_USER_TOT_FOUND,
  REFRESH_TOKEN_EXPIRE_DAYS,
} from './auth.constants';
import { FastifyRequest } from 'fastify';
import { currentTime } from '../common/helpers/helper';
import { AccountService } from '../account/account.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountService: AccountService,
    private readonly jwt: JwtService,
  ) {}

  public async login(dto: AuthDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        passwordHash: this.accountService.hashPassword(dto.password),
      },
    });

    if (!user) throw new UnauthorizedException(ERROR_USER_TOT_FOUND);

    return {
      accessToken: this.setJwtToken(user),
      refreshToken: await this.setRefreshToken(user),
    };
  }

  private setJwtToken(user: User) {
    return this.jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      { expiresIn: '24h' },
    );
  }

  public verifyJwt(token: string) {
    const jwt = this.jwt.verify(token);
    return { id: jwt.id, email: jwt.email };
  }

  private async setRefreshToken(user: User) {
    const randomToken = randomBytes(30).toString('hex');

    const newRefreshSession = await this.prisma.refreshToken.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        createdAt: currentTime,
        expiresIn: addDays(currentTime, REFRESH_TOKEN_EXPIRE_DAYS),
        isExpired: false,
        token: randomToken,
      },
    });

    return newRefreshSession.token;
  }

  public async getCurrentUserFromJWT(@Req() request: FastifyRequest) {
    const authHeader = request.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const { id } = this.verifyJwt(token);
      return await this.prisma.user.findUnique({
        where: { id: id },
      });
    }
  }

  public async refresh(dto: RefreshTokenDto) {
    const refreshTokenSession = await this.prisma.refreshToken.findFirst({
      where: { token: dto.refreshToken },
    });

    if (!refreshTokenSession)
      return new UnauthorizedException(ERROR_REFRESH_NOT_VALID);

    if (refreshTokenSession && !refreshTokenSession.isExpired) {
      const user = await this.prisma.user.findUnique({
        where: { id: refreshTokenSession.userId },
      });

      if (!user) throw new UnauthorizedException(ERROR_USER_TOT_FOUND);

      await this.prisma.refreshToken.update({
        where: { id: refreshTokenSession.id },
        data: { isExpired: true },
      });

      return {
        accessToken: this.setJwtToken(user),
        refreshToken: await this.setRefreshToken(user),
      };
    }

    return new UnauthorizedException(ERROR_REFRESH_TOKEN_EXPIRED);
  }
}
