import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        passwordHash: dto.password,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return this.jwt.sign(
      {
        email: user.email,
      },
      { expiresIn: '1h' },
    );
  }

  verifyJwt(token: string) {
    const jwt = this.jwt.verify(token);
    return { email: jwt.email };
  }
}
