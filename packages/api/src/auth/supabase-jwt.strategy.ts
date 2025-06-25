import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from './auth.service';
import { GraphQLApiErrorUserNotFound } from '../errors/graphql/UserNotFoundGraphQLApiError';
import { GraphQLApiErrorRoleNotFound } from '../errors/graphql/RoleNotFoundGraphQLApiError';
import { RoleNotFoundError } from '../errors/RoleNotFoundError';

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(
  Strategy,
  'supabase-jwt',
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7);
        }
        return null;
      },
      secretOrKey: process.env.SUPABASE_JWT_SECRET || 'your-jwt-secret',
      jsonWebTokenOptions: {
        ignoreExpiration: false,
      },
    });
  }

  async validate(payload: any) {
    console.log('Supabase JWT payload:', JSON.stringify(payload, null, 2));

    // The payload contains the user's Supabase ID in payload.sub
    let user = await this.prisma.user.findFirst({
      where: { supabaseId: payload.sub },
      include: {
        role: { include: { permissions: true } },
        account: true,
      },
    });

    if (!user) {
      // Try to find user by email for migration purposes
      const existingUserByEmail = await this.prisma.user.findFirst({
        where: { email: payload.email },
        include: {
          role: { include: { permissions: true } },
          account: true,
        },
      });

      if (existingUserByEmail && !existingUserByEmail.supabaseId) {
        console.log('Updating existing user with supabaseId:', payload.sub);
        // Update existing user with supabaseId
        user = await this.prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: { supabaseId: payload.sub },
          include: {
            role: { include: { permissions: true } },
            account: true,
          },
        });
      } else if (!existingUserByEmail) {
        console.log('Auto-creating new user from Supabase:', payload.email);

        // Debug: Check what roles exist
        const availableRoles = await this.prisma.role.findMany();
        console.log(
          'Available roles in database:',
          availableRoles.map((r) => r.name),
        );

        // Auto-create user from Supabase data
        try {
          const createdUser = await this.authService.handleSupabaseUserSignup({
            id: payload.sub,
            email: payload.email,
            firstname:
              payload.user_metadata?.first_name ||
              payload.user_metadata?.full_name?.split(' ')[0] ||
              '',
            lastname:
              payload.user_metadata?.last_name ||
              payload.user_metadata?.full_name?.split(' ')[1] ||
              '',
          });

          // Fetch the user with proper includes
          user = await this.prisma.user.findFirst({
            where: { supabaseId: payload.sub },
            include: {
              role: { include: { permissions: true } },
              account: true,
            },
          });

          if (!user) {
            console.error('Failed to fetch created user from database');
            throw new GraphQLApiErrorUserNotFound();
          }

          console.log('Successfully created user:', user?.email);
        } catch (error) {
          console.error('Error auto-creating user from Supabase:', error);
          console.error('Error details:', error.message, error.stack);

          // Handle specific errors appropriately
          if (error instanceof RoleNotFoundError) {
            console.error(
              'Role not found - check if database has been seeded properly',
            );
            throw new GraphQLApiErrorRoleNotFound();
          }

          throw new GraphQLApiErrorUserNotFound();
        }
      } else {
        console.log('User exists with different supabaseId - conflict');
        // User exists but has different supabaseId - this is a conflict
        throw new GraphQLApiErrorUserNotFound();
      }
    } else {
      console.log('Found existing user with supabaseId:', user.email);
    }

    return user;
  }
}
