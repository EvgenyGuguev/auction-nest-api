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
exports.JwtGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../../auth/auth.service");
let JwtGuard = class JwtGuard {
    constructor(auth) {
        this.auth = auth;
    }
    canActivate(context) {
        try {
            const req = context.switchToHttp().getRequest();
            const authHeader = req.headers['authorization'];
            const token = authHeader.split(' ')[1];
            const user = this.auth.verifyJwt(token);
            if (!user) {
                return false;
            }
            req.user = user;
            return true;
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Authorization required');
        }
    }
};
JwtGuard = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], JwtGuard);
exports.JwtGuard = JwtGuard;
//# sourceMappingURL=jwt.guard.js.map