# Barum Documentation

Welcome to the Barum project documentation. This directory contains comprehensive guides for setting up, developing, and deploying the Barum application.

## 📋 Quick Start Guide

For new developers, follow this sequence:

1. **[Development Tools](./DEVELOPMENT_TOOLS.md)** - Set up nvm, Cursor AI, and essential tools
2. **[Setup Guide](./SETUP.md)** - Complete development environment setup
3. **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions  
4. **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions

## 📚 Complete Documentation Index

### 🛠️ Development & Tools
- **[Development Tools](./DEVELOPMENT_TOOLS.md)** - nvm, Cursor AI, serving, debugging, and development workflows
- **[Setup Guide](./SETUP.md)** - Environment setup, Supabase configuration, OAuth setup, and initial configuration
- **[Environment Variables](./ENVIRONMENT.md)** - Comprehensive environment configuration for all packages

### 🚀 Operations & Deployment
- **[Deployment Guide](./DEPLOYMENT.md)** - Progressive deployment strategy from MVP to enterprise scale
- **[Secrets Management](./SECRETS_MANAGEMENT.md)** - Secure handling of credentials and environment secrets

### 🔧 Standards & Guidelines
- **[Commit Guidelines](./COMMIT_GUIDELINES.md)** - Conventional commits specification and validation

### 🆘 Support & Troubleshooting
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Comprehensive troubleshooting for all packages and common issues

## 🏗️ Project Architecture

### Active Packages ✅

| Package | Location | Purpose | Status |
|---------|----------|---------|--------|
| **API** | `packages/api/` | NestJS backend with GraphQL API | ✅ **Active** |
| **Web-Next** | `packages/web-next/` | Next.js frontend application | ✅ **Active** |
| **UI** | `packages/ui/` | Shared component library | ✅ **Active** |

### Deprecated Packages ⚠️

| Package | Location | Purpose | Status |
|---------|----------|---------|--------|
| **Client** | `packages/client/` | Legacy React frontend with Vite | ⚠️ **Deprecated** |
| **Website** | `packages/website/` | Legacy marketing/landing pages | ⚠️ **Deprecated** |

> **Migration Note**: All frontend development should use `web-next` package. The `client` and `website` packages are maintained for legacy support only and will be removed in future versions.

## 🔄 Development Workflow

### Recommended Commands

```bash
# Essential daily commands
nvm use                    # Use correct Node.js version (v21.5.0)
yarn start                 # Start active services (API + Web-Next)
yarn init-db              # Reset and seed database
yarn lint && yarn test    # Quality checks before committing

# Individual services
yarn api                  # Start API server only
yarn web-next            # Start Next.js app only

# Avoid deprecated services
yarn client              # ❌ Deprecated - use web-next instead
yarn website             # ❌ Deprecated - use web-next instead
```

### Package Management

```bash
# Add dependencies to active packages ✅
yarn workspace api add package-name
yarn workspace @barum/web-next add package-name
yarn workspace @barum/ui add package-name

# Avoid adding to deprecated packages ⚠️
yarn workspace client add package-name      # ❌ Don't use
yarn workspace website add package-name     # ❌ Don't use
```

## 📁 Documentation Categories

### By Development Phase

#### 🚀 **Getting Started**
1. [Development Tools](./DEVELOPMENT_TOOLS.md) - Tool setup and workflows
2. [Setup Guide](./SETUP.md) - Complete environment setup
3. [Environment Variables](./ENVIRONMENT.md) - Configuration guide

#### 🔨 **Development**
1. [Development Tools](./DEVELOPMENT_TOOLS.md) - Daily development workflows
2. [Commit Guidelines](./COMMIT_GUIDELINES.md) - Code contribution standards

#### 🚢 **Deployment**
1. [Deployment Guide](./DEPLOYMENT.md) - Production deployment
2. [Secrets Management](./SECRETS_MANAGEMENT.md) - Secure configuration

#### 🆘 **Troubleshooting**
1. [Troubleshooting Guide](./TROUBLESHOOTING.md) - Issue resolution

### By Component

#### 🖥️ **Frontend (Active)**
- **Web-Next**: Next.js application - see [Development Tools](./DEVELOPMENT_TOOLS.md#serving--running-the-project)
- **UI Library**: Component library - see [Setup Guide](./SETUP.md)

#### 🖥️ **Frontend (Deprecated)**
- **Client**: React + Vite - ⚠️ Use web-next instead
- **Website**: Marketing pages - ⚠️ Use web-next instead

#### ⚙️ **Backend**
- **API**: NestJS + GraphQL - see [Setup Guide](./SETUP.md#api-setup)
- **Database**: Prisma + Supabase - see [Development Tools](./DEVELOPMENT_TOOLS.md#database-management)

#### 🏗️ **Infrastructure**
- **AWS**: Terraform configuration - see [Deployment Guide](./DEPLOYMENT.md)
- **Docker**: Container configuration - see [Development Tools](./DEVELOPMENT_TOOLS.md#docker-development)

## 🎯 Quick Reference

### Daily Development Checklist

```bash
✅ nvm use                     # Correct Node.js version
✅ yarn start                 # Start active services
✅ yarn init-db               # Fresh database (if needed)
✅ yarn lint && yarn test     # Quality checks
✅ Cursor AI rules active     # AI assistance
```

## Essential URLs & Commands

### Service URLs
- **API GraphQL Playground**: http://localhost:4000/graphql
- **Web-Next App** (Active): http://localhost:3000
- **Client App** (Deprecated): http://localhost:5173
- **Website** (Deprecated): http://localhost:3033

### Quick Commands
```bash
# Recommended development workflow
nvm use && yarn start        # Use Node v21.5.0 + start active services

# Database management  
yarn init-db                 # Initialize and seed database
yarn workspace api migrate:reset  # Reset database completely

# Quality checks
yarn lint && yarn test       # Run linting and tests across packages

# Individual services
yarn api                     # Start API only
yarn web-next               # Start Next.js app only
```

### Essential Environment Files

| Package | File | Status |
|---------|------|--------|
| **API** | `packages/api/.env` | ✅ Required |
| **Web-Next** | `packages/web-next/.env` | ✅ Required |
| **Client** | `packages/client/.env` | ⚠️ Deprecated |
| **Website** | `packages/website/.env` | ⚠️ Deprecated |

## 📚 Documentation Standards

### Consolidation Mapping

This documentation consolidates information from multiple sources:

| Topic | Consolidated From | Status |
|-------|------------------|--------|
| **Development Tools** | Various setup files, nvm guides | ✅ New comprehensive guide |
| **Setup Process** | Root README, package READMEs | ✅ Unified in SETUP.md |
| **Deployment** | AWS guides, deployment plans | ✅ Unified in DEPLOYMENT.md |
| **Environment Config** | Scattered .env docs | ✅ Unified in ENVIRONMENT.md |
| **Troubleshooting** | Package-specific guides | ✅ Unified in TROUBLESHOOTING.md |
| **OAuth Setup** | Duplicate guides | ✅ Consolidated in SETUP.md |

### Archive Location

Deprecated documentation has been moved to:
- `docs/archive/` - Legacy documentation files
- Maintained for reference during transition period
- Will be removed after migration to active packages is complete

---

**🔗 Navigation:**
- **← [Project Root](../README.md)** - Main project overview
- **→ [Development Tools](./DEVELOPMENT_TOOLS.md)** - Start your development journey
- **→ [Setup Guide](./SETUP.md)** - Complete environment setup

**💡 Pro Tips:**
- Always use `nvm use` before development
- Focus on `web-next` for frontend development
- Use Cursor AI rules for consistent code generation
- Keep documentation updated when making architectural changes 