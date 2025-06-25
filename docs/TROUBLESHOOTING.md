# Troubleshooting Guide

This guide provides solutions to common issues you may encounter while developing or deploying Barum, consolidating troubleshooting information from all packages into one comprehensive resource.

## 🔥 Critical Issues

### Authentication & Database

#### Role Not Found Error
**Symptoms**: `RoleNotFoundError` during user creation from OAuth
```bash
RoleNotFoundError: role_not_found
Error auto-creating user from Supabase: Role not found
```

**Root Cause**: Mismatch between role definitions and database seeding
- Role enum defined `admin` and `standard`
- Database seeding created `admin` and `author` roles
- OAuth user creation looked for non-existent `user` role

**Solution**:
1. **Update Role Enum** (`packages/api/src/auth/enums/role.ts`):
   ```typescript
   export enum Role {
     Admin = 'admin',
     Author = 'author', // Changed from 'standard'
   }
   ```

2. **Fix OAuth User Creation** (`packages/api/src/user/user.service.ts`):
   ```typescript
   // Changed from looking for 'user' role to 'author' role
   const defaultRole = await this.prisma.role.findFirst({
     where: { name: 'author' },
   });
   ```

3. **Add Proper Error Handling**:
   - Created `GraphQLApiErrorRoleNotFound`
   - Added error handling in resolvers and services
   - Improved error logging for debugging

**Prevention**: Always ensure role definitions match between:
- Enum definitions (`src/auth/enums/role.ts`)
- Database seeding (`prisma/seed.ts`)
- User creation logic

## 🔧 Development Issues

### Database Connection Issues

#### Cannot Connect to Supabase
**Symptoms**:
```bash
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
   cd packages/api
   npx prisma db pull
   ```

#### Database Schema Out of Sync
**Symptoms**:
```bash
Error: P3006: Migration failed to apply
The table `main.User` does not exist
```

**Solutions**:
1. **Reset Database**:
   ```bash
   cd packages/api
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

### Authentication Token Issues

#### JWT Validation Fails
**Symptoms**:
```bash
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
   - Ensure Bearer token is properly formatted: `Authorization: Bearer <token>`
   - Verify token is not expired
   - Check if user exists in database

3. **Debug Token Payload**:
   ```typescript
   // Temporary debug logging in JWT strategy
   console.log('JWT payload:', JSON.stringify(payload, null, 2));
   ```

### Seeding Issues

#### Database Seeding Fails
**Symptoms**:
```bash
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
   cd packages/api
   npx prisma db push --force-reset
   npx prisma db seed
   ```

3. **Verify Seed Order**:
   - Roles and permissions first
   - Accounts second
   - Users third
   - Related data last

### Development Environment Issues

#### Port Conflicts
**Symptoms**:
```bash
Error: listen EADDRINUSE :::4000
Port 4000 is already in use
```

**Solutions**:
```bash
# Check what's running on ports
lsof -i :4000  # API
lsof -i :5173  # Client
lsof -i :3000  # Web-Next

# Kill processes if needed
kill -9 <PID>

# Or use different port in .env
PORT=4001
```

#### Environment Variables Not Loading  
**Symptoms**:
```bash
Error: DATABASE_URL is not defined
Config validation error
```

**Solutions**:
```bash
# Ensure .env files are in correct locations
ls packages/api/.env
ls packages/client/.env
ls packages/web-next/.env

# Check .env file syntax (no spaces around =)
DATABASE_URL="postgresql://..." # Correct
DATABASE_URL = "postgresql://..." # Incorrect

# Restart development servers after changing .env files
```

#### Module Resolution Errors
**Symptoms**:
```bash
Cannot find module '@/components/...'
Module not found: Can't resolve '../../../shared'
```

**Solutions**:
```bash
# Clear node_modules and reinstall
yarn clean
yarn install

# Or reset specific package
rm -rf packages/api/node_modules
yarn install

# Check tsconfig.json paths configuration
```

## 🚀 Deployment Issues

### Infrastructure Deployment

#### Terraform State Lock
**Symptoms**:
```bash
Error: Error acquiring the state lock
Lock Info:
  ID:        12345
  Path:      terraform-state/terraform.tfstate
```

**Solutions**:
```bash
# Force unlock (use with caution)
terraform force-unlock 12345

# Or wait for lock to expire (15 minutes)
# Check if another deployment is running
```

#### AWS Permissions Issues
**Symptoms**:
```bash
Error: AccessDenied: User is not authorized to perform: iam:CreateRole
Error: UnauthorizedOperation: You are not authorized to perform this operation
```

**Solutions**:
1. **Check IAM Policies**:
   ```bash
   # Verify user has required policies attached
   aws iam list-attached-user-policies --user-name barum-deploy
   ```

2. **Required Policies**:
   - `AmazonEC2FullAccess`
   - `AmazonS3FullAccess`
   - `AmazonECS_FullAccess`
   - `AmazonRoute53FullAccess`
   - `IAMFullAccess`

#### SSH Connection Fails
**Symptoms**:
```bash
Permission denied (publickey)
Connection closed by remote host
```

**Solutions**:
1. **Check SSH Key**:
   ```bash
   # Verify key is in SSH agent
   ssh-add -l
   ssh-add ~/.ssh/barum-mvp-key
   
   # Set correct permissions
   chmod 600 ~/.ssh/barum-mvp-key
   
   # Test connection
   ssh -i ~/.ssh/barum-mvp-key ec2-user@INSTANCE_IP
   ```

2. **Check Security Groups**:
   ```bash
   # Verify port 22 is open from your IP
   aws ec2 describe-security-groups --group-ids sg-12345
   ```

#### Docker Issues

#### ECR Login Fails
**Symptoms**:
```bash
Error response from daemon: unauthorized: authentication required
```

**Solutions**:
```bash
# Re-authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Check AWS credentials
aws sts get-caller-identity
```

#### Container Won't Start
**Symptoms**:
```bash
Container exited with code 1
Health check failed
```

**Solutions**:
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs -f

# Check resource usage
docker stats

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Debug container interactively
docker run -it --entrypoint /bin/bash barum-api:latest
```

#### Load Balancer Health Check Fails
**Symptoms**:
```bash
Target.FailedHealthChecks: Health checks failed
```

**Solutions**:
1. **Check Health Endpoint**:
   ```bash
   # Test health endpoint directly
   curl http://INSTANCE_IP:4000/health
   ```

2. **Verify Security Groups**:
   - Load balancer security group allows inbound 80/443
   - Instance security group allows inbound from load balancer
   - Health check path is correct (/health)

## 📱 Frontend Issues

### React Client Issues

#### API Connection Fails
**Symptoms**:
```bash
Network Error
CORS error
Failed to fetch
```

**Solutions**:
1. **Check Environment Variables**:
   ```bash
   # Verify API URL in .env
   VITE_API_URL="http://localhost:4000"
   
   # For production:
   VITE_API_URL="https://api.yourdomain.com"
   ```

2. **CORS Configuration**:
   ```typescript
   // In packages/api/src/main.ts
   app.enableCors({
     origin: ['http://localhost:5173', 'http://localhost:3000'],
     credentials: true,
   });
   ```

#### Build Fails
**Symptoms**:
```bash
Build failed with errors
Type error: Cannot find module
```

**Solutions**:
```bash
# Clear build cache
rm -rf packages/client/dist
rm -rf packages/client/node_modules/.vite

# Reinstall dependencies
cd packages/client
yarn install

# Check TypeScript configuration
yarn tsc --noEmit
```

### Next.js Issues

#### Hydration Errors
**Symptoms**:
```bash
Error: Hydration failed because the initial UI does not match
```

**Solutions**:
```bash
# Check for client-side only code in SSR
# Use dynamic imports for client-only components
const ClientOnlyComponent = dynamic(() => import('./ClientOnly'), {
  ssr: false
});
```

#### API Routes Not Working
**Symptoms**:
```bash
404 - This page could not be found
API resolve without sending a response
```

**Solutions**:
```bash
# Check file naming and location
# pages/api/hello.js or app/api/hello/route.js

# Verify export format
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' });
}
```

## 🔍 Debugging Strategies

### Enable Debug Logging

#### API Debug Logging
```typescript
// Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// GraphQL debug mode
GraphQLModule.forRoot({
  debug: true,
  introspection: true,
  playground: true,
});

// Custom debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { user, payload, context });
}
```

#### Client Debug Logging
```typescript
// Apollo Client logging
const client = new ApolloClient({
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
  },
});
```

### Performance Debugging

#### Database Query Performance
```bash
# Enable query timing
cd packages/api
npx prisma studio

# Check slow queries in Supabase dashboard
# Use EXPLAIN ANALYZE for complex queries
```

#### API Response Times
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:4000/graphql"

# curl-format.txt:
# time_namelookup:  %{time_namelookup}\n
# time_connect:     %{time_connect}\n
# time_appconnect:  %{time_appconnect}\n
# time_pretransfer: %{time_pretransfer}\n
# time_redirect:    %{time_redirect}\n
# time_starttransfer: %{time_starttransfer}\n
# time_total:       %{time_total}\n
```

### Memory and Resource Issues

#### Memory Leaks
```bash
# Monitor memory usage
# API
docker stats barum-api

# Client
# Use browser dev tools > Performance tab
```

#### High CPU Usage
```bash
# Check process usage
top -p $(pgrep -f "node")

# Profile API
node --prof packages/api/dist/main.js
```

## 🛠️ Useful Commands

### Development Commands
```bash
# Reset everything
yarn clean && yarn install && yarn init-db

# Check service health
curl http://localhost:4000/health
curl http://localhost:5173/
curl http://localhost:3000/

# View logs
docker-compose logs -f
yarn api 2>&1 | tee api.log

# Database commands
cd packages/api
npx prisma studio
npx prisma db pull
npx prisma generate
```

### Production Commands
```bash
# SSH to production server
ssh -i ~/.ssh/barum-mvp-key ec2-user@INSTANCE_IP

# Check container status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f

# Update containers
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Check system resources
htop
df -h
free -h
```

### AWS Commands
```bash
# Check infrastructure
terraform plan -var-file="../environments/mvp.tfvars"
terraform show

# ECR operations
aws ecr list-images --repository-name barum-api
aws ecr describe-repositories

# EC2 operations
aws ec2 describe-instances --instance-ids i-1234567890abcdef0
aws ec2 describe-security-groups --group-ids sg-12345
```

## 📊 Monitoring and Alerting

### Set Up Monitoring

#### CloudWatch Metrics
```bash
# Create custom metrics
aws cloudwatch put-metric-data \
  --namespace "Barum/Application" \
  --metric-data MetricName=UserLogins,Value=1,Unit=Count
```

#### Log Analysis
```bash
# Search CloudWatch logs
aws logs filter-log-events \
  --log-group-name "/aws/ec2/barum" \
  --filter-pattern "ERROR"
```

### Performance Benchmarking

#### Load Testing
```bash
# Install artillery
npm install -g artillery

# Basic load test
artillery quick --count 10 --num 5 http://localhost:4000/health

# GraphQL load test
artillery run graphql-load-test.yml
```

## 🆘 Getting Help

### Before Asking for Help

1. **Check Logs**: Always check relevant logs first
2. **Search Issues**: Search existing GitLab issues
3. **Minimal Reproduction**: Create minimal example that reproduces the issue
4. **Environment Info**: Gather system information

### Environment Information
```bash
# System info
node --version
yarn --version
docker --version
aws --version

# Package versions
cd packages/api && yarn list
cd packages/client && yarn list

# Git info
git status
git log --oneline -5
```

### Creating Bug Reports

Include in your bug report:
- **Environment**: OS, Node.js version, package versions
- **Steps to Reproduce**: Exact steps that cause the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Logs**: Relevant error messages and logs
- **Screenshots**: If applicable

### Common Solutions Checklist

Before reporting issues, try these common solutions:

- [ ] Clear and reinstall dependencies (`yarn clean && yarn install`)
- [ ] Restart development servers
- [ ] Check environment variables are set correctly
- [ ] Verify database is running and accessible
- [ ] Check for port conflicts
- [ ] Update to latest versions
- [ ] Check git status for uncommitted changes

---

**📞 Still Need Help?**

If you've tried the solutions above and still have issues:

1. **Search Documentation**: Check [setup guide](./SETUP.md) and [deployment guide](./DEPLOYMENT.md)
2. **GitLab Issues**: Create a detailed issue with all relevant information
3. **Team Chat**: Ask in your team communication channel
4. **Emergency**: For production issues, contact the on-call engineer

**🔧 Contributing to Troubleshooting**

Found a solution not documented here? Please:
1. Create a merge request to add it to this guide
2. Include the problem, solution, and prevention steps
3. Add it to the appropriate section