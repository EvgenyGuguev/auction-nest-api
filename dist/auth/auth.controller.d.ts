import { AuthService } from './auth.service';
import { AuthDto, RefreshTokenDto } from './dto';
import { FastifyRequest } from 'fastify';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    authUser(dto: AuthDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    currentUser(request: FastifyRequest): Promise<import(".prisma/client").User | null | undefined>;
    refresh(dto: RefreshTokenDto): Promise<import("@nestjs/common").UnauthorizedException | {
        accessToken: string;
        refreshToken: string;
    }>;
}
