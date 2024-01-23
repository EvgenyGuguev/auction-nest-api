import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtGuard } from './common/guards/jwt.guard';
import { NotifireService } from '@notifire/nest';

@UseGuards(JwtGuard)
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: NotifireService,
  ) {}

  @Get('test')
  async getProtected() {
    await this.mailService.trigger('test-email', {
      $email: 'reciever@mail.com',
      $user_id: 'id',
      firstName: 'John',
    });
  }
}
