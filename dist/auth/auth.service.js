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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const date_fns_1 = require("date-fns");
const auth_constants_1 = require("./auth.constants");
const helper_1 = require("../common/helpers/helper");
const account_service_1 = require("../account/account.service");
let AuthService = class AuthService {
    constructor(prisma, accountService, jwt) {
        this.prisma = prisma;
        this.accountService = accountService;
        this.jwt = jwt;
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
                passwordHash: this.accountService.hashPassword(dto.password),
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException(auth_constants_1.ERROR_USER_TOT_FOUND);
        return {
            accessToken: this.setJwtToken(user),
            refreshToken: await this.setRefreshToken(user),
        };
    }
    setJwtToken(user) {
        return this.jwt.sign({
            id: user.id,
            email: user.email,
        }, { expiresIn: '24h' });
    }
    verifyJwt(token) {
        const jwt = this.jwt.verify(token);
        return { id: jwt.id, email: jwt.email };
    }
    async setRefreshToken(user) {
        const randomToken = (0, crypto_1.randomBytes)(30).toString('hex');
        const newRefreshSession = await this.prisma.refreshToken.create({
            data: {
                user: {
                    connect: { id: user.id },
                },
                createdAt: helper_1.currentTime,
                expiresIn: (0, date_fns_1.addDays)(helper_1.currentTime, auth_constants_1.REFRESH_TOKEN_EXPIRE_DAYS),
                isExpired: false,
                token: randomToken,
            },
        });
        return newRefreshSession.token;
    }
    async getCurrentUserFromJWT(request) {
        const authHeader = request.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const { id } = this.verifyJwt(token);
            return await this.prisma.user.findUnique({
                where: { id: id },
            });
        }
    }
    async refresh(dto) {
        const refreshTokenSession = await this.prisma.refreshToken.findFirst({
            where: { token: dto.refreshToken },
        });
        if (!refreshTokenSession)
            return new common_1.UnauthorizedException(auth_constants_1.ERROR_REFRESH_NOT_VALID);
        if (refreshTokenSession && !refreshTokenSession.isExpired) {
            const user = await this.prisma.user.findUnique({
                where: { id: refreshTokenSession.userId },
            });
            if (!user)
                throw new common_1.UnauthorizedException(auth_constants_1.ERROR_USER_TOT_FOUND);
            await this.prisma.refreshToken.update({
                where: { id: refreshTokenSession.id },
                data: { isExpired: true },
            });
            return {
                accessToken: this.setJwtToken(user),
                refreshToken: await this.setRefreshToken(user),
            };
        }
        return new common_1.UnauthorizedException(auth_constants_1.ERROR_REFRESH_TOKEN_EXPIRED);
    }
};
__decorate([
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "getCurrentUserFromJWT", null);
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        account_service_1.AccountService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map