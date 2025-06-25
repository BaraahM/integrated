# Barum MVP Setup Guide

This guide walks you through setting up the MVP (Minimum Viable Product) infrastructure for Barum on AWS.

## Overview

The MVP setup uses a cost-optimized single EC2 instance with Docker Compose, designed to minimize costs while providing a solid foundation for growth.

**Estimated Cost: $44.58/month**

## Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- AWS CLI configured
- Domain name registered (can be on any registrar)

### 2. Required Tools
- Terraform >= 1.0
- Git
- SSH key pair
- Domain with Route 53 hosted zone

### 3. GitLab CI/CD Setup
- GitLab repository
- GitLab CI/CD variables configured

## Step 1: Domain and DNS Setup

### Register Domain (if not already done)
You can use any domain registrar (GoDaddy, Namecheap, etc.)

### Create Route 53 Hosted Zone
1. Go to AWS Route 53 console
2. Create a hosted zone for your domain
3. Note the Zone ID and nameservers
4. Update your domain's nameservers at your registrar

## Step 2: AWS Infrastructure Setup

### 2.1 Configure Environment Variables

Update `aws/environments/mvp.tfvars` with your actual values:

```hcl
# Basic Configuration
project_name = "barum"
environment  = "mvp"
aws_region   = "us-east-1"

# Domain Configuration
domain_name      = "yourdomain.com"        # Your actual domain
route53_zone_id  = "ZXXXXXXXXXXXXX"        # Your Route 53 zone ID

# SSH Access
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ..."  # Your public key

# Application Secrets
database_url                    = "postgresql://user:password@your-db-host:5432/barum_mvp"
jwt_secret                      = "your-super-secret-jwt-key-change-this"
supabase_url                   = "https://your-project.supabase.co"
supabase_anon_key              = "your-supabase-anon-key"
supabase_service_role_key      = "your-supabase-service-role-key"
next_public_supabase_url       = "https://your-project.supabase.co"
next_public_supabase_anon_key  = "your-supabase-anon-key"
next_public_api_url            = "https://yourdomain.com/api"
```

### 2.2 Initialize Terraform Backend

Create an S3 bucket for Terraform state:

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://barum-terraform-state-bucket

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket barum-terraform-state-bucket \
  --versioning-configuration Status=Enabled
```

### 2.3 Deploy Infrastructure

```bash
# Initialize Terraform
cd aws/infrastructure-mvp
terraform init \
  -backend-config="bucket=barum-terraform-state-bucket" \
  -backend-config="key=mvp/terraform.tfstate" \
  -backend-config="region=us-east-1"

# Plan deployment
terraform plan -var-file="../environments/mvp.tfvars"

# Apply infrastructure
terraform apply -var-file="../environments/mvp.tfvars"
```

### 2.4 Note Output Values
After successful deployment, save these outputs for GitLab CI/CD:

```bash
terraform output
```

## Step 3: GitLab CI/CD Configuration

### 3.1 Required CI/CD Variables

Add these variables in GitLab Project Settings > CI/CD > Variables:

**AWS Configuration:**
```
AWS_ACCOUNT_ID           = 123456789012
AWS_DEFAULT_REGION       = us-east-1
AWS_ACCESS_KEY_ID        = (your AWS access key)
AWS_SECRET_ACCESS_KEY    = (your AWS secret key)
```

**Environment Configuration:**
```
ENVIRONMENT              = mvp
MVP_DOMAIN_NAME         = yourdomain.com
MVP_INSTANCE_IP         = (EC2 public IP from terraform output)
CLOUDFRONT_DISTRIBUTION_ID = (from terraform output)
```

**SSH Configuration:**
```
SSH_PRIVATE_KEY         = (your private SSH key)
SSH_KNOWN_HOSTS         = (EC2 instance SSH fingerprint)
```

**Terraform State:**
```
TERRAFORM_STATE_BUCKET  = barum-terraform-state-bucket
```

### 3.2 SSH Known Hosts
Get the SSH fingerprint:

```bash
# SSH to your instance once to accept the fingerprint
ssh -i ~/.ssh/your-key.pem ec2-user@YOUR_INSTANCE_IP

# Or get it without connecting:
ssh-keyscan -H YOUR_INSTANCE_IP
```

## Step 4: First Deployment

### 4.1 Build and Push Images
The CI/CD pipeline will automatically:
1. Build Docker images for API and Web Next
2. Push images to ECR
3. Deploy to EC2 instance

### 4.2 Manual Deployment Trigger
In GitLab:
1. Go to CI/CD > Pipelines
2. Run pipeline on main branch
3. Manually trigger "deploy_mvp" job

### 4.3 Verify Deployment
Check that your application is running:

```bash
# SSH to the instance
ssh -i ~/.ssh/your-key.pem ec2-user@YOUR_INSTANCE_IP

# Check application status
cd /opt/barum
sudo ./monitor.sh

# View logs
sudo docker-compose logs
```

## Step 5: DNS Verification

### 5.1 SSL Certificate
SSL certificate will be automatically provisioned via AWS Certificate Manager and validated through Route 53.

### 5.2 Test Endpoints
After deployment, test these endpoints:

- **Main Site:** https://yourdomain.com
- **API Health:** https://yourdomain.com/api/health
- **Web App:** https://yourdomain.com (served by Web Next)

## Step 6: Monitoring and Maintenance

### 6.1 CloudWatch Monitoring
- Application logs: `/aws/ec2/barum-mvp`
- System metrics: `Barum/MVP` namespace
- Automated health checks every 15 minutes

### 6.2 Application Monitoring
```bash
# SSH to instance
ssh -i ~/.ssh/your-key.pem ec2-user@YOUR_INSTANCE_IP

# Check application health
cd /opt/barum
sudo ./monitor.sh

# View logs
sudo docker-compose logs -f

# Restart services if needed
sudo ./deploy.sh
```

### 6.3 Cost Monitoring
- Enable AWS Cost Explorer
- Set up billing alerts
- Monitor monthly usage in AWS console

## Security Considerations

### 6.1 Initial Security Setup
- SSH access is currently open (0.0.0.0/0)
- Restrict SSH access to your IP in production
- Rotate SSH keys regularly

### 6.2 Application Security
- Secrets are stored in AWS Secrets Manager
- SSL/TLS encryption enabled
- Container isolation via Docker

### 6.3 Recommended Security Enhancements
```bash
# Update EC2 security group to restrict SSH
aws ec2 modify-security-group-rules \
  --group-id sg-xxxxxxxxx \
  --security-group-rules GroupId=sg-xxxxxxxxx,SecurityGroupRuleId=sgr-xxxxxxxxx,CidrIpv4=YOUR_IP/32
```

## Troubleshooting

### Common Issues

**1. SSL Certificate Validation Failing**
- Ensure Route 53 nameservers are correctly configured
- Wait 5-10 minutes for DNS propagation

**2. Docker Images Not Found**
- Ensure ECR repositories are created
- Check GitLab CI/CD pipeline for build errors
- Verify AWS credentials in GitLab

**3. Application Not Responding**
```bash
# SSH to instance and check
sudo docker-compose ps
sudo docker-compose logs

# Restart if needed
sudo docker-compose down
sudo docker-compose up -d
```

**4. High Costs**
- Monitor EC2 instance type (should be t3.small)
- Check ALB traffic patterns
- Review CloudWatch log retention

### Health Check Commands
```bash
# Check container status
sudo docker-compose ps

# Check application health
curl http://localhost/health
curl http://localhost:4000/health
curl http://localhost:3000/health

# View resource usage
sudo docker stats
free -h
df -h
```

## Scaling Considerations

This MVP setup is designed for:
- **Traffic:** Up to 1,000 daily active users
- **Storage:** Basic application data
- **Availability:** Single instance (not high availability)

When ready to scale, consider:
1. **Phase 2:** K3s self-hosted Kubernetes (2-3 nodes)
2. **Phase 3:** Managed EKS with high availability

## Support

For issues with this setup:
1. Check AWS CloudWatch logs
2. SSH to instance and run monitoring script
3. Review GitLab CI/CD pipeline logs
4. Verify all environment variables are correct

## Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| EC2 t3.small | $15.18 |
| Application Load Balancer | $22.50 |
| Route 53 Hosted Zone | $0.50 |
| CloudWatch Logs | $0.50 |
| ECR Storage | $1.00 |
| S3 + CloudFront | $3.00 |
| Secrets Manager | $0.40 |
| Data Transfer | $1.50 |
| **Total** | **$44.58** |

This provides excellent value for an MVP with room to grow as your user base expands. 