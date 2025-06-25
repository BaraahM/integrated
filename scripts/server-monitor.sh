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
COMPOSE_FILE="/opt/barum/docker-compose.yml"
APP_DIR="/opt/barum"

# Health check endpoints
API_HEALTH_ENDPOINT="http://localhost:4000/health"
WEB_HEALTH_ENDPOINT="http://localhost:3000"
EXTERNAL_API_ENDPOINT="http://localhost/api/health"
EXTERNAL_WEB_ENDPOINT="http://localhost"

# Function to check Docker services
check_docker_services() {
    print_status "Checking Docker services..."
    
    cd "$APP_DIR"
    
    # Check if docker-compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file not found at $COMPOSE_FILE"
        return 1
    fi
    
    # Check if services are running
    local running_services=$(docker-compose -f "$COMPOSE_FILE" ps --services --filter "status=running" | wc -l)
    local total_services=$(docker-compose -f "$COMPOSE_FILE" ps --services | wc -l)
    
    if [ "$running_services" -eq 0 ]; then
        print_error "No services are running"
        return 1
    elif [ "$running_services" -lt "$total_services" ]; then
        print_warning "$running_services/$total_services services are running"
        docker-compose -f "$COMPOSE_FILE" ps
    else
        print_status "All $total_services services are running"
    fi
    
    return 0
}

# Function to check API health
check_api_health() {
    print_status "Checking API health..."
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time 10 "$API_HEALTH_ENDPOINT" >/dev/null 2>&1; then
            print_status "API health check passed (attempt $attempt)"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "API health check failed after $max_attempts attempts"
            return 1
        fi
        
        print_warning "API health check failed, retrying in 5 seconds... (attempt $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
}

# Function to check web health
check_web_health() {
    print_status "Checking Web health..."
    
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time 10 "$WEB_HEALTH_ENDPOINT" >/dev/null 2>&1; then
            print_status "Web health check passed (attempt $attempt)"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_warning "Web health check failed after $max_attempts attempts (this may be normal if web service is not deployed)"
            return 0  # Don't fail monitoring for web service
        fi
        
        print_warning "Web health check failed, retrying in 3 seconds... (attempt $attempt/$max_attempts)"
        sleep 3
        attempt=$((attempt + 1))
    done
}

# Function to check external endpoints (through proxy/load balancer)
check_external_endpoints() {
    print_status "Checking external endpoints..."
    
    # Check external API endpoint
    if curl -f -s --max-time 15 "$EXTERNAL_API_ENDPOINT" >/dev/null 2>&1; then
        print_status "External API endpoint is accessible"
    else
        print_warning "External API endpoint is not accessible (may be normal during deployment)"
    fi
    
    # Check external web endpoint
    if curl -f -s --max-time 15 "$EXTERNAL_WEB_ENDPOINT" >/dev/null 2>&1; then
        print_status "External web endpoint is accessible"
    else
        print_warning "External web endpoint is not accessible (may be normal during deployment)"
    fi
}

# Function to check system resources
check_system_resources() {
    print_status "Checking system resources..."
    
    # Check disk usage
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        print_warning "High disk usage: ${disk_usage}%"
    else
        print_status "Disk usage: ${disk_usage}%"
    fi
    
    # Check memory usage
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$memory_usage" -gt 90 ]; then
        print_warning "High memory usage: ${memory_usage}%"
    else
        print_status "Memory usage: ${memory_usage}%"
    fi
    
    # Check load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    print_status "Load average: $load_avg"
}

# Function to check Docker resource usage
check_docker_resources() {
    print_status "Checking Docker resource usage..."
    
    # Check Docker disk usage
    local docker_disk=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}" | grep -E "(Images|Containers|Local Volumes)" | awk '{total+=$3} END {print total}' 2>/dev/null || echo "0")
    print_status "Docker disk usage: ${docker_disk}"
    
    # Check running containers resource usage
    if command -v docker stats >/dev/null 2>&1; then
        print_status "Container resource usage:"
        timeout 5 docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || print_warning "Could not get container stats"
    fi
}

# Function to check application logs for errors
check_application_logs() {
    print_status "Checking application logs for recent errors..."
    
    cd "$APP_DIR"
    
    # Check for recent errors in logs (last 100 lines)
    local error_count=$(docker-compose -f "$COMPOSE_FILE" logs --tail=100 2>/dev/null | grep -i "error\|exception\|failed" | wc -l)
    
    if [ "$error_count" -gt 0 ]; then
        print_warning "Found $error_count recent error entries in logs"
        if [ "$error_count" -gt 10 ]; then
            print_warning "High number of errors detected. Recent errors:"
            docker-compose -f "$COMPOSE_FILE" logs --tail=20 | grep -i "error\|exception\|failed" | tail -5
        fi
    else
        print_status "No recent errors found in logs"
    fi
}

# Function to generate monitoring report
generate_monitoring_report() {
    print_status "Generating monitoring report..."
    
    local report_file="/opt/barum/monitoring-report.json"
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    cat > "$report_file" << EOF
{
    "timestamp": "$timestamp",
    "environment": "$ENVIRONMENT",
    "project": "$PROJECT_NAME",
    "monitoring_status": "completed",
    "checks": {
        "docker_services": "$docker_services_status",
        "api_health": "$api_health_status", 
        "web_health": "$web_health_status",
        "external_endpoints": "$external_endpoints_status",
        "system_resources": "$system_resources_status"
    },
    "deployment_info": $(cat /opt/barum/deployment-info.json 2>/dev/null || echo '{}')
}
EOF
    
    print_status "Monitoring report saved to $report_file"
}

# Main monitoring function
main() {
    print_status "Starting application monitoring..."
    print_status "Environment: $ENVIRONMENT"
    print_status "Project: $PROJECT_NAME"
    print_status "Timestamp: $(date)"
    
    local overall_status=0
    
    # Initialize status variables
    docker_services_status="unknown"
    api_health_status="unknown"
    web_health_status="unknown"
    external_endpoints_status="unknown"
    system_resources_status="unknown"
    
    # Run monitoring checks
    if check_docker_services; then
        docker_services_status="healthy"
    else
        docker_services_status="unhealthy"
        overall_status=1
    fi
    
    if check_api_health; then
        api_health_status="healthy"
    else
        api_health_status="unhealthy"
        overall_status=1
    fi
    
    if check_web_health; then
        web_health_status="healthy"
    else
        web_health_status="warning"
        # Don't fail overall status for web health
    fi
    
    check_external_endpoints
    external_endpoints_status="checked"
    
    check_system_resources
    system_resources_status="checked"
    
    check_docker_resources
    check_application_logs
    
    # Generate monitoring report
    generate_monitoring_report
    
    # Summary
    print_status "Monitoring completed"
    if [ $overall_status -eq 0 ]; then
        print_status "All critical checks passed"
    else
        print_error "Some critical checks failed"
    fi
    
    print_status "Summary:"
    print_status "  Docker Services: $docker_services_status"
    print_status "  API Health: $api_health_status"
    print_status "  Web Health: $web_health_status"
    print_status "  System Resources: $system_resources_status"
    
    return $overall_status
}

# Execute main function
main "$@" 