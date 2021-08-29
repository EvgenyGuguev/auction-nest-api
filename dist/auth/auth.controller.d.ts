import { AuthService } from './auth.service';
import { AuthDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    authUser(dto: AuthDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
