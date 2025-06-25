# Development Tools Guide

This guide covers the essential development tools, utilities, and workflows for the Barum project.

## 📋 Quick Reference

### Essential Tools Checklist
- [x] **Node.js** (v21.5.0 via nvm)
- [x] **Yarn** (v3.x package manager) 
- [x] **Docker** (for local development)
- [x] **Cursor AI** (with project rules)
- [x] **Git** (with conventional commits)

## 🚀 Node.js Version Management (nvm)

### Installing nvm
```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Or via Homebrew (macOS)
brew install nvm

# Windows users: Use nvm-windows
# Download from: https://github.com/coreybutler/nvm-windows
```

### Using nvm with Barum

The project includes a `.nvmrc` file specifying Node.js **v21.5.0**.

```bash
# Install and use the correct Node.js version
nvm install          # Reads .nvmrc and installs v21.5.0
nvm use              # Switches to v21.5.0

# Verify version
node --version       # Should output: v21.5.0

# Auto-switch on directory change (optional)
echo 'nvm use' >> ~/.zshrc        # For zsh
echo 'nvm use' >> ~/.bash_profile # For bash
```

### nvm Best Practices
```bash
# Always use project's Node version
cd barum-app && nvm use

# Install global packages per Node version
npm install -g yarn@3.7.0

# Check current version
nvm current

# List installed versions
nvm list
```

## 🤖 Cursor AI Integration

### Cursor Rules Location
The project includes AI coding rules in `.cursor/rules/` to help with:
- Code generation following project patterns
- Architecture decisions and best practices
- Component structure and naming conventions
- API design patterns

### Available Rules
```bash
# View available cursor rules
ls .cursor/rules/

# Rules categories:
# - always_applied_workspace_rules: Project-wide coding standards
# - user_rules: User-specific preferences and patterns
```

### Using Cursor AI Effectively

1. **Follow Project Patterns**:
   ```typescript
   // Cursor will suggest components following this pattern
   interface ComponentProps {
     // Props definition
   }
   
   const Component: React.FC<ComponentProps> = ({ }) => {
     // Component logic
   };
   ```

2. **API Development**:
   ```typescript
   // Cursor knows to use NestJS + GraphQL patterns
   @Resolver(() => EntityName)
   export class EntityResolver {
     // Resolver methods
   }
   ```

3. **Database Operations**:
   ```typescript
   // Cursor suggests Prisma patterns
   const entity = await this.prisma.entityName.findUnique({
     where: { id },
     include: { /* relations */ }
   });
   ```

### Cursor Commands
- **Cmd/Ctrl + K**: Generate code with AI
- **Cmd/Ctrl + L**: Chat with AI about code
- **Cmd/Ctrl + I**: Inline AI editing
- **@rules**: Reference project rules in AI chat

## 🏃‍♂️ Serving & Running the Project

### Development Servers

#### Quick Start (All Services)
```bash
# Start active services (recommended)
yarn start
# Runs: API (4000) + Web-Next (3000)

# Legacy: Start deprecated services  
yarn start-legacy
# Runs: API (4000) + Client (5173) + Website (3033)

# All services (for compatibility testing)
yarn start-all
# Runs: API (4000) + Web-Next (3000) + Client (5173) + Website (3033)
```

#### Individual Services
```bash
# API server (NestJS + GraphQL)
yarn api
# → http://localhost:4000
# → GraphQL Playground: http://localhost:4000/graphql

# Client (React + Vite) - DEPRECATED
yarn client  
# → http://localhost:5173

# Web-Next (Next.js) - ACTIVE
yarn web-next
# → http://localhost:3000

# Website (Next.js Marketing) - DEPRECATED  
yarn website
# → http://localhost:3033
```

### Service Details

| Service | Status | Port | Framework | Purpose |
|---------|--------|------|-----------|---------|
| **API** | ✅ Active | 4000 | NestJS + GraphQL | Backend API |
| **Web-Next** | ✅ Active | 3000 | Next.js | Main frontend app |
| **Client** | ⚠️ Deprecated | 5173 | React + Vite | Legacy frontend |
| **Website** | ⚠️ Deprecated | 3033 | Next.js | Legacy marketing |

### Service Health Checks
```bash
# Check API health
curl http://localhost:4000/health

# Check GraphQL schema
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'

# Check Next.js app
curl http://localhost:3000
```

## 🗄️ Database Management

### Prisma Operations
```bash
# Generate Prisma client
yarn workspace api prisma generate

# View database in browser
yarn workspace api prisma studio
# → http://localhost:5555

# Apply pending migrations
yarn workspace api migrate:dev

# Reset database (destructive)
yarn workspace api migrate:reset

# Seed database with sample data
yarn workspace api seed
```

### Quick Database Reset
```bash
# Complete database reset and reseed
yarn init-db
# Equivalent to: migrate:dev && seed
```

> **⚠️ Important Seeding Note**: The database seeding with demo accounts (`admin@example.com`, `author@example.com`) will only work if you manually add these user credentials to Supabase Auth in your project dashboard.
> 
> **Recommended Approach for Authentication Testing**:
> 1. Start development servers: `yarn start`
> 2. Signup in the landing page
> 3. Create a new account through the web-next application
> 4. This automatically handles Supabase Auth integration without manual setup

## 📧 Email Development

### Email Template Development
```bash
# Start email development server
yarn email:dev
# → http://localhost:3001

# View email templates in browser
# Templates location: packages/api/src/mail/email_templates/
```

### Email Testing
- Templates are automatically reloaded
- Preview emails in browser before sending
- Test with real SMTP credentials in development

## 🧹 Code Quality Tools

### Linting
```bash
# Lint all packages
yarn lint

# Lint specific packages
yarn lint-api      # NestJS backend
yarn lint-client   # React client (deprecated)
yarn lint-website  # Website (deprecated)

# Auto-fix linting issues
yarn workspace api lint --fix
```

### Formatting
```bash
# Format all code
yarn format

# Format specific packages
yarn prettier-api
yarn prettier-client
```

### Testing
```bash
# Run all tests
yarn test

# API unit tests
yarn workspace api test

# API E2E tests
yarn e2e-test-api

# Client tests (deprecated)
yarn workspace client test
```

## 🔧 Package Management

### Yarn Workspaces
```bash
# Add dependency to specific package
yarn workspace api add package-name
yarn workspace @barum/web-next add package-name

# Add dev dependency
yarn workspace api add -D package-name

# Remove dependency
yarn workspace api remove package-name

# Update dependencies
yarn upgrade-interactive
```

### Clean & Reinstall
```bash
# Clean all node_modules
yarn clean

# Clean and reinstall everything
yarn reinstall

# Reset specific package
cd packages/api && rm -rf node_modules && yarn install
```

## 📝 Commit Guidelines

### Conventional Commits
```bash
# Commit message format
<type>[optional scope]: <description>

# Examples
feat(auth): add OAuth2 authentication support
fix(api): resolve database connection timeout  
docs: update setup instructions
```

### Commit Validation
```