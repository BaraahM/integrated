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
TARGET_COMMIT=${1}

# Docker Compose configuration
COMPOSE_FILE="/opt/barum/docker-compose.yml"
APP_DIR="/opt/barum"

# Function to validate rollback target
validate_rollback_target() {
    print_status "Validating rollback target..."
    
    if [ -z "$TARGET_COMMIT" ]; then
        print_error "No target commit specified for rollback"
        print_error "Usage: $0 <commit_sha>"
        exit 1
    fi
    
    if [ "$TARGET_COMMIT" = "none" ] || [ "$TARGET_COMMIT" = "" ]; then
        print_error "No valid previous deployment found"
        exit 1
    fi
    
    local current_commit=$(cat /opt/barum/current-commit 2>/dev/null || echo "unknown")
    
    if [ "$TARGET_COMMIT" = "$current_commit" ]; then
        print_warning "Target commit is the same as current commit. No rollback needed."
        exit 0
    fi
    
    print_status "Rolling back from $current_commit to $TARGET_COMMIT"
}

# Function to backup current state before rollback
backup_before_rollback() {
    print_status "Creating backup before rollback..."
    
    local backup_dir="/opt/barum/rollback-backups/$(date +%Y%m%d_%H%M%S)_rollback_preparation"
    mkdir -p "$backup_dir"
    
    # Backup current state
    if [ -f "$COMPOSE_FILE" ]; then
        cp "$COMPOSE_FILE" "$backup_dir/"
    fi
    
    # Save current deployment info
    cp /opt/barum/deployment-info.json "$backup_dir/" 2>/dev/null || true
    cp /opt/barum/current-commit "$backup_dir/" 2>/dev/null || true
    
    # Export current container states
    docker-compose -f "$COMPOSE_FILE" config > "$backup_dir/docker-compose-pre-rollback.yml" 2>/dev/null || true
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" > "$backup_dir/containers-pre-rollback.txt" || true
    
    # Clean up old rollback backups (keep last 3)
    ls -dt /opt/barum/rollback-backups/* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true
    
    print_status "Pre-rollback backup completed at $backup_dir"
}

# Function to pull rollback images
pull_rollback_images() {
    print_status "Pulling Docker images for rollback to commit: $TARGET_COMMIT"
    
    # ECR login
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Pull API image for target commit
    local api_image="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$ENVIRONMENT-api"
    
    print_status "Pulling API image for commit: $TARGET_COMMIT"
    if docker pull "$api_image:$TARGET_COMMIT"; then
        docker tag "$api_image:$TARGET_COMMIT" "$api_image:rollback-target"
        print_status "API image pulled successfully"
    else
        print_error "Failed to pull API image for commit: $TARGET_COMMIT"
        print_error "The target commit may not exist in ECR"
        exit 1
    fi
    
    # Pull Web-Next image for target commit (optional)
    local web_image="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$ENVIRONMENT-web-next"
    
    print_status "Pulling Web-Next image for commit: $TARGET_COMMIT"
    if docker pull "$web_image:$TARGET_COMMIT" 2>/dev/null; then
        docker tag "$web_image:$TARGET_COMMIT" "$web_image:rollback-target"
        print_status "Web-Next image pulled successfully"
    else
        print_warning "Web-Next image not available for commit: $TARGET_COMMIT (this may be normal)"
    fi
}

# Function to stop current services
stop_current_services() {
    print_status "Stopping current services for rollback..."
    
    cd "$APP_DIR"
    
    # Gracefully stop services
    docker-compose -f "$COMPOSE_FILE" down --timeout 60 || true
    
    # Remove orphaned containers
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true
    
    print_status "Current services stopped"
}

# Function to deploy rollback version
deploy_rollback_version() {
    print_status "Deploying rollback version..."
    
    cd "$APP_DIR"
    
    # Set environment variables for rollback
    export COMMIT_SHA=$TARGET_COMMIT
    export AWS_ACCOUNT_ID
    export PROJECT_NAME
    export ENVIRONMENT
    export AWS_REGION
    
    # Update docker-compose to use rollback images
    # Temporarily tag rollback images as latest for docker-compose
    local api_image="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$ENVIRONMENT-api"
    local web_image="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$ENVIRONMENT-web-next"
    
    docker tag "$api_image:rollback-target" "$api_image:latest" || {
        print_error "Failed to tag API rollback image"
        exit 1
    }
    
    docker tag "$web_image:rollback-target" "$web_image:latest" 2>/dev/null || print_warning "Web-Next rollback image not available"
    
    # Start services with rollback version
    print_status "Starting services with rollback version..."
    docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans
    
    # Wait for services to be ready
    print_status "Waiting for rollback services to be ready..."
    sleep 20
    
    # Check if services are running
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        print_error "Rollback services failed to start"
        docker-compose -f "$COMPOSE_FILE" logs --tail=50
        exit 1
    fi
    
    print_status "Rollback services deployed successfully"
}

# Function to run health checks after rollback
rollback_health_check() {
    print_status "Running health checks for rollback..."
    
    local max_attempts=20
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Rollback health check attempt $attempt/$max_attempts"
        
        # Check API health
        if curl -f -s --max-time 10 http://localhost:4000/health >/dev/null 2>&1; then
            print_status "Rollback API health check passed"
            
            # Check web health if available
            if curl -f -s --max-time 10 http://localhost:3000 >/dev/null 2>&1; then
                print_status "Rollback Web health check passed"
            else
                print_warning "Rollback Web service not responding (this may be normal)"
            fi
            
            print_status "Rollback health checks passed"
            return 0
        fi
        
        print_warning "Rollback health check failed, retrying in 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "Rollback health checks failed after $max_attempts attempts"
    
    # Show container logs for debugging
    print_error "Rollback container logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=20
    
    return 1
}

# Function to update tracking after successful rollback
update_rollback_tracking() {
    print_status "Updating deployment tracking after rollback..."
    
    # Update deployment metadata
    cat > /opt/barum/deployment-info.json << EOF
{
    "commit_sha": "$TARGET_COMMIT",
    "deployment_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "deployment_type": "rollback",
    "environment": "$ENVIRONMENT",
    "project": "$PROJECT_NAME",
    "region": "$AWS_REGION"
}
EOF
    
    # Update current commit tracking
    echo "$TARGET_COMMIT" > /opt/barum/current-commit
    
    # Record rollback in history
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ): Rollback to $TARGET_COMMIT" >> /opt/barum/rollback-history.log
    
    print_status "Rollback tracking updated"
}

# Function to cleanup rollback artifacts
cleanup_rollback_artifacts() {
    print_status "Cleaning up rollback artifacts..."
    
    # Remove rollback-target tags
    local api_image="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$ENVIRONMENT-api"
    local web_image="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-$ENVIRONMENT-web-next"
    
    docker rmi "$api_image:rollback-target" 2>/dev/null || true
    docker rmi "$web_image:rollback-target" 2>/dev/null || true
    
    # Clean up Docker system
    docker system prune -f || true
    
    print_status "Rollback cleanup completed"
}

# Main rollback function
main() {
    print_status "Starting rollback process..."
    print_status "Target commit: $TARGET_COMMIT"
    print_status "Environment: $ENVIRONMENT"
    print_status "Project: $PROJECT_NAME"
    
    # Pre-rollback checks
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file not found at $COMPOSE_FILE"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed"
        exit 1
    fi
    
    # Execute rollback steps
    validate_rollback_target
    backup_before_rollback
    pull_rollback_images
    stop_current_services
    deploy_rollback_version
    
    # Health check for rollback
    if ! rollback_health_check; then
        print_error "Rollback failed health checks!"
        print_error "Manual intervention may be required"
        exit 1
    fi
    
    update_rollback_tracking
    cleanup_rollback_artifacts
    
    print_status "Rollback completed successfully!"
    print_status "Rolled back to commit: $TARGET_COMMIT"
    print_status "Time: $(date)"
    
    # Show running services
    print_status "Running services after rollback:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    print_warning "Rollback completed. Please verify application functionality."
}

# Execute main function
main "$@" 