# Deployment Guide

This guide covers the complete deployment strategy for Barum, from MVP to production scale, consolidating all deployment documentation into one comprehensive resource.

## 🚀 Deployment Overview

Barum uses a **progressive scaling strategy** that grows with your business needs and budget:

### 📊 Deployment Phases

| Phase | Target | Monthly Cost | Architecture | When to Use |
|-------|---------|--------------|--------------|-------------|
| **MVP** | Validation | ~$45 | Single EC2 + Docker Compose | 0-1K users, <$1K MRR |
| **Growth** | Scale | ~$105 | K3s Cluster (2 nodes) | 1-10K users, $1-10K MRR |
| **Enterprise** | Production | ~$412 | EKS + RDS + Multi-AZ | 10K+ users, $10K+ MRR |

### 🔄 Migration Criteria

**MVP → Growth Triggers:**
- Monthly Recurring Revenue: >$1,000
- Active Users: >1,000
- Daily Requests: >10,000
- Team Size: >2 developers
- Need for auto-scaling and zero-downtime deployments

**Growth → Enterprise Triggers:**
- Monthly Recurring Revenue: >$10,000
- Active Users: >10,000
- Daily Requests: >100,000
- Team Size: >5 developers
- Compliance requirements (SOC2, HIPAA)
- Need for 99.9% uptime SLA

## 🎯 Phase 1: MVP Deployment (Recommended Start)

**Best for**: Initial launch, validation, small teams
**Infrastructure**: Single EC2 instance with Docker Compose
**Estimated Cost**: $44.58/month

### Quick MVP Deployment

#### Prerequisites (30 minutes)
```bash
# 1. AWS Account Setup
aws iam create-user --user-name barum-deploy
aws iam attach-user-policy --user-name barum-deploy --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
aws iam attach-user-policy --user-name barum-deploy --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam create-access-key --user-name barum-deploy

# 2. SSH Key Creation
ssh-keygen -t rsa -b 4096 -f ~/.ssh/barum-mvp-key
aws ec2 import-key-pair --key-name barum-mvp-key --public-key-material fileb://~/.ssh/barum-mvp-key.pub --region us-east-1

# 3. Domain Setup (optional)
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)
```

#### Infrastructure Deployment (15 minutes)
```bash
# 1. Configure environment
cd aws/environments
cp mvp.tfvars.example mvp.tfvars

# Edit mvp.tfvars with your values:
# domain_name = "yourdomain.com"
# route53_zone_id = "Z1234567890ABC"
# ssh_public_key = "ssh-rsa AAAAB3N..."

# 2. Deploy infrastructure
cd ../infrastructure-mvp
terraform init
terraform plan -var-file="../environments/mvp.tfvars"
terraform apply -var-file="../environments/mvp.tfvars"

# Note the outputs: instance_public_ip, load_balancer_dns_name
```

#### Application Deployment (10 minutes)
```bash
# 1. Set GitLab CI/CD variables (see Environment Variables section)
# 2. Push to main branch or manually trigger deploy_mvp job
# 3. Access your application at https://yourdomain.com
```

**Total Deployment Time**: ~1 hour

### MVP Infrastructure Components
- **EC2 t3.small**: Application server with Docker Compose
- **Application Load Balancer**: SSL termination and health checks
- **Route 53**: DNS management
- **ECR**: Container registry
- **CloudWatch**: Basic logging and monitoring
- **Secrets Manager**: Environment variable storage

### MVP Cost Breakdown
| Service | Monthly Cost | Purpose |
|---------|--------------|---------|
| EC2 t3.small | $15.33 | Application server |
| Application Load Balancer | $16.20 | SSL + health checks |
| Route 53 | $0.50 | DNS management |
| S3 Storage (50GB) | $1.15 | Static assets |
| CloudWatch | $2.50 | Basic logging |
| Secrets Manager | $0.40 | Environment variables |
| CloudFront (100GB) | $8.50 | CDN (optional) |
| **Total** | **$44.58/month** | **$535/year** |

## 🔄 Phase 2: Growth Scale (K3s Cluster)

**When to migrate**: $1K+ MRR, 1K+ users, team of 3+
**Infrastructure**: K3s Kubernetes cluster (2 nodes)
**Estimated Cost**: $104.86/month

### Growth Migration Strategy
```bash
# 1. Create K3s infrastructure (parallel to MVP)
cd aws/infrastructure-k3s
terraform init
terraform apply -var-file="../environments/growth.tfvars"

# 2. Install K3s on master node
ssh ec2-user@MASTER_IP
curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644

# 3. Join worker node
ssh ec2-user@WORKER_IP
curl -sfL https://get.k3s.io | K3S_URL=https://MASTER_IP:6443 K3S_TOKEN=<token> sh -

# 4. Deploy applications
kubectl apply -f k3s/applications/
kubectl apply -f k3s/ingress/

# 5. Update DNS (5 minutes downtime)
# 6. Terminate MVP instance
```

### Growth Cost Breakdown
| Service | Monthly Cost | Purpose |
|---------|--------------|---------|
| EC2 t3.small (master) | $15.33 | K3s control plane |
| EC2 t3.small (worker) | $15.33 | Application workloads |
| Application Load Balancer | $16.20 | Same as MVP |
| S3 Storage (200GB) | $4.60 | Increased assets |
| CloudFront (500GB) | $42.50 | Higher traffic |
| Route 53 | $0.50 | DNS management |
| Secrets Manager | $0.40 | Environment variables |
| CloudWatch (20GB) | $10.00 | More detailed logging |
| **Total** | **$104.86/month** | **$1,258/year** |

### Growth Features
- **Auto-scaling**: Horizontal pod autoscaling
- **Load balancing**: Kubernetes ingress
- **Health checks**: Liveness and readiness probes
- **Rolling updates**: Zero-downtime deployments
- **Resource limits**: CPU and memory management

## ⚡ Phase 3: Enterprise Scale (EKS)

**When to migrate**: $10K+ MRR, 10K+ users, team of 5+
**Infrastructure**: Managed EKS with RDS
**Estimated Cost**: $411.69/month

### Enterprise Migration Strategy
```bash
# 1. Create EKS infrastructure
cd aws/infrastructure
terraform init
terraform apply -var-file="../environments/production.tfvars"

# 2. Install cluster tools
aws eks update-kubeconfig --name barum-production
helm install external-secrets external-secrets/external-secrets
helm install aws-load-balancer-controller eks/aws-load-balancer-controller

# 3. Deploy applications
kubectl apply -f kubernetes/namespaces/
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/applications/
kubectl apply -f kubernetes/ingress/

# 4. Update DNS (30 minutes downtime)
# 5. Decommission K3s cluster
```

### Enterprise Cost Breakdown
| Service | Monthly Cost | Purpose |
|---------|--------------|---------|
| EKS Control Plane | $72.00 | Managed Kubernetes |
| EC2 t3.medium × 3 | $90.72 | 3-node cluster |
| Application Load Balancer | $16.20 | SSL + health checks |
| S3 Storage (1TB) | $23.00 | Large asset storage |
| CloudFront (2TB) | $170.00 | Global distribution |
| Route 53 | $0.50 | DNS management |
| RDS PostgreSQL (db.t3.micro) | $13.87 | Managed database |
| Secrets Manager | $0.40 | Environment variables |
| CloudWatch Enhanced | $25.00 | Detailed monitoring |
| **Total** | **$411.69/month** | **$4,940/year** |

### Enterprise Features
- **Managed Kubernetes**: EKS control plane
- **High Availability**: Multi-AZ deployment
- **Managed Database**: RDS PostgreSQL with backups
- **Auto-scaling**: Cluster autoscaler + HPA
- **Advanced Monitoring**: Enhanced CloudWatch + custom metrics
- **Security**: VPC, private subnets, IAM roles
- **Backup & Recovery**: Velero + automated snapshots

## 🔧 Environment Variables

### Required GitLab CI/CD Variables

#### AWS Configuration
```bash
AWS_ACCOUNT_ID=123456789012
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key  # Masked
```

#### Environment-Specific Variables
```bash
# MVP Environment
MVP_DOMAIN_NAME=yourdomain.com
MVP_INSTANCE_IP=1.2.3.4
TERRAFORM_STATE_BUCKET=barum-terraform-state

# SSH Configuration
SSH_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----  # Masked
SSH_KNOWN_HOSTS=1.2.3.4 ssh-rsa AAAAB3...

# Application Secrets
TF_VAR_database_url=postgresql://...
TF_VAR_jwt_secret=your-jwt-secret
TF_VAR_supabase_url=https://...
TF_VAR_supabase_anon_key=your-anon-key
TF_VAR_supabase_service_key=your-service-key  # Masked
```

#### Frontend Build Variables
```bash
# Client (React + Vite)
VITE_API_URL=https://api.yourdomain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Web-Next (Next.js)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔄 GitLab CI/CD Pipeline

### Pipeline Structure
```yaml
stages:
  - test
  - build
  - deploy_mvp
  - deploy_growth
  - deploy_production

# MVP Deployment
deploy_mvp:
  stage: deploy_mvp
  script:
    - terraform apply -var-file="environments/mvp.tfvars"
    - ./scripts/deploy-mvp.sh
  only:
    - main
  when: manual

# Growth Deployment
deploy_growth:
  stage: deploy_growth
  script:
    - terraform apply -var-file="environments/growth.tfvars"
    - ./scripts/deploy-growth.sh
  only:
    - main
  when: manual

# Production Deployment
deploy_production:
  stage: deploy_production
  script:
    - terraform apply -var-file="environments/production.tfvars"
    - ./scripts/deploy-production.sh
  only:
    - main
  when: manual
```

### Deployment Scripts

#### MVP Deployment Script
```bash
#!/bin/bash
# scripts/deploy-mvp.sh

# Build and push images
docker build -f packages/api/Dockerfile.api -t barum-api .
docker build -f packages/web-next/Dockerfile -t barum-web-next .

# Push to ECR
docker tag barum-api:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/barum-api:latest
docker tag barum-web-next:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/barum-web-next:latest

docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/barum-api:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/barum-web-next:latest

# Deploy to EC2
ssh -i ~/.ssh/barum-mvp-key ec2-user@$MVP_INSTANCE_IP << 'EOF'
  cd /opt/barum
  docker-compose -f docker-compose.prod.yml pull
  docker-compose -f docker-compose.prod.yml up -d
EOF
```

## 🛡️ Security Best Practices

### Infrastructure Security
- **VPC**: Private subnets for application servers
- **Security Groups**: Minimal required ports only (80, 443, 22)
- **IAM**: Least privilege access policies
- **SSL/TLS**: End-to-end encryption with AWS Certificate Manager
- **Secrets**: AWS Secrets Manager for sensitive data
- **Monitoring**: CloudWatch for security events

### Application Security
- **Authentication**: Supabase Auth + JWT tokens
- **Authorization**: Role-based permissions (admin, author)
- **CORS**: Restricted to known domains
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive request validation
- **Database**: Supabase RLS (Row Level Security) policies

## 📈 Monitoring & Observability

### MVP Monitoring
```bash
# Basic CloudWatch Metrics
- CPU Utilization
- Memory Usage
- Disk Space
- Network I/O

# Application Logs
- API request logs
- Error logs
- Authentication events

# Health Checks
- Load balancer health checks
- Application health endpoints
```

### Production Monitoring
```bash
# Advanced Metrics
- Custom business metrics
- APM (Application Performance Monitoring)
- Distributed tracing
- Real user monitoring

# Alerting
- PagerDuty integration
- Slack notifications
- Email alerts
- SMS for critical issues
```

## 🔄 Backup & Recovery

### MVP Backup Strategy
- **Database**: Supabase automatic backups (7 days)
- **Files**: S3 versioning enabled
- **Code**: Git repository backups
- **Infrastructure**: Terraform state backups

### Production Backup Strategy
- **Database**: RDS automated backups (30 days) + manual snapshots
- **Files**: S3 Cross-Region Replication
- **Infrastructure**: Multiple Terraform state backups
- **Disaster Recovery**: Multi-AZ deployment with failover

## 🔧 Troubleshooting

### Common Deployment Issues

#### Terraform State Lock
```bash
# If terraform state is locked
terraform force-unlock <LOCK_ID>
```

#### SSH Connection Fails
```bash
# Check SSH key permissions
chmod 600 ~/.ssh/barum-mvp-key

# Test SSH connection
ssh -i ~/.ssh/barum-mvp-key ec2-user@$INSTANCE_IP
```

#### Docker Images Not Updating
```bash
# Re-login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Force pull latest images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

#### Application Not Starting
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs -f

# Check resource usage
docker stats

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## 💰 Cost Optimization

### General Cost Savings
1. **Reserved Instances**: Save 40% with 1-year commitment
2. **Spot Instances**: Save 70% for non-critical workloads
3. **S3 Lifecycle**: Automatic tiering to reduce storage costs
4. **CloudWatch**: Use basic retention (7 days) for MVP
5. **Lambda**: Use for infrequent tasks instead of always-on instances

### Scaling Optimization
- **Auto-scaling**: Scale down during low traffic
- **Scheduled scaling**: Reduce capacity during off-hours
- **Right-sizing**: Monitor and adjust instance types
- **CDN**: Use CloudFront to reduce server load

## 🎯 Next Steps

### After MVP Deployment
1. **Monitor Performance**: Set up CloudWatch dashboards
2. **Collect Metrics**: Implement analytics and user tracking
3. **Iterate**: Based on user feedback and performance data
4. **Plan Growth**: Prepare for next phase when criteria are met

### Before Growth Migration
1. **Load Testing**: Ensure MVP can handle expected traffic
2. **Backup**: Complete backup of MVP environment
3. **Documentation**: Update runbooks and procedures
4. **Team Training**: Ensure team knows Kubernetes basics

### Before Enterprise Migration
1. **Compliance**: Implement required security measures
2. **Monitoring**: Set up comprehensive observability
3. **Disaster Recovery**: Test backup and recovery procedures
4. **Team Scaling**: Ensure adequate DevOps resources

---

**🚀 Ready to Deploy?**

Choose your deployment phase based on your current needs:
- **MVP**: Follow [Phase 1](#phase-1-mvp-deployment) for quick validation
- **Growth**: Follow [Phase 2](#phase-2-growth-scale) for scaling
- **Enterprise**: Follow [Phase 3](#phase-3-enterprise-scale) for production

For issues during deployment, check the [troubleshooting guide](./TROUBLESHOOTING.md).

## 📚 Related Documentation

- **[AWS Infrastructure](./AWS.md)** - Detailed AWS setup and Terraform configuration
- **[CI/CD Pipeline](./CICD.md)** - Complete CI/CD setup and optimization
- **[Monitoring](./MONITORING.md)** - Comprehensive monitoring and alerting setup
- **[Security](./SECURITY.md)** - Security best practices and compliance
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common deployment issues and solutions

---

**Deployment Support**: Available during business hours  
**Emergency Support**: Critical issues only  
**Documentation**: Updated with each release 