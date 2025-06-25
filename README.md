# Barum - Full-Stack Application with Supabase Integration

A comprehensive full-stack application built with NestJS, Next.js, and Supabase, featuring authentication, database management, file storage, and a modern UI.

## 🏗️ Architecture Overview

This is a monorepo containing:

- **API** (`packages/api/`): ✅ **Active** - NestJS backend with GraphQL API, Prisma ORM, and Supabase integration
- **Web-Next** (`packages/web-next/`): ✅ **Active** - Next.js frontend application (main app)
- **UI** (`packages/ui/`): ✅ **Active** - Shared component library
- **Client** (`packages/client/`): ⚠️ **Deprecated** - Legacy React frontend with Vite
- **Website** (`packages/website/`): ⚠️ **Deprecated** - Legacy marketing/landing pages

> **Note**: `client` and `website` packages are deprecated. Use `web-next` for frontend development.

## 🚀 Quick Start

### Prerequisites

- **Node.js** v21.5.0 (managed via nvm - see [Development Tools](docs/DEVELOPMENT_TOOLS.md))
- **Yarn** v3.x
- **Docker & Docker Compose** (for local development)
- **Git**

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd barum-app

# Use correct Node.js version
nvm use  # Reads .nvmrc file

# Install dependencies
yarn install
```

### 2. Environment Setup

Copy and configure environment files:

```bash
# API environment
cp packages/api/.env.example packages/api/.env

# Web-Next environment  
cp packages/web-next/.env.example packages/web-next/.env
```

For detailed environment configuration, see [Environment Variables Guide](docs/ENVIRONMENT.md).

### 3. Supabase Setup

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com)
2. **Configure Environment Variables**: Update `packages/api/.env` with your Supabase credentials
3. **Set up Storage Buckets**: Create a `media` bucket in Supabase Dashboard

For complete setup instructions, see [Setup Guide](docs/SETUP.md).

### 4. Database Initialization

```bash
yarn init-db
```

This will run database migrations and seed the database with initial data including demo accounts.

> **⚠️ Important Seeding Note**: The database seeding with demo accounts will only work if you manually add the user credentials to Supabase Auth. 
> 
> **Alternative**: Instead of relying on seeded accounts, **sign up directly through the web-next app** at http://localhost:3000/signup after starting the development servers.

### 5. Start Development Servers

```bash
# Start active services (recommended)
yarn start
# Runs: API (4000) + Web-Next (3000)

# Legacy: Start all services (including deprecated)
yarn start-legacy
# Runs: API (4000) + Client (5173) + Website (3033)

# All services (for testing compatibility)
yarn start-all
# Runs: API (4000) + Web-Next (3000) + Client (5173) + Website (3033)
```

Individual services:

```bash
yarn api        # API server → http://localhost:4000
yarn web-next   # Next.js app → http://localhost:3000
```

## 📚 Documentation

For comprehensive documentation, see the [docs/](docs/) folder:

### 🛠️ Development
- **[Development Tools](docs/DEVELOPMENT_TOOLS.md)** - nvm, Cursor AI, serving, debugging tools
- **[Setup Guide](docs/SETUP.md)** - Complete development environment setup
- **[Environment Variables](docs/ENVIRONMENT.md)** - Complete environment configuration

### 🚀 Operations  
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment strategies
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Secrets Management](docs/SECRETS_MANAGEMENT.md)** - Secure credentials handling

### 📏 Standards
- **[Commit Guidelines](docs/COMMIT_GUIDELINES.md)** - Conventional commits specification

## 🔧 Development Workflow

### Available Scripts

| Command | Description | Status |
|---------|-------------|--------|
| `yarn start` | **Start active services** (API + Web-Next) | ✅ **Recommended** |
| `yarn start-legacy` | Start deprecated services (API + Client + Website) | ⚠️ Legacy |
| `yarn start-all` | Start all services (for compatibility testing) | 🔧 Testing |
| `yarn api` | Start API server only | ✅ Active |
| `yarn web-next` | Start Next.js app only | ✅ Active |
| `yarn client` | Start React client (deprecated) | ⚠️ Deprecated |
| `yarn website` | Start marketing website (deprecated) | ⚠️ Deprecated |
| `yarn init-db` | Initialize and seed database | ✅ Essential |
| `yarn lint` | Lint all packages | ✅ Quality |
| `yarn test` | Run all tests | ✅ Quality |

### Package Management

Always use yarn workspaces for dependency management:

```bash
# Add dependencies to active packages
yarn workspace api add package-name
yarn workspace @barum/web-next add package-name

# Don't add to deprecated packages
yarn workspace client add package-name      # ❌ Avoid
yarn workspace website add package-name     # ❌ Avoid
```

### Commit Guidelines

This project uses automated commit message linting following [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>[optional scope]: <description>
feat(auth): add OAuth2 authentication support
fix(api): resolve database connection timeout
docs: update setup instructions
```

Validation:
- Git hooks automatically validate commit messages
- Use `yarn commitlint:last` to manually check the last commit

## 🗄️ Database & Authentication

### Database Management

```bash
# View database in browser
yarn workspace api prisma studio

# Apply migrations
yarn workspace api migrate:dev

# Reset and reseed database
yarn init-db
```

### Default Accounts

The database is seeded with demo accounts:

- **Admin**: `admin@example.com` / `password123`
- **Author**: `author@example.com` / `password123`

> **⚠️ Important**: These seeded accounts will only work if you manually add their credentials to Supabase Auth in your project dashboard. 
> 
> **Recommended Approach**: 
> 1. Start the development servers: `yarn start`
> 2. Visit homepage and click on sign up
> 3. Create a new account through the web-next application
> 4. This will automatically handle the Supabase Auth integration

### Authentication Flow

1. **Supabase Auth**: Primary authentication via Supabase
2. **JWT Validation**: API validates Supabase JWT tokens  
3. **Role-Based Permissions**: Users assigned roles with specific permissions

## 🧪 Testing

```bash
# API unit tests
yarn workspace api test

# API E2E tests  
yarn e2e-test-api

# Deprecated client tests
yarn workspace client test  # ⚠️ Deprecated
```

## 🚀 Deployment

For deployment instructions, see [Deployment Guide](docs/DEPLOYMENT.md) which covers:

- **MVP Deployment**: Quick start deployment (~$45/month)
- **Growth Scale**: K3s cluster deployment (~$105/month)  
- **Enterprise Scale**: EKS deployment (~$412/month)

## 🔧 Project Structure

```
barum-app/
├── packages/
│   ├── api/              # ✅ NestJS backend with GraphQL
│   ├── web-next/         # ✅ Next.js frontend (main app)  
│   ├── ui/               # ✅ Shared component library
│   ├── client/           # ⚠️ Deprecated React frontend
│   └── website/          # ⚠️ Deprecated marketing website
├── docs/                 # 📚 Comprehensive documentation
├── aws/                  # 🏗️ Infrastructure as code (Terraform)
├── scripts/              # 🛠️ Deployment and utility scripts
└── .nvmrc               # 📌 Node.js version specification
```

## 🆘 Getting Help

If you encounter issues:

1. **Development Tools**: Check [Development Tools Guide](docs/DEVELOPMENT_TOOLS.md)
2. **Common Issues**: See [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
3. **Environment Issues**: Review [Environment Variables](docs/ENVIRONMENT.md)
4. **Setup Problems**: Follow [Setup Guide](docs/SETUP.md)
5. **GitLab Issues**: Create an issue with detailed information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Use the correct Node.js version: `nvm use`
5. Test your changes: `yarn lint && yarn test`
6. Commit using conventional commits: `git commit -m "feat: add amazing feature"`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Create a merge request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**📚 For comprehensive documentation, visit [docs/README.md](docs/README.md)**

**🛠️ For development tools and workflows, see [docs/DEVELOPMENT_TOOLS.md](docs/DEVELOPMENT_TOOLS.md)**
