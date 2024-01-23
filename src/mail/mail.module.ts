import { Module } from '@nestjs/common';
import { NotifireModule } from '@notifire/nest';
import { NodemailerProvider } from '@notifire/nodemailer';
import { ChannelTypeEnum } from '@notifire/core';

@Module({
  imports: [
    NotifireModule.forRoot({
      providers: [
        new NodemailerProvider({
          from: process.env.MAIL_FROM || '',
          port: Number(process.env.MAIL_PORT),
          host: '0.0.0.0',
          secure: false,
          password: 'password',
          user: 'user',
        }),
      ],
      templates: [
        {
          id: 'test-email',
          messages: [
            {
              subject: 'Test mailhog email',
              channel: ChannelTypeEnum.EMAIL,
              template: `
                      Hi {{firstName}}!
                      It's test email
               `,
            },
          ],
        },
      ],
    }),
  ],
})
export class MailModule {}
