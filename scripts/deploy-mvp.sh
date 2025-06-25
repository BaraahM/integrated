#!/bin/bash

set -e

# Configuration
PROJECT_NAME="barum"
ENVIRONMENT="mvp"
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    print_status "All dependencies are available"
}

# Login to ECR
ecr_login() {
    print_status "Logging into Amazon ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
}

# Build and push API image
build_and_push_api() {
    print_status "Building and pushing API image..."
    
    local repo_name="$PROJECT_NAME-$ENVIRONMENT-api"
    local image_tag="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$repo_name:latest"
    
    # Build the image from root directory with build args
    docker build \
        --build-arg NODE_VERSION=21.5.0 \
        --build-arg BUILDER=node:21.5.0-alpine \
        -f packages/api/Dockerfile.api \
        -t $image_tag .
    
    # Push to ECR
    docker push $image_tag
    
    print_status "API image pushed successfully"
}

# Build and push web-next image
build_and_push_web_next() {
    print_status "Building and pushing web-next image..."
    
    local repo_name="$PROJECT_NAME-$ENVIRONMENT-web-next"
    local image_tag="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$repo_name:latest"
    
    # Check if Dockerfile exists in web-next directory
    if [ -f "packages/web-next/Dockerfile" ]; then
        docker build -f packages/web-next/Dockerfile -t $image_tag packages/web-next/
    else
        print_error "Dockerfile not found in packages/web-next/"
        print_status "Creating basic Dockerfile for Next.js..."
        
        # Create a basic Dockerfile if it doesn't exist
        cat > packages/web-next/Dockerfile << 'DOCKEREOF'
# Use Node.js 18 alpine image
FROM node:21.5.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
DOCKEREOF
        
        # Build with the new Dockerfile
        docker build -f packages/web-next/Dockerfile -t $image_tag packages/web-next/
    fi
    
    # Push to ECR
    docker push $image_tag
    
    print_status "Web-next image pushed successfully"
}

# Deploy to EC2 instance
deploy_to_ec2() {
    print_status "Deploying to EC2 instance..."
    
    # Get EC2 instance IP directly from AWS CLI
    local instance_ip=$(aws ec2 describe-instances \
        --region $AWS_REGION \
        --filters "Name=tag:Name,Values=$PROJECT_NAME-$ENVIRONMENT-instance" "Name=instance-state-name,Values=running" \
        --query "Reservations[*].Instances[*].PublicIpAddress" \
        --output text)
    
    if [ -z "$instance_ip" ]; then
        print_error "Could not get EC2 instance IP. Make sure Terraform has been applied."
        exit 1
    fi
    
    print_status "Deploying to instance: $instance_ip"
    
    # SSH to EC2 and trigger deployment
    ssh -i ~/.ssh/barum-mvp-key.pem -o StrictHostKeyChecking=no ec2-user@$instance_ip << EOF
        set -e
        
        # Navigate to application directory
        cd /opt/barum
        
        # Login to ECR
        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
        
        # Run the deployment script that was created during EC2 setup
        sudo ./deploy.sh
        
        # Check if services are running
        sleep 30
        sudo docker-compose ps
        
        # Check service health
        curl -f http://localhost/health || echo "Health check failed"
EOF
    
    print_status "Deployment completed!"
    print_status "Your application should be available at: https://app.barum.ai"
}

# Main deployment function
main() {
    print_status "Starting MVP deployment for $PROJECT_NAME"
    
    check_dependencies
    ecr_login
    build_and_push_api
    build_and_push_web_next
    deploy_to_ec2
    
    print_status "MVP deployment completed successfully!"
    print_warning "Don't forget to:"
    print_warning "1. Update your DNS settings if using a custom domain"
    print_warning "2. Configure SSL certificates"
    print_warning "3. Set up monitoring and alerting"
    print_warning "4. Configure your environment variables properly"
}

# Run main function
main "$@" 