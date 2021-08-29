import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { addDays, addHours } from 'date-fns';
import { REFRESH_TOKEN_EXPIRE_DAYS } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  public async login(dto: AuthDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        passwordHash: dto.password,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

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
      { expiresIn: '1h' },
    );
  }

  public verifyJwt(token: string) {
    const jwt = this.jwt.verify(token);
    return { id: jwt.id, email: jwt.email };
  }

  async setRefreshToken(user: User) {
    const randomToken = randomBytes(30).toString('hex');

    const newRefreshSession = await this.prisma.refreshToken.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        createdAt: addHours(new Date(), 3),
        expiresIn: addDays(new Date(), REFRESH_TOKEN_EXPIRE_DAYS),
        isExpired: false,
        token: randomToken,
      },
    });

    return newRefreshSession.token;
  }
}
