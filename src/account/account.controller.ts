import { Body, Controller, Post } from '@nestjs/common';
import { CreateAccountDto } from './dto';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  create(@Body() dto: CreateAccountDto) {
    return this.accountService.create(dto);
  }
}
