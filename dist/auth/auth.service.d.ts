import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, RefreshTokenDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { FastifyRequest } from 'fastify';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(dto: AuthDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private setJwtToken;
    verifyJwt(token: string): {
        id: any;
        email: any;
    };
    private setRefreshToken;
    getCurrentUserFromJWT(request: FastifyRequest): Promise<User | null | undefined>;
    refresh(dto: RefreshTokenDto): Promise<UnauthorizedException | {
        accessToken: string;
        refreshToken: string;
    }>;
}
