import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import PasswordResetEmail from './email_templates/ResetPasswordEmail';
import MagicLinkEmail from './email_templates/MagicLinkEmail';
import InviteUserEmail from './email_templates/InviteUserEmail';

interface SendMailConfiguration {
  email: string;
  subject: string;
  text?: string;
  template: any;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  private generateEmail = async (template) => {
    return await render(template);
  };

  async sendMail({ email, subject, template }: SendMailConfiguration) {
    const html = await this.generateEmail(template);

    await this.transporter.sendMail({
      to: email,
      subject,
      html,
      from: `"No Reply" <${this.configService.get('MAIL_USER')}>`,
    });
  }

  async sendPasswordResetMail(email: string, resetLink: string) {
    const html = await render(PasswordResetEmail({ resetLink }));

    await this.transporter.sendMail({
      to: email,
      subject: 'Reset your password',
      html,
      from: `"No Reply" <${this.configService.get('MAIL_USER')}>`,
    });
  }

  async sendMagicLink(email: string, magicLink: string) {
    const html = await render(MagicLinkEmail({ magicLink }));

    await this.transporter.sendMail({
      to: email,
      subject: 'Your magic link',
      html,
      from: `"No Reply" <${this.configService.get('MAIL_USER')}>`,
    });
  }

  async sendInvitationMail(email: string, inviteLink: string) {
    const html = await render(InviteUserEmail({ inviteLink }));

    await this.transporter.sendMail({
      to: email,
      subject: 'Your invitation to Barum',
      html,
      from: `"No Reply" <${this.configService.get('MAIL_USER')}>`,
    });
  }
}
