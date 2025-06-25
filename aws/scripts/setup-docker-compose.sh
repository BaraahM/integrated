#!/bin/bash
# Automated setup script for Barum MVP deployment on EC2
# Installs Docker, Docker Compose, AWS CLI, and sets up monitoring

set -euo pipefail

# Variables from Terraform template
PROJECT_NAME="${project_name}"
ENVIRONMENT="${environment}"
AWS_REGION="${aws_region}"
ECR_REGISTRY="${ecr_registry}"
SECRET_ARN="${secret_arn}"

# Logging
LOG_FILE="/var/log/barum-setup.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

echo "Starting Barum MVP setup on $(date)"
echo "Project: $PROJECT_NAME"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"

# Update system
echo "Updating system packages..."
yum update -y

# Install Docker
echo "Installing Docker..."
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -a -G docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="2.23.0"
curl -L "https://github.com/docker/compose/releases/download/v$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install AWS CLI v2
echo "Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
yum install -y unzip
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Install additional utilities
echo "Installing additional utilities..."
yum install -y htop jq git curl wget

# Create application directory
echo "Creating application directory..."
mkdir -p /opt/barum
cd /opt/barum

# Create Docker Compose file
echo "Creating Docker Compose configuration..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  api:
    image: ${ECR_REGISTRY}/barum-mvp-api:latest
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "awslogs"
      options:
        awslogs-group: "/aws/ec2/barum-mvp"
        awslogs-region: "${AWS_REGION}"
        awslogs-stream: "api"

  web-next:
    image: ${ECR_REGISTRY}/barum-mvp-web-next:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "awslogs"
      options:
        awslogs-group: "/aws/ec2/barum-mvp"
        awslogs-region: "${AWS_REGION}"
        awslogs-stream: "web-next"

  # nginx reverse proxy for health checks
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
      - web-next
    restart: unless-stopped
    logging:
      driver: "awslogs"
      options:
        awslogs-group: "/aws/ec2/barum-mvp"
        awslogs-region: "${AWS_REGION}"
        awslogs-stream: "nginx"
EOF

# Create nginx configuration
echo "Creating nginx configuration..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:4000;
    }
    
    upstream web {
        server web-next:3000;
    }
    
    server {
        listen 80;
        
        # Health check endpoint
        location /health {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
        
        # API routes
        location /api {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Web routes
        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Create environment file template
echo "Creating environment file template..."
cat > .env.template << 'EOF'
# Database
DATABASE_URL=

# JWT
JWT_SECRET=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Frontend Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=

# AWS
AWS_REGION=${AWS_REGION}
AWS_DEFAULT_REGION=${AWS_REGION}
EOF

# Create secrets retrieval script
echo "Creating secrets retrieval script..."
cat > fetch-secrets.sh << EOF
#!/bin/bash
set -e

echo "Fetching secrets from AWS Secrets Manager..."
SECRET_VALUE=\$(aws secretsmanager get-secret-value \\
  --secret-id "$SECRET_ARN" \\
  --region "$AWS_REGION" \\
  --query SecretString --output text)

# Parse JSON and create .env file
echo "\$SECRET_VALUE" | jq -r 'to_entries[] | "\(.key)=\(.value)"' > .env

# Add AWS region
echo "AWS_REGION=$AWS_REGION" >> .env
echo "AWS_DEFAULT_REGION=$AWS_REGION" >> .env

echo "Environment file created successfully"
chmod 600 .env
EOF

chmod +x fetch-secrets.sh

# Create deployment script
echo "Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting deployment at $(date)"

# Login to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Fetch latest secrets
echo "Fetching application secrets..."
./fetch-secrets.sh

# Pull latest images
echo "Pulling latest images..."
docker-compose pull

# Stop current containers
echo "Stopping current containers..."
docker-compose down

# Start new containers
echo "Starting new containers..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 30

# Check service health
echo "Checking service health..."
./monitor.sh

echo "Deployment completed at $(date)"
EOF

chmod +x deploy.sh

# Create monitoring script
echo "Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash

echo "=== Barum MVP Health Check ==="
echo "Date: $(date)"
echo ""

# Check container status
echo "Docker containers:"
docker-compose ps

echo ""

# Check application health
echo "Service health checks:"

# Check nginx health
echo -n "Nginx: "
if curl -sf http://localhost:80/health > /dev/null; then
    echo "✓ Healthy"
else
    echo "✗ Unhealthy"
fi

# Check API health
echo -n "API: "
if curl -sf http://localhost:4000/health > /dev/null; then
    echo "✓ Healthy"
else
    echo "✗ Unhealthy"
fi

# Check Web Next health
echo -n "Web Next: "
if curl -sf http://localhost:3000/health > /dev/null; then
    echo "✓ Healthy"
else
    echo "✗ Unhealthy"
fi

echo ""

# Check disk usage
echo "Disk usage:"
df -h /

echo ""

# Check memory usage
echo "Memory usage:"
free -h

echo ""

# Check recent logs
echo "Recent application logs (last 10 lines):"
docker-compose logs --tail=10
EOF

chmod +x monitor.sh

# Create log rotation configuration
echo "Setting up log rotation..."
cat > /etc/logrotate.d/barum << 'EOF'
/var/log/barum-*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

# Set up automatic deployment on boot
echo "Setting up system services..."
cat > /etc/systemd/system/barum-app.service << 'EOF'
[Unit]
Description=Barum Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/barum
ExecStart=/opt/barum/deploy.sh
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable barum-app.service

# Set up monitoring cron job
echo "Setting up monitoring cron job..."
cat > /etc/cron.d/barum-monitor << 'EOF'
# Monitor Barum application every 5 minutes
*/5 * * * * root /opt/barum/monitor.sh >> /var/log/barum-monitor.log 2>&1
EOF

# Set up CloudWatch agent configuration
echo "Setting up CloudWatch monitoring..."
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/barum-*.log",
                        "log_group_name": "/aws/ec2/barum-mvp",
                        "log_stream_name": "{instance_id}/application"
                    },
                    {
                        "file_path": "/var/log/messages",
                        "log_group_name": "/aws/ec2/barum-mvp",
                        "log_stream_name": "{instance_id}/system"
                    }
                ]
            }
        }
    },
    "metrics": {
        "namespace": "Barum/MVP",
        "metrics_collected": {
            "cpu": {
                "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
                "metrics_collection_interval": 60
            },
            "disk": {
                "measurement": ["used_percent"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
            },
            "mem": {
                "measurement": ["mem_used_percent"],
                "metrics_collection_interval": 60
            }
        }
    }
}
EOF

# Install and start CloudWatch agent
yum install -y amazon-cloudwatch-agent
systemctl enable amazon-cloudwatch-agent
systemctl start amazon-cloudwatch-agent

# Set proper permissions
chown -R ec2-user:ec2-user /opt/barum
chmod -R 755 /opt/barum

# Create initial status file
echo "Setup completed at $(date)" > /opt/barum/setup-status.txt

echo "Barum MVP setup completed successfully!"
echo "Application directory: /opt/barum"
echo "Log file: $LOG_FILE"
echo ""
echo "Next steps:"
echo "1. Verify Docker is running: systemctl status docker"
echo "2. Check application status: cd /opt/barum && ./monitor.sh"
echo "3. Deploy application: cd /opt/barum && sudo ./deploy.sh"
echo ""
echo "Setup completed at $(date)" 