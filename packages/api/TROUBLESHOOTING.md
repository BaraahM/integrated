# API Troubleshooting Guide

This guide covers common issues and their solutions when working with the Barum API.

## 🔥 Critical Issues & Fixes

### Role Not Found Error

**Issue**: `RoleNotFoundError` thrown during user creation from Supabase authentication.

**Root Cause**: Mismatch between role definitions and database seeding:

- Role enum defined `admin` and `standard`
- Database seeding created `admin` and `author` roles
- OAuth user creation looked for non-existent `user` role

**Symptoms**:

```
RoleNotFoundError: role_not_found
Error auto-creating user from Supabase: Role not found
```

**Solution**:

1. **Updated Role Enum** (`src/auth/enums/role.ts`):

   ```typescript
   export enum Role {
     Admin = 'admin',
     Author = 'author', // Changed from 'standard'
   }
   ```

2. **Fixed OAuth User Creation** (`src/user/user.service.ts`):

   ```typescript
   // Changed from looking for 'user' role to 'author' role
   const defaultRole = await this.prisma.role.findFirst({
     where: { name: 'author' },
   });
   ```

3. **Added Proper Error Handling**:
   - Created `GraphQLApiErrorRoleNotFound`
   - Added error handling in resolvers and services
   - Improved error logging for debugging

**Prevention**: Always ensure role definitions match between:

- Enum definitions (`src/auth/enums/role.ts`)
- Database seeding (`prisma/seed.ts`)
- User creation logic

## 🛠️ Common Issues

### Database Connection Issues

**Issue**: Cannot connect to Supabase database.

**Symptoms**:

```
Error: P1001: Can't reach database server
Connection refused
```

**Solutions**:

1. **Check Environment Variables**:

   ```bash
   # Verify these are set correctly in .env
   DATABASE_URL="postgresql://postgres:password@project-ref.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:password@project-ref.supabase.co:5432/postgres"
   ```

2. **Verify Supabase Project Status**:

   - Check if project is paused in Supabase dashboard
   - Ensure project is in the correct region
   - Verify database password is correct

3. **Test Connection**:
   ```bash
   npx prisma db pull
   ```

### Authentication Token Issues

**Issue**: JWT validation fails or users get unauthorized errors.

**Symptoms**:

```
JsonWebTokenError: invalid signature
TokenExpiredError: jwt expired
```

**Solutions**:

1. **Verify JWT Secret**:

   ```bash
   # In Supabase Dashboard: Settings > API > JWT Settings
   SUPABASE_JWT_SECRET="your-jwt-secret-from-dashboard"
   ```

2. **Check Token Format**:

   - Ensure Bearer token is properly formatted
   - Verify token is not expired
   - Check if user exists in database

3. **Debug Token Payload**:
   ```typescript
   // Temporary debug logging in JWT strategy
   console.log('JWT payload:', JSON.stringify(payload, null, 2));
   ```

### Migration Issues

**Issue**: Prisma migrations fail or schema is out of sync.

**Symptoms**:

```
Error: P3006: Migration `20240830162643_ad` failed to apply
The table `main.User` does not exist
```

**Solutions**:

1. **Reset Database**:

   ```bash
   npx prisma migrate reset
   npx prisma db seed
   ```

2. **Force Migration**:

   ```bash
   npx prisma migrate resolve --applied "migration-name"
   npx prisma migrate deploy
   ```

3. **Check Schema Sync**:
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

### Seeding Issues

**Issue**: Database seeding fails or creates incomplete data.

**Symptoms**:

```
Error in seed: Role not found
PrismaClientKnownRequestError: Unique constraint failed
```

**Solutions**:

1. **Check Role Dependencies**:

   ```bash
   # Ensure roles are created before users
   # Verify ROLES and PERMISSIONS constants in seed.ts
   ```

2. **Clear and Reseed**:

   ```bash
   npx prisma db push --force-reset
   npx prisma db seed
   ```

3. **Verify Seed Order**:
   - Roles and permissions first
   - Accounts second
   - Users third
   - Related data last

## 🔍 Debugging Strategies

### Enable Debug Logging

1. **Prisma Query Logging**:

   ```typescript
   // In prisma service
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   });
   ```

2. **GraphQL Debug Mode**:

   ```typescript
   // In app.module.ts
   GraphQLModule.forRoot({
     debug: true,
     playground: true,
     introspection: true,
   }),
   ```

3. **Environment Debug**:
   ```bash
   DEBUG=* yarn start:dev
   ```

### Common Debug Commands

```bash
# Check database schema
npx prisma studio

# Validate schema
npx prisma validate

# Check migration status
npx prisma migrate status

# Generate fresh client
npx prisma generate

# Test database connection
npx prisma db pull

# View current database
npx prisma db seed --preview-feature
```

### Error Log Analysis

**Look for these patterns in logs**:

1. **Database Errors**:

   - `P1001`: Connection refused
   - `P2002`: Unique constraint violation
   - `P2025`: Record not found

2. **Authentication Errors**:

   - `JsonWebTokenError`: Invalid JWT
   - `TokenExpiredError`: Expired token
   - `UnauthorizedError`: Missing permissions

3. **Application Errors**:
   - `RoleNotFoundError`: Missing role in database
   - `UserNotFoundError`: User not in database
   - `UserEmailAlreadyUsedError`: Duplicate email

## 🎯 Performance Issues

### Slow Queries

**Issue**: GraphQL queries are slow or timing out.

**Solutions**:

1. **Check Query Includes**:

   ```typescript
   // Avoid deep nesting
   include: {
     role: { include: { permissions: true } },
     account: true, // Don't include everything
   }
   ```

2. **Use Select Instead of Include**:

   ```typescript
   select: {
     id: true,
     email: true,
     role: { select: { name: true } }
   }
   ```

3. **Add Database Indexes**:
   ```prisma
   model User {
     id String @id
     email String @unique
     supabaseId String? @unique
     @@index([email])
     @@index([supabaseId])
   }
   ```

### Memory Issues

**Issue**: Application runs out of memory or has memory leaks.

**Solutions**:

1. **Check Connection Pooling**:

   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5"
   ```

2. **Monitor Memory Usage**:

   ```bash
   # Monitor Node.js memory
   node --inspect yarn start:dev
   ```

3. **Optimize Includes**:
   - Use pagination for large datasets
   - Limit deep object includes
   - Use select for specific fields only

## 🚨 Emergency Procedures

### Complete Database Reset

```bash
# 1. Reset migrations
npx prisma migrate reset --force

# 2. Push fresh schema
npx prisma db push

# 3. Reseed database
npx prisma db seed

# 4. Regenerate client
npx prisma generate
```

### Fix Corrupted Auth State

```bash
# 1. Clear all user sessions in Supabase Dashboard
# 2. Reset JWT secret if needed
# 3. Clear application caches
yarn clean && yarn install

# 4. Restart services
yarn start
```

### Recovery from Migration Failure

```bash
# 1. Check migration status
npx prisma migrate status

# 2. Mark failed migration as applied (if safe)
npx prisma migrate resolve --applied "migration_name"

# 3. Or rollback to previous state
npx prisma migrate reset

# 4. Reapply migrations
npx prisma migrate deploy
```

## 📞 Getting Additional Help

### Information to Collect

When reporting issues, include:

1. **Environment Details**:

   - Node.js version: `node --version`
   - Yarn version: `yarn --version`
   - OS: `uname -a` (Linux/Mac) or `ver` (Windows)

2. **Error Details**:

   - Full error message and stack trace
   - Steps to reproduce
   - Expected vs actual behavior

3. **Configuration**:

   - Relevant environment variables (redacted)
   - Package versions: `yarn list`
   - Database schema state

4. **Logs**:
   - API server logs
   - Browser console errors (for client issues)
   - Supabase logs if relevant

### Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [GraphQL Documentation](https://graphql.org/learn/)

### Debug Commands Quick Reference

| Command                     | Purpose                 |
| --------------------------- | ----------------------- |
| `npx prisma studio`         | Visual database browser |
| `npx prisma migrate status` | Check migration state   |
| `npx prisma db seed`        | Reseed database         |
| `npx prisma validate`       | Validate schema         |
| `npx prisma generate`       | Regenerate client       |
| `DEBUG=* yarn start:dev`    | Enable debug logging    |
| `yarn workspace api test`   | Run tests               |
| `yarn lint-api`             | Check code style        |

Remember: When in doubt, start with a clean slate using `npx prisma migrate reset` and `npx prisma db seed`.
