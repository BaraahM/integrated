# Environment Variables Guide

This guide provides comprehensive documentation for all environment variables used across the Barum project.

## 📋 Quick Reference

### API Environment (`packages/api/.env`)
```bash
# Database & Supabase
DATABASE_URL="postgresql://postgres:password@project-ref.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:password@project-ref.supabase.co:5432/postgres"
SUPABASE_URL="https://project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# Application Configuration
NODE_ENV="development"
PORT="4000"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"

# Authentication Secrets
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_RESET_PASSWORD_SECRET="your-reset-secret"
JWT_INVITE_USER_SECRET="your-invite-secret"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# Storage Configuration
MEDIA_STORAGE_PROVIDER="supabase"
SUPABASE_STORAGE_BUCKET="media"

# Payment Integration (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Client Environment (`packages/client/.env`)
```bash
VITE_API_URL="http://localhost:4000"
VITE_SUPABASE_URL="https://project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Optional
```

### Web-Next Environment (`packages/web-next/.env`)
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SUPABASE_URL="https://project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Optional
```

## 🔐 Required Variables by Category

### 1. Authentication & Security
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `JWT_ACCESS_SECRET` | ✅ | Secret for access tokens | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | ✅ | Secret for refresh tokens | `openssl rand -hex 32` |
| `JWT_RESET_PASSWORD_SECRET` | ✅ | Secret for password reset tokens | `openssl rand -hex 32` |
| `JWT_INVITE_USER_SECRET` | ✅ | Secret for user invite tokens | `openssl rand -hex 32` |
| `SUPABASE_JWT_SECRET` | ✅ | Supabase JWT verification secret | From Supabase dashboard |

### 2. Supabase Configuration
| Variable | Required | Description | Location in Supabase |
|----------|----------|-------------|---------------------|
| `SUPABASE_URL` | ✅ | Project URL | Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | ✅ | Public anon key | Settings → API → Project API keys |
| `SUPABASE_SERVICE_KEY` | ✅ | Service role key | Settings → API → Project API keys |
| `SUPABASE_STORAGE_BUCKET` | ✅ | Storage bucket name | Usually `media` |

### 3. Database Connection
| Variable | Required | Description | Format |
|----------|----------|-------------|--------|
| `DATABASE_URL` | ✅ | Pooled connection | `postgresql://postgres:pass@host:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | ✅ | Direct connection | `postgresql://postgres:pass@host:5432/postgres` |

### 4. Application Configuration
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Environment mode | `development` |
| `PORT` | ❌ | API server port | `4000` |
| `CORS_ORIGIN` | ✅ | Allowed CORS origins | `http://localhost:5173,http://localhost:3000` |

### 5. Email Configuration (Optional)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SMTP_HOST` | ❌ | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ | SMTP server port | `587` |
| `SMTP_USER` | ❌ | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | ❌ | SMTP password | App-specific password |
| `EMAIL_FROM` | ❌ | From address | `noreply@yourdomain.com` |

### 6. Payment Integration (Optional)
| Variable | Required | Description | Environment |
|----------|----------|-------------|-------------|
| `STRIPE_SECRET_KEY` | ❌ | Stripe secret key | `sk_test_...` (test), `sk_live_...` (prod) |
| `STRIPE_WEBHOOK_SECRET` | ❌ | Webhook endpoint secret | `whsec_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ❌ | Client-side Stripe key | `pk_test_...` (test), `pk_live_...` (prod) |

## 🌍 Environment-Specific Configuration

### Development Environment
```bash
# API
NODE_ENV="development"
PORT="4000"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"

# Client
VITE_API_URL="http://localhost:4000"

# Web-Next
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Production Environment
```bash
# API
NODE_ENV="production"
PORT="4000"
CORS_ORIGIN="https://yourdomain.com,https://app.yourdomain.com"

# Client
VITE_API_URL="https://api.yourdomain.com"

# Web-Next
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

## 🔧 Setup Instructions

### 1. Generate Secrets
```bash
# Generate JWT secrets
echo "JWT_ACCESS_SECRET=$(openssl rand -hex 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)"
echo "JWT_RESET_PASSWORD_SECRET=$(openssl rand -hex 32)"
echo "JWT_INVITE_USER_SECRET=$(openssl rand -hex 32)"
```

### 2. Get Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the required keys and URLs

### 3. Configure Database URLs
```bash
# From Supabase Dashboard → Settings → Database
# Connection Pooling (recommended for production)
DATABASE_URL="postgresql://postgres:password@project-ref.pooler.supabase.co:6543/postgres?pgbouncer=true"

# Direct Connection (required for migrations)
DIRECT_URL="postgresql://postgres:password@project-ref.supabase.co:5432/postgres"
```

### 4. Copy and Configure
```bash
# Copy templates
cp packages/api/.env.example packages/api/.env
cp packages/client/.env.example packages/client/.env
cp packages/web-next/.env.example packages/web-next/.env

# Edit with your actual values
```

## 🛡️ Security Best Practices

### 1. Secret Management
- **Never commit** `.env` files to version control
- Use **long, random strings** for JWT secrets (minimum 32 characters)
- **Rotate secrets** regularly in production
- Use **environment-specific** credentials

### 2. Production Deployment
- Store secrets in **AWS Secrets Manager** or **GitLab CI/CD Variables**
- Use **masked** and **protected** variables in CI/CD
- Implement **least privilege** access for service accounts

### 3. Development vs Production
- Use **different Supabase projects** for dev/staging/prod
- Use **test Stripe keys** in development
- Use **development-specific** SMTP settings

## 🔍 Troubleshooting

### Common Issues

#### Environment Variables Not Loading
```bash
# Check file locations
ls packages/api/.env
ls packages/client/.env
ls packages/web-next/.env

# Check syntax (no spaces around =)
DATABASE_URL="postgresql://..." # ✅ Correct
DATABASE_URL = "postgresql://..." # ❌ Incorrect
```

#### Supabase Connection Fails
```bash
# Test connection
cd packages/api
npx prisma db pull

# Common issues:
# - Wrong project URL
# - Incorrect database password
# - Project is paused
# - Wrong region
```

#### JWT Validation Errors
```bash
# Verify JWT secret matches Supabase dashboard
# Settings → API → JWT Settings → JWT Secret
SUPABASE_JWT_SECRET="your-jwt-secret-from-dashboard"
```

### Validation Commands
```bash
# Test API health
curl http://localhost:4000/health

# Test database connection
cd packages/api && npx prisma studio

# Test authentication
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

## 📚 Environment Templates

### Complete API .env Template
```bash
# =============================================================================
# DATABASE & SUPABASE CONFIGURATION
# =============================================================================
DATABASE_URL="postgresql://postgres:your-password@your-project.pooler.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:your-password@your-project.supabase.co:5432/postgres"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_JWT_SECRET="your-jwt-secret-from-supabase"

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV="development"
PORT="4000"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"

# =============================================================================
# AUTHENTICATION SECRETS
# =============================================================================
JWT_ACCESS_SECRET="your-32-char-access-secret"
JWT_REFRESH_SECRET="your-32-char-refresh-secret"
JWT_RESET_PASSWORD_SECRET="your-32-char-reset-secret"
JWT_INVITE_USER_SECRET="your-32-char-invite-secret"

# =============================================================================
# STORAGE CONFIGURATION
# =============================================================================
MEDIA_STORAGE_PROVIDER="supabase"
SUPABASE_STORAGE_BUCKET="media"

# =============================================================================
# EMAIL CONFIGURATION (Optional)
# =============================================================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# =============================================================================
# PAYMENT INTEGRATION (Optional)
# =============================================================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 🔗 Related Documentation

- **[Setup Guide](./SETUP.md)** - Complete development environment setup
- **[Deployment Guide](./DEPLOYMENT.md)** - Production environment variables
- **[Secrets Management](./SECRETS_MANAGEMENT.md)** - Secure secrets handling
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common environment issues

---

**⚠️ Important**: Always use `.env.example` files as templates and never commit actual `.env` files with real credentials! 