import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
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
    setRefreshToken(user: User): Promise<string>;
}
