#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
PROJECT_NAME="barum"
ENVIRONMENT="mvp"
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
COMMIT_SHA=${1:-"latest"}

# Docker Compose configuration
COMPOSE_FILE="/opt/barum/docker-compose.yml"
APP_DIR="/opt/barum"

# Function to cleanup Docker resources
cleanup_docker() {
    print_status "Cleaning up Docker resources..."
    
    # Remove unused images older than 24 hours
    docker image prune -af --filter "until=24h" || true
    
    # Remove unused volumes
    docker volume prune -f || true
    
    # Remove unused networks
    docker network prune -f || true
    
    print_status "Docker cleanup completed"
}

# Function to pull latest images
pull_images() {
    print_status "Pulling latest Docker images for commit: $COMMIT_SHA"
    
    # ECR login
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Pull API image
    local api_image="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$ENVIRONMENT-api"
    if [ "$COMMIT_SHA" != "latest" ]; then
        docker pull "$api_image:$COMMIT_SHA" || {
            print_warning "Failed to pull commit-specific API image, falling back to latest"
            docker pull "$api_image:latest"
        }
        docker tag "$api_image:$COMMIT_SHA" "$api_image:latest" 2>/dev/null || true
    else
        docker pull "$api_image:latest"
    fi
    
    # Pull Web-Next image (optional)
    local web_image="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$ENVIRONMENT-web-next"
    if [ "$COMMIT_SHA" != "latest" ]; then
        docker pull "$web_image:$COMMIT_SHA" 2>/dev/null || {
            print_warning "Failed to pull commit-specific Web-Next image, falling back to latest"
            docker pull "$web_image:latest" 2>/dev/null || print_warning "Web-Next image not available"
        }
        docker tag "$web_image:$COMMIT_SHA" "$web_image:latest" 2>/dev/null || true
    else
        docker pull "$web_image:latest" 2>/dev/null || print_warning "Web-Next image not available"
    fi
    
    print_status "Images pulled successfully"
}

# Function to backup current state
backup_current_state() {
    print_status "Backing up current deployment state..."
    
    # Create backup directory
    local backup_dir="/opt/barum/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup current docker-compose.yml
    if [ -f "$COMPOSE_FILE" ]; then
        cp "$COMPOSE_FILE" "$backup_dir/"
    fi
    
    # Export current container configurations
    docker-compose -f "$COMPOSE_FILE" config > "$backup_dir/docker-compose-current.yml" 2>/dev/null || true
    
    # Save running containers info
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" > "$backup_dir/running-containers.txt" || true
    
    # Clean up old backups (keep last 5)
    ls -dt /opt/barum/backups/* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true
    
    print_status "Backup completed at $backup_dir"
}

# Function to deploy services
deploy_services() {
    print_status "Deploying services..."
    
    cd "$APP_DIR"
    
    # Stop existing services gracefully
    print_status "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down --timeout 30 || true
    
    # Remove orphaned containers
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true
    
    # Start services with optimized settings
    print_status "Starting new services..."
    
    # Use environment variables for the deployment
    export COMMIT_SHA
    export AWS_ACCOUNT_ID
    export PROJECT_NAME
    export ENVIRONMENT
    export AWS_REGION
    
    # Start services with resource limits
    docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Check if services are running
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        print_error "Some services failed to start"
        docker-compose -f "$COMPOSE_FILE" logs --tail=50
        exit 1
    fi
    
    print_status "Services deployed successfully"
}

# Function to run health checks
health_check() {
    print_status "Running health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Health check attempt $attempt/$max_attempts"
        
        # Check API health
        if curl -f -s --max-time 10 http://localhost:4000/health >/dev/null 2>&1; then
            print_status "API health check passed"
            
            # Check web health if available
            if curl -f -s --max-time 10 http://localhost:3000 >/dev/null 2>&1; then
                print_status "Web health check passed"
            else
                print_warning "Web service not responding (this may be normal if not deployed)"
            fi
            
            print_status "All critical health checks passed"
            return 0
        fi
        
        print_warning "Health check failed, retrying in 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "Health checks failed after $max_attempts attempts"
    
    # Show container logs for debugging
    print_error "Container logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=20
    
    return 1
}

# Function to update deployment tracking
update_deployment_tracking() {
    print_status "Updating deployment tracking..."
    
    # Update deployment metadata
    cat > /opt/barum/deployment-info.json << EOF
{
    "commit_sha": "$COMMIT_SHA",
    "deployment_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "environment": "$ENVIRONMENT",
    "project": "$PROJECT_NAME",
    "region": "$AWS_REGION"
}
EOF
    
    # Update simple commit tracking for rollback
    echo "$COMMIT_SHA" > /opt/barum/current-commit
    
    print_status "Deployment tracking updated"
}

# Main deployment function
main() {
    print_status "Starting deployment for commit: $COMMIT_SHA"
    print_status "Environment: $ENVIRONMENT"
    print_status "Project: $PROJECT_NAME"
    
    # Pre-deployment checks
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file not found at $COMPOSE_FILE"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed"
        exit 1
    fi
    
    # Execute deployment steps
    backup_current_state
    cleanup_docker
    pull_images
    deploy_services
    
    # Health check with rollback on failure
    if ! health_check; then
        print_error "Deployment failed health checks!"
        print_warning "Consider running rollback if needed"
        exit 1
    fi
    
    update_deployment_tracking
    
    print_status "Deployment completed successfully!"
    print_status "Commit: $COMMIT_SHA"
    print_status "Time: $(date)"
    
    # Show running services
    print_status "Running services:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Execute main function
main "$@" 