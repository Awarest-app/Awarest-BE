// src/admin/admin-email.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('api/mail')
export class MailController {
  constructor(private readonly emailService: MailService) {}

  //  @UseGuards(JwtAuthGuard) // 어드민 인증 필수
  @Post('send')
  async sendAdminEmail(
    @Body('email') email: string,
    @Body('subject') subject: string,
    @Body('message') message: string,
  ) {
    try {
      await this.emailService.sendEmail(email, subject, message);
      return { success: true, message: `Email sent to ${email}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
