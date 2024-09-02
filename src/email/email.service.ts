import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: configService.get('NODEMAILER_HOST'),
      port: configService.get('NODEMAILER_PORT'),
      secure: false,
      auth: {
        user: configService.get('Nodemailer_auth_user'),
        pass: configService.get('NODEMAILER_AUTH_PASS'),
      },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: '1429388864@qq.com',
      },
      to,
      subject,
      html,
    });
  }
}
