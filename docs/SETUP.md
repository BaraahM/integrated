# Complete Setup Guide

This guide provides step-by-step instructions for setting up the Barum development environment, consolidating all setup requirements into one comprehensive resource.

## 📋 Prerequisites

### Required Software
- **Node.js** (LTS version, v18+ recommended) - `node --version`
- **Yarn** (v3.x) - Package manager - `yarn --version`
- **Docker & Docker Compose** - For local development - `docker --version`
- **Git** - Version control - `git --version`
- **AWS CLI** (for deployment) - `aws --version` *(optional for development)*
- **Terraform** (for infrastructure) - `terraform --version` *(optional for development)*

### Account Setup
- **GitLab** account for CI/CD *(optional for development)*
- **Supabase** account for database and auth
- **AWS** account for deployment *(optional for development)*
- **Google Cloud Console** account for OAuth *(optional)*

## 🚀 Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone <repository-url>
cd barum-app
yarn install
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp packages/api/.env.example packages/api/.env
cp packages/client/.env.example packages/client/.env
cp packages/web-next/.env.example packages/web-next/.env
```

### 3. Start Development
```bash
# Start all services
yarn start

# Services will be available at:
# API server: http://localhost:4000
# React app: http://localhost:5173  
# Next.js app: http://localhost:3000
```

> **Note**: For a complete setup with database and authentication, continue with the detailed setup below.

## 🔧 Detailed Setup

### 1. Repository Setup

```bash
# Clone repository
git clone <repository-url>
cd barum-app

# Install dependencies (using workspace syntax)
yarn install

# Verify installation
yarn --version
node --version
docker --version
```

### 2. Supabase Project Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project:
   - **Name**: `barum-dev` (or your preferred name)
   - **Region**: Choose closest to your location
   - **Database Password**: Generate and save securely

#### Get Credentials
From Supabase Dashboard → Settings → API:
- **Project URL**: `https://your-project-ref.supabase.co`
- **Anon Key**: Public key for client-side
- **Service Role Key**: Secret key for server-side (keep secure!)
- **JWT Secret**: Found in Settings → API → JWT Settings

#### Configure Authentication Providers
1. Go to **Authentication** → **Providers**
2. Configure **Email** provider (enabled by default)
3. For **Google OAuth** (optional):
   - Enable Google provider
   - Follow Google OAuth Setup section below

#### Configure Storage Buckets
1. Go to **Storage** → Create bucket: `media`
2. Set bucket to **public**
3. Configure policies in SQL Editor:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload" ON storage.objects
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   -- Allow public viewing
   CREATE POLICY "Public can view" ON storage.objects
   FOR SELECT USING (bucket_id = 'media');
   
   -- Allow users to update their own files
   CREATE POLICY "Users can update own files" ON storage.objects
   FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Allow users to delete their own files
   CREATE POLICY "Users can delete own files" ON storage.objects
   FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
   ```

### 3. Environment Configuration

#### API Environment (`packages/api/.env`)
```bash
# Database & Supabase
DATABASE_URL="postgresql://postgres:your-password@your-project-ref.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:your-password@your-project-ref.supabase.co:5432/postgres"
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# Application Configuration
NODE_ENV="development"
PORT="4000"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"

# Authentication Secrets (generate with: openssl rand -hex 32)
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_RESET_PASSWORD_SECRET="your-reset-secret"
JWT_INVITE_USER_SECRET="your-invite-secret"

# Email Configuration (optional for development)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# Payment Integration (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Media Storage
MEDIA_STORAGE_PROVIDER="supabase"
SUPABASE_STORAGE_BUCKET="media"
```

#### Generate Secrets
```bash
# Generate secure secrets for JWT
echo "JWT_ACCESS_SECRET=$(openssl rand -hex 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)"
echo "JWT_RESET_PASSWORD_SECRET=$(openssl rand -hex 32)"
echo "JWT_INVITE_USER_SECRET=$(openssl rand -hex 32)"
```

#### Client Environment (`packages/client/.env`)
```bash
VITE_API_URL="http://localhost:4000"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Optional
```

#### Web-Next Environment (`packages/web-next/.env`)
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Optional
```

### 4. Database Setup

### Initialize Database
```bash
yarn init-db
```

This command will:
- Run Prisma migrations to set up database schema
- Seed the database with demo accounts and sample data

> **⚠️ Critical Seeding Note**: The database seeding creates demo accounts (`admin@example.com`, `author@example.com`) but these will **only work for login if you manually add these user credentials to Supabase Auth** in your project dashboard.

### Authentication Setup Options

**Option A: Use Web-Next Signup (Recommended)**
1. Start development servers: `yarn start`
2. Visit: http://localhost:3000/signup  
3. Create a new account through the web interface
4. This automatically handles Supabase Auth integration

**Option B: Manual Supabase Auth Setup**
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Manually create users with emails: `admin@example.com`, `author@example.com`
4. Set passwords to: `password123`

### 5. Start Development Servers

#### All Services (Recommended)
```bash
# Recommended: Start active services only
yarn start
# Runs: API (4000) + Web-Next (3000)

# Legacy: Start all services including deprecated
yarn start-legacy  
# Runs: API (4000) + Client (5173) + Website (3033)
```

Individual services:
```bash
yarn api        # Start API only → http://localhost:4000
yarn web-next   # Start Next.js app → http://localhost:3000
yarn client     # [DEPRECATED] → http://localhost:5173  
yarn website    # [DEPRECATED] → http://localhost:3033
```

### 6. Verify Setup

#### Test API
```bash
# Health check
curl http://localhost:4000/health

# GraphQL introspection
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

#### Test Authentication
1. Go to http://localhost:5173
2. Try signing in with test accounts:
   - `admin@example.com` / `password123`
   - `author@example.com` / `password123`

## 🔐 Google OAuth Setup (Optional)

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**

### 2. Configure OAuth Consent Screen
1. Go to **OAuth consent screen**
2. Select **External** user type
3. Fill required fields:
   - **App name**: Your application name
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if needed

### 3. Create OAuth Client ID
1. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
2. Select **Web application**
3. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   https://your-domain.com (for production)
   ```
4. Add **Authorized redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
5. Save **Client ID** and **Client Secret**

### 4. Configure Supabase Google Auth
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click configure
3. Enable the provider
4. Enter **Client ID** and **Client Secret** from Google Cloud Console
5. Save configuration

### 5. Update Frontend for OAuth
The OAuth login is already implemented in the client applications. Users can now click "Continue with Google" to authenticate.

## 🛠️ Development Workflow

### Package Management
Always use yarn workspaces for dependency management:

```bash
# Add dependencies to specific packages
yarn workspace api add package-name
yarn workspace client add package-name
yarn workspace web-next add package-name

# Add dev dependencies
yarn workspace api add -D package-name

# Don't navigate to package directories for installation
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `yarn start` | Start all services |
| `yarn api` | Start API server only |
| `yarn client` | Start React client only |
| `yarn web-next` | Start Next.js app only |
| `yarn init-db` | Initialize and seed database |
| `yarn lint-api` | Lint API code |
| `yarn lint-client` | Lint client code |
| `yarn prettier-api` | Format API code |
| `yarn prettier-client` | Format client code |
| `yarn e2e-test-api` | Run API E2E tests |
| `yarn clean` | Clean all node_modules |
| `yarn reinstall` | Clean and reinstall dependencies |

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit with conventional commits
git add .
git commit -m "feat(auth): add Google OAuth support"

# Push and create merge request
git push origin feature/your-feature-name
```

### Commit Guidelines
This project uses [Conventional Commits](https://www.conventionalcommits.org/):
- `feat`: New feature
- `fix`: Bug fix  
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🔍 Common Issues

### Environment Variables Not Loading
```bash
# Ensure .env files are in correct locations
ls packages/api/.env
ls packages/client/.env
ls packages/web-next/.env

# Restart development servers after changing .env files
```

### Database Connection Issues
```bash
# Test Supabase connection
cd packages/api
npx prisma db pull

# Check if Supabase project is active (not paused)
# Verify DATABASE_URL format in .env
```

### Port Conflicts
```bash
# Check what's running on ports
lsof -i :4000  # API
lsof -i :5173  # Client
lsof -i :3000  # Web-Next

# Kill processes if needed
kill -9 <PID>
```

### Dependencies Issues
```bash
# Clean and reinstall
yarn clean
yarn install

# Or reset specific package
rm -rf packages/api/node_modules
yarn install
```

## 🎯 Next Steps

After completing setup:

1. **Explore the Applications**:
   - API GraphQL Playground: http://localhost:4000/graphql
   - React Client: http://localhost:5173
   - Next.js App: http://localhost:3000

2. **Development**:
   - Review [project structure](../README.md#project-structure)
   - Check [development workflow](../README.md#development-workflow)
   - Read package-specific documentation

3. **Deployment**:
   - Follow [deployment guide](./DEPLOYMENT.md) when ready to deploy
   - Set up CI/CD with GitLab (optional)

4. **Troubleshooting**:
   - Check [troubleshooting guide](./TROUBLESHOOTING.md) for common issues
   - Review logs in terminal where services are running

---

**🎉 Congratulations! Your development environment is now set up!**

For questions or issues, check the [troubleshooting guide](./TROUBLESHOOTING.md) or create an issue in GitLab. 