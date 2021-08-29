"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const date_fns_1 = require("date-fns");
const auth_constants_1 = require("./auth.constants");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
                passwordHash: dto.password,
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return {
            accessToken: this.setJwtToken(user),
            refreshToken: await this.setRefreshToken(user),
        };
    }
    setJwtToken(user) {
        return this.jwt.sign({
            id: user.id,
            email: user.email,
        }, { expiresIn: '1h' });
    }
    verifyJwt(token) {
        const jwt = this.jwt.verify(token);
        return { id: jwt.id, email: jwt.email };
    }
    async setRefreshToken(user) {
        const randomToken = crypto_1.randomBytes(30).toString('hex');
        const newRefreshSession = await this.prisma.refreshToken.create({
            data: {
                user: {
                    connect: { id: user.id },
                },
                createdAt: date_fns_1.addHours(new Date(), 3),
                expiresIn: date_fns_1.addDays(new Date(), auth_constants_1.REFRESH_TOKEN_EXPIRE_DAYS),
                isExpired: false,
                token: randomToken,
            },
        });
        return newRefreshSession.token;
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map