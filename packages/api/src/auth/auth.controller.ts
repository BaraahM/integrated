import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Public()
  @Get('callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    const { accessToken, refreshToken } = this.authService.generateTokens({
      userId: req.user.id,
    });

    // Set cookies or send tokens in response
    this.authService.setRefreshTokenCookie(req.res, refreshToken);

    // Get the WEB_CLIENT_URL from environment variables
    const webClientUrl = this.configService.get<string>('WEB_CLIENT_URL');

    // Redirect to frontend with tokens as query parameters
    res.redirect(`${webClientUrl}/auth-callback?accessToken=${accessToken}`);
  }
}

interface SupabaseWebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      // Assuming names might be here
      first_name?: string;
      last_name?: string;
      // other meta data
    };
    // Include other fields from auth.users if needed
  };
  // Add other Supabase webhook fields if necessary
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // This endpoint is called by Supabase, secure with a secret in production
  @Post('supabase-webhook')
  @HttpCode(HttpStatus.OK) // Respond with 200 OK even if user already exists or minor issues
  async handleSupabaseWebhook(@Body() payload: SupabaseWebhookPayload) {
    console.log('Supabase webhook received:', JSON.stringify(payload, null, 2));

    // Ensure it's an INSERT on auth.users
    if (
      payload.type === 'INSERT' &&
      payload.table === 'users' &&
      payload.record
    ) {
      try {
        const userRecord = payload.record;
        const createdUser = await this.authService.handleSupabaseUserSignup({
          id: userRecord.id,
          email: userRecord.email,
          firstname: userRecord.raw_user_meta_data?.first_name,
          lastname: userRecord.raw_user_meta_data?.last_name,
        });
        console.log('User processed from Supabase webhook:', createdUser.id);
        return { message: 'Webhook processed successfully' };
      } catch (error) {
        console.error(
          'Error processing Supabase webhook:',
          error.message,
          error.stack,
        );
        // Still return 200 to Supabase to prevent retries for non-critical errors,
        // but log the error for investigation.
        // For critical errors (e.g., DB down), you might return a 5xx.
        return { message: 'Error processing webhook, check logs.' };
      }
    } else {
      console.log(
        'Webhook received, but not a relevant auth.users insert event.',
      );
      // Not the event we're interested in, so just acknowledge
      return { message: 'Webhook acknowledged, event not processed.' };
    }
  }
}
