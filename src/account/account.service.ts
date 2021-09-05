import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto';
import { pbkdf2Sync } from 'crypto';
import {
  ERROR_ACCOUNT_BAD_REQUEST,
  PASSWORD_HASH_SALT,
} from './account.constants';
import { zonedTimeToUtc } from 'date-fns-tz';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(dto: CreateAccountDto) {
    const currentTime = zonedTimeToUtc(new Date(), 'UTC+3');

    const isEmailAlreadyExist = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    const isPasswordAlreadyExist = await this.prisma.user.findUnique({
      where: { passwordHash: AccountService.hashPassword(dto.password) },
    });

    if (isEmailAlreadyExist || isPasswordAlreadyExist)
      throw new BadRequestException(ERROR_ACCOUNT_BAD_REQUEST);

    return await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: AccountService.hashPassword(dto.password),
        name: dto.name,
        createdAt: currentTime,
      },
    });
  }

  private static hashPassword(password: string) {
    return pbkdf2Sync(
      password,
      PASSWORD_HASH_SALT,
      1000,
      64,
      'sha512',
    ).toString('hex');
  }
}
